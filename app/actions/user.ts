"use server";

import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export async function updateProfileName(name: string) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // better-auth uses "user" table by default
    await pool.query('UPDATE "user" SET name = $1 WHERE id = $2', [
      name,
      session.user.id,
    ]);
    revalidatePath("/", "layout"); // Revalidate layout to update header/sidebar
    return { success: true };
  } catch (error) {
    console.error("Failed to update profile name:", error);
    throw new Error("Failed to update profile name");
  }
}

export interface NotificationSettings {
  pushEnabled: boolean;
  morningTime: string;
  eveningTime: string;
  weekendDnd: boolean;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const session = await getSession();
  if (!session)
    return {
      pushEnabled: false,
      morningTime: "08:00",
      eveningTime: "22:00",
      weekendDnd: true,
    };

  try {
    const res = await pool.query(
      "SELECT push_enabled, morning_time, evening_time, weekend_dnd FROM user_settings WHERE user_id = $1",
      [session.user.id],
    );

    if (res.rows.length === 0) {
      return {
        pushEnabled: false,
        morningTime: "08:00",
        eveningTime: "22:00",
        weekendDnd: true,
      };
    }

    const row = res.rows[0];
    return {
      pushEnabled: row.push_enabled,
      morningTime: row.morning_time,
      eveningTime: row.evening_time,
      weekendDnd: row.weekend_dnd,
    };
  } catch (error) {
    console.error("Failed to fetch notification settings:", error);
    return {
      pushEnabled: false,
      morningTime: "08:00",
      eveningTime: "22:00",
      weekendDnd: true,
    };
  }
}

export async function updateNotificationSettings(
  settings: NotificationSettings,
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  try {
    // Upsert logic
    const query = `
      INSERT INTO user_settings (user_id, push_enabled, morning_time, evening_time, weekend_dnd, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
        push_enabled = EXCLUDED.push_enabled,
        morning_time = EXCLUDED.morning_time,
        evening_time = EXCLUDED.evening_time,
        weekend_dnd = EXCLUDED.weekend_dnd,
        updated_at = NOW();
    `;

    await pool.query(query, [
      session.user.id,
      settings.pushEnabled,
      settings.morningTime,
      settings.eveningTime,
      settings.weekendDnd,
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    throw new Error("Failed to update notification settings");
  }
}
