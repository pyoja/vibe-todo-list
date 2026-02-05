"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart3, Trophy, Flame } from "lucide-react";
import { getWeeklyStats, type WeeklyStats } from "@/app/actions/statistics";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function WeeklyReportDialog() {
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setLoading(true);
        const data = await getWeeklyStats();
        setStats(data);
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen]);

  // Determine encouragement level color
  const getLevelColor = (total: number) => {
    if (total === 0) return "bg-zinc-100 dark:bg-zinc-800 text-zinc-400";
    if (total < 10) return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
    if (total < 30)
      return "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600";
    return "bg-amber-100 dark:bg-amber-900/30 text-amber-600";
  };

  // Helper for heatmap intensity
  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/50";
    if (count <= 2) return "bg-blue-200 dark:bg-blue-900/50";
    if (count <= 5) return "bg-blue-400 dark:bg-blue-700/70";
    return "bg-blue-600 dark:bg-blue-500";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 h-auto self-stretch rounded-2xl px-4 flex-col gap-1 md:flex-row md:gap-2 border border-white/5 hover:border-white/20"
          title="주간 리포트"
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs md:text-sm font-medium">리포트</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden">
        <div className="p-6 pb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              이번 주 리포트
            </h2>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-zinc-400 text-sm">
              데이터를 불러오는 중...
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Summary Hero */}
              <div
                className={cn(
                  "rounded-2xl p-6 text-center space-y-2",
                  getLevelColor(stats.totalCompleted),
                )}
              >
                <div className="text-sm font-medium opacity-80 uppercase tracking-wide">
                  Total Pieces
                </div>
                <div className="text-5xl font-extrabold tracking-tight">
                  {stats.totalCompleted}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium pt-1">
                  <Flame className="w-4 h-4" />
                  {stats.trendMessage}
                </div>
              </div>

              {/* Heatmap / Chart */}
              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                    일별 활동
                  </span>
                  <span className="text-xs text-zinc-400">최근 7일</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {stats.dailyStats.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className="relative group w-full pt-[100%]">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            "absolute inset-0 rounded-lg transition-colors cursor-help",
                            getIntensityClass(day.count),
                          )}
                          title={`${day.date}: ${day.count}개`}
                        />
                      </div>
                      <span className="text-[10px] bg-transparent text-zinc-400 font-medium">
                        {day.dayName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
