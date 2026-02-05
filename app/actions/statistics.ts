"use server";

import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

export type DailyStat = {
  date: string;
  count: number;
  dayName: string;
};

export type WeeklyStats = {
  totalCompleted: number;
  dailyStats: DailyStat[];
  trendMessage: string;
  trendPercentage: number;
  tagStats: { tag: string; count: number }[];
};

export async function getWeeklyStats(): Promise<WeeklyStats> {
  const session = await getSession();
  if (!session) {
    return {
      totalCompleted: 0,
      dailyStats: [],
      trendMessage: "로그인이 필요합니다.",
      trendPercentage: 0,
      tagStats: [],
    };
  }

  try {
    const today = new Date();
    // Get last 7 days including today
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(today, 6 - i);
      return {
        date: format(d, "yyyy-MM-dd"),
        dayName: format(d, "EEE"), // Mon, Tue...
        start: startOfDay(d).toISOString(),
        end: endOfDay(d).toISOString(),
      };
    });

    const startDate = days[0].start;
    const endDate = days[6].end;

    // Fetch counts for this range
    const query = `
      SELECT DATE(t."createdAt") as date, COUNT(*) as count
      FROM todo t
      WHERE t."userId" = $1
      AND t."isCompleted" = true
      AND t."createdAt" >= $2
      AND t."createdAt" <= $3
      GROUP BY DATE(t."createdAt")
    `;

    const res = await pool.query(query, [session.user.id, startDate, endDate]);

    // Map database results to the 7-day array
    const dailyStats: DailyStat[] = days.map((day) => {
      // Note: Postgres DATE returns string "YYYY-MM-DD" usually, but timezone might matter.
      // Comparing strictly by string date part from ISO might be safer if we handle timezone correctly.
      // For simplicity in this vibe-coding context, we match YYYY-MM-DD string.
      const found = res.rows.find((row) => {
        // row.date might be a Date object depending on driver config, or string.
        // kysely/pg usually returns Date object for timestamp, string for date type?
        // Let's assume Date object or try to parse.
        const d = new Date(row.date);
        return format(d, "yyyy-MM-dd") === day.date;
      });
      return {
        date: day.date,
        dayName: day.dayName,
        count: found ? Number(found.count) : 0,
      };
    });

    const totalCompleted = dailyStats.reduce(
      (acc, curr) => acc + curr.count,
      0,
    );

    // 4. Tag Analysis
    const tagQuery = `
      SELECT tag, COUNT(*) as count
      FROM (
        SELECT UNNEST(tags) as tag
        FROM todo
        WHERE "userId" = $1
        AND "isCompleted" = true
        AND "createdAt" >= $2
        AND "createdAt" <= $3
      ) t
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 5
    `;
    const tagRes = await pool.query(tagQuery, [
      session.user.id,
      startDate,
      endDate,
    ]);
    const tagStats = tagRes.rows.map((row) => ({
      tag: row.tag as string,
      count: Number(row.count),
    }));

    // 5. Weekly Trend (Compare with previous period)
    const prevStartDate = subDays(new Date(startDate), 7).toISOString();
    const prevEndDate = subDays(new Date(endDate), 7).toISOString();

    const prevQuery = `
      SELECT COUNT(*) as count
      FROM todo
      WHERE "userId" = $1
      AND "isCompleted" = true
      AND "createdAt" >= $2
      AND "createdAt" <= $3
    `;
    const prevRes = await pool.query(prevQuery, [
      session.user.id,
      prevStartDate,
      prevEndDate,
    ]);
    const prevTotal = Number(prevRes.rows[0].count);

    let trendPercentage = 0;
    let trendMessage = "지난주와 비슷해요.";

    if (prevTotal === 0) {
      if (totalCompleted > 0) {
        trendPercentage = 100;
        trendMessage = "지난주보다 훨씬 활기차네요! 🚀";
      } else {
        trendMessage = "아직 기록이 부족해요. 시작해보세요!";
      }
    } else {
      trendPercentage = Math.round(
        ((totalCompleted - prevTotal) / prevTotal) * 100,
      );
      if (trendPercentage > 0) {
        trendMessage = `지난주보다 ${trendPercentage}% 더 성장했어요! 🔥`;
      } else if (trendPercentage < 0) {
        trendMessage = "조금만 더 힘내볼까요? 💪";
      }
    }

    return {
      totalCompleted,
      dailyStats,
      trendMessage,
      trendPercentage,
      tagStats,
    };
  } catch (error) {
    console.error("Failed to fetch statistics:", error);
    return {
      totalCompleted: 0,
      dailyStats: [],
      trendMessage: "데이터를 불러올 수 없습니다.",
      trendPercentage: 0,
      tagStats: [],
    };
  }
}
