"use server";

import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { type SubTodo } from "./subtodo";

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
  // by jh 20260205: 서브태스크 추가
  subTodos?: SubTodo[];
  // by jh 20260205: 태그 시스템 추가
  tags?: string[];
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
      SELECT t.*, f.name as "folderName", f.color as "folderColor",
      (
        SELECT COALESCE(json_agg(st ORDER BY st."order" ASC, st."createdAt" ASC), '[]'::json)
        FROM sub_todo st
        WHERE st."todoId" = t.id
      ) as "subTodos"
      FROM todo t
      LEFT JOIN folder f ON t."folderId" = f.id

      WHERE t."userId" = $1 AND t."deleted_at" IS NULL
    `;
    // by jh 20260202: 폴더 정보 Join 및 타입 안정성 확보
    const params: (string | null)[] = [session.user.id];

    if (folderId) {
      query += ' AND t."folderId" = $2';
      params.push(folderId);
    }

    // 정렬: 사용자 지정 순서(order) -> 생성일(최신순)
    // by jh 20260206: 완료된 항목이 맨 아래로 내려가지 않도록 isCompleted 정렬 제거
    query += ' ORDER BY t."order" ASC, t."createdAt" DESC';

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
  // by jh 20260205: 태그 추가
  tags: string[] = [],
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'INSERT INTO todo (content, "userId", "folderId", priority, "dueDate", "isRecurring", "recurrencePattern", "recurrenceInterval", tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        content,
        session.user.id,
        folderId || null,
        priority,
        dueDate || null,
        isRecurring,
        recurrencePattern || null,
        recurrenceInterval,
        tags,
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

import { addDays, addWeeks, addMonths } from "date-fns";

export async function toggleTodo(id: string, isCompleted: boolean) {
  const updatedTodo = await updateTodo(id, { isCompleted });

  // by jh 20260205: 반복 일정 자동 생성 로직
  if (updatedTodo && isCompleted && updatedTodo.isRecurring) {
    try {
      let nextDueDate: Date | null = null;
      if (updatedTodo.dueDate) {
        const currentDueDate = new Date(updatedTodo.dueDate);
        const interval = updatedTodo.recurrenceInterval || 1;

        switch (updatedTodo.recurrencePattern) {
          case "daily":
            nextDueDate = addDays(currentDueDate, interval);
            break;
          case "weekly":
            nextDueDate = addWeeks(currentDueDate, interval);
            break;
          case "monthly":
            nextDueDate = addMonths(currentDueDate, interval);
            break;
        }
      }

      // 다음 일정 생성 (완료되지 않은 상태로)
      if (nextDueDate) {
        await createTodo(
          updatedTodo.content,
          updatedTodo.folderId || undefined,
          updatedTodo.priority || "medium",
          nextDueDate,
          true, // isRecurring
          updatedTodo.recurrencePattern,
          updatedTodo.recurrenceInterval || 1,
          updatedTodo.tags || [],
        );
      }
    } catch (e) {
      console.error("Failed to create next recurring todo:", e);
      // 실패하더라도 원래 투두의 완료 상태 처리는 성공한 것이므로 에러를 throw하지 않음 (선택사항)
    }
  }

  return updatedTodo;
}

// ... (deleteTodo function)
export async function deleteTodo(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'UPDATE todo SET "deleted_at" = NOW() WHERE id = $1 AND "userId" = $2 RETURNING *',
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
    const res = await pool.query(
      'UPDATE todo SET "deleted_at" = NULL WHERE id = $1 AND "userId" = $2 RETURNING *',
      [todo.id, session.user.id],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to restore todo:", error);
    throw new Error("Failed to restore todo");
  }
}

export async function getDeletedTodos(): Promise<Todo[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const query = `
      SELECT t.*, f.name as "folderName", f.color as "folderColor"
      FROM todo t
      LEFT JOIN folder f ON t."folderId" = f.id
      WHERE t."userId" = $1 AND t."deleted_at" IS NOT NULL
      ORDER BY t."deleted_at" DESC
    `;
    const res = await pool.query(query, [session.user.id]);
    return res.rows;
  } catch (error) {
    console.error("Failed to fetch deleted todos:", error);
    return [];
  }
}

export async function permanentDeleteTodo(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // Delete sub-todos first? Cascade usually handles it but explicit is safer
    await pool.query('DELETE FROM sub_todo WHERE "todoId" = $1', [id]);
    await pool.query('DELETE FROM todo WHERE id = $1 AND "userId" = $2', [
      id,
      session.user.id,
    ]);
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to permanently delete todo:", error);
    throw new Error("Failed to permanently delete todo");
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

export async function getTodosForExport() {
  const session = await getSession();
  if (!session) return [];

  try {
    const query = `
      SELECT t.*, f.name as "folderName", f.color as "folderColor",
      (
        SELECT COALESCE(json_agg(st ORDER BY st."order" ASC, st."createdAt" ASC), '[]'::json)
        FROM sub_todo st
        WHERE st."todoId" = t.id
      ) as "subTodos"
      FROM todo t
      LEFT JOIN folder f ON t."folderId" = f.id
      WHERE t."userId" = $1 AND t."deleted_at" IS NULL
      ORDER BY t."createdAt" DESC
    `;
    const res = await pool.query(query, [session.user.id]);
    return res.rows;
  } catch (error) {
    console.error("Failed to fetch todos for export:", error);
    return [];
  }
}
