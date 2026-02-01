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
    const params: any[] = [session.user.id];

    if (folderId) {
      query += ' AND "folderId" = $2';
      params.push(folderId);
    } else {
      // If no folderId is provided (e.g. "All" view), show all todos
      // Or if you want "Inbox" behavior (folderId IS NULL), change this logic.
      // Current requirement: "Filter by folder", "All items view".
      // So if folderId is undefined, we return all (no extra WHERE clause).
    }

    query += ' ORDER BY "createdAt" DESC';

    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return [];
  }
}

export async function createTodo(content: string, folderId?: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'INSERT INTO todo (content, "userId", "folderId") VALUES ($1, $2, $3) RETURNING *',
      [content, session.user.id, folderId || null],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to create todo:", error);
    throw new Error("Failed to create todo");
  }
}

export async function toggleTodo(id: string, isCompleted: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    await pool.query(
      'UPDATE todo SET "isCompleted" = $1 WHERE id = $2 AND "userId" = $3',
      [isCompleted, id, session.user.id],
    );
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to toggle todo:", error);
    throw new Error("Failed to toggle todo");
  }
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
