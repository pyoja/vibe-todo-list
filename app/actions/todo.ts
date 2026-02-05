"use server";

import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type Todo = {
  id: string;
  content: string;
  isCompleted: boolean;
  createdAt: Date;
  userId: string;
  folderId?: string | null;
  priority?: "low" | "medium" | "high";
  dueDate?: Date | null;
  folderName?: string;
  folderColor?: string;
  order: number;
  // by jh 20260205: 반복 일정 필드 추가
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly" | null;
  recurrenceInterval?: number | null;
};

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getTodos(folderId?: string): Promise<Todo[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    let query = `
      SELECT t.*, f.name as "folderName", f.color as "folderColor"
      FROM todo t
      LEFT JOIN folder f ON t."folderId" = f.id
      WHERE t."userId" = $1
    `;
    // by jh 20260202: 폴더 정보 Join 및 타입 안정성 확보
    const params: (string | null)[] = [session.user.id];

    if (folderId) {
      query += ' AND t."folderId" = $2';
      params.push(folderId);
    }

    // 정렬: 완료 여부(미완료 우선) -> 사용자 지정 순서(order) -> 생성일(최신순)
    // order 컬럼이 새로 추가되었으므로 0일 수 있음.
    query += ' ORDER BY t."isCompleted" ASC, t."order" ASC, t."createdAt" DESC';

    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return [];
  }
}

export async function createTodo(
  content: string,
  folderId?: string,
  priority: string = "medium",
  dueDate?: Date | null,
  // by jh 20260205: 반복 설정 파라미터 추가
  isRecurring: boolean = false,
  recurrencePattern?: "daily" | "weekly" | "monthly" | null,
  recurrenceInterval: number = 1,
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'INSERT INTO todo (content, "userId", "folderId", priority, "dueDate", "isRecurring", "recurrencePattern", "recurrenceInterval") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        content,
        session.user.id,
        folderId || null,
        priority,
        dueDate || null,
        isRecurring,
        recurrencePattern || null,
        recurrenceInterval,
      ],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to create todo:", error);
    throw new Error("Failed to create todo");
  }
}

export async function updateTodo(
  id: string,
  updates: Partial<Omit<Todo, "id" | "userId" | "createdAt">>,
): Promise<Todo | undefined> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // 동적 쿼리 생성
    const fields = Object.keys(updates).filter(
      (key) => key !== "id" && key !== "userId",
    );
    if (fields.length === 0) return;

    // TypeScript 타입 가드 대신 명시적 캐스팅을 피하기 위해 인덱스 기반 접근 사용
    const setClause = fields
      .map((field, idx) => `"${field}" = $${idx + 1}`)
      .join(", ");
    const values = fields.map(
      (field) => updates[field as keyof typeof updates],
    );
    const query = `UPDATE todo SET ${setClause} WHERE id = $${fields.length + 1} AND "userId" = $${fields.length + 2} RETURNING *`;

    const res = await pool.query(query, [...values, id, session.user.id]);
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to update todo:", error);
    throw new Error("Failed to update todo");
  }
}

export async function toggleTodo(id: string, isCompleted: boolean) {
  return updateTodo(id, { isCompleted });
}

// ... (deleteTodo function)
export async function deleteTodo(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'DELETE FROM todo WHERE id = $1 AND "userId" = $2 RETURNING *',
      [id, session.user.id],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to delete todo:", error);
    throw new Error("Failed to delete todo");
  }
}

export async function restoreTodo(todo: Todo) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // Restore with original ID and CreatedAt if possible, or new ones if conflict.
    // Here we force insert including ID.
    const query = `
      INSERT INTO todo (id, content, "isCompleted", "createdAt", "userId", "folderId", priority, "dueDate", "order")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [
      todo.id,
      todo.content,
      todo.isCompleted,
      todo.createdAt,
      session.user.id,
      todo.folderId || null,
      todo.priority || "medium",
      todo.dueDate || null,
      todo.order || 0,
    ];

    const res = await pool.query(query, params);
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to restore todo:", error);
    throw new Error("Failed to restore todo");
  }
}

export async function reorderTodos(items: { id: string; order: number }[]) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // 트랜잭션 대신 병렬 처리로 성능 우선
    await Promise.all(
      items.map((item) =>
        pool.query(
          'UPDATE todo SET "order" = $1 WHERE id = $2 AND "userId" = $3',
          [item.order, item.id, session.user.id],
        ),
      ),
    );
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to reorder todos:", error);
    throw new Error("Failed to reorder todos");
  }
}
