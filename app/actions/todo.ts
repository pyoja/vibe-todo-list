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
    let query = 'SELECT * FROM todo WHERE "userId" = $1';
    // by jh 20260202: any 타입 제거 및 타입 안정성 확보
    const params: (string | null)[] = [session.user.id];

    if (folderId) {
      query += ' AND "folderId" = $2';
      params.push(folderId);
    }

    // 정렬: 마감일 임박순, 그 다음 중요도, 그 다음 생성일
    query +=
      ' ORDER BY "isCompleted" ASC, "dueDate" ASC NULLS LAST, "createdAt" DESC';

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
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'INSERT INTO todo (content, "userId", "folderId", priority, "dueDate") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [content, session.user.id, folderId || null, priority, dueDate || null],
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
      (field) => (updates as Record<string, any>)[field],
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

export async function deleteTodo(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    await pool.query('DELETE FROM todo WHERE id = $1 AND "userId" = $2', [
      id,
      session.user.id,
    ]);
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete todo:", error);
    throw new Error("Failed to delete todo");
  }
}
