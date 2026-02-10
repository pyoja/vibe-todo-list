"use server";

import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type SubTodo = {
  id: string;
  todoId: string;
  content: string;
  isCompleted: boolean;
  createdAt: Date;
  order: number;
  // by jh 20260210: 이미지 첨부
  imageUrl?: string | null;
};

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getSubTodos(todoId: string): Promise<SubTodo[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const res = await pool.query(
      'SELECT * FROM sub_todo WHERE "todoId" = $1 ORDER BY "order" ASC, "createdAt" ASC',
      [todoId],
    );
    return res.rows;
  } catch (error) {
    console.error("Failed to fetch sub_todos:", error);
    return [];
  }
}

// by jh 20260210: imageUrl 파라미터 추가
export async function createSubTodo(
  todoId: string,
  content: string,
  imageUrl?: string | null,
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // Check if todo belongs to user (security)
    const todoCheck = await pool.query(
      'SELECT id FROM todo WHERE id = $1 AND "userId" = $2',
      [todoId, session.user.id],
    );
    if (todoCheck.rowCount === 0)
      throw new Error("Todo not found or unauthorized");

    const res = await pool.query(
      'INSERT INTO sub_todo ("todoId", content, "order", image_url) VALUES ($1, $2, (SELECT COALESCE(MAX("order"), 0) + 1 FROM sub_todo WHERE "todoId" = $1), $3) RETURNING *',
      [todoId, content, imageUrl || null],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to create sub_todo:", error);
    throw new Error("Failed to create sub_todo");
  }
}

export async function toggleSubTodo(id: string, isCompleted: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'UPDATE sub_todo SET "isCompleted" = $1 WHERE id = $2 RETURNING *',
      [isCompleted, id],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to toggle sub_todo:", error);
    throw new Error("Failed to toggle sub_todo");
  }
}

export async function deleteSubTodo(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      "DELETE FROM sub_todo WHERE id = $1 RETURNING *",
      [id],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to delete sub_todo:", error);
    throw new Error("Failed to delete sub_todo");
  }
}

export async function updateSubTodo(
  id: string,
  todoId: string,
  content: string,
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'UPDATE sub_todo SET content = $1 WHERE id = $2 AND "todoId" = $3 RETURNING *',
      [content, id, todoId],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to update sub_todo:", error);
    throw new Error("Failed to update sub_todo");
  }
}
