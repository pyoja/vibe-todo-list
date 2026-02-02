"use server";

import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type Folder = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
};

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function getFolders(): Promise<Folder[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const res = await pool.query(
      'SELECT * FROM folder WHERE "userId" = $1 ORDER BY "createdAt" ASC',
      [session.user.id],
    );
    return res.rows;
  } catch (error) {
    console.error("Failed to fetch folders:", error);
    return [];
  }
}

export async function createFolder(name: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'INSERT INTO folder (name, "userId") VALUES ($1, $2) RETURNING *',
      [name, session.user.id],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to create folder:", error);
    throw new Error("Failed to create folder");
  }
}

export async function updateFolder(id: string, name: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    const res = await pool.query(
      'UPDATE folder SET name = $1 WHERE id = $2 AND "userId" = $3 RETURNING *',
      [name, id, session.user.id],
    );
    revalidatePath("/");
    return res.rows[0];
  } catch (error) {
    console.error("Failed to update folder:", error);
    throw new Error("Failed to update folder");
  }
}

export async function deleteFolder(id: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    await pool.query('DELETE FROM folder WHERE id = $1 AND "userId" = $2', [
      id,
      session.user.id,
    ]);
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to delete folder:", error);
    throw new Error("Failed to delete folder");
  }
}
