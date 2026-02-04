"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Sun, Moon, CloudSun, CheckCircle2, ListTodo } from "lucide-react";
import { WeeklyReportDialog } from "@/components/weekly-report";

interface DashboardHeaderProps {
  userName: string;
  totalTodos: number;
  completedTodos: number;
}

export function DashboardHeader({
  userName,
  totalTodos,
  completedTodos,
}: DashboardHeaderProps) {
  const [greeting, setGreeting] = useState("");
  const [icon, setIcon] = useState<React.ReactNode>(null);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("좋은 아침입니다");
        setIcon(<Sun className="w-5 h-5 text-orange-400" />);
      } else if (hour < 18) {
        setGreeting("활기찬 오후예요");
        setIcon(<CloudSun className="w-5 h-5 text-yellow-400" />);
      } else {
        setGreeting("편안한 저녁 되세요");
        setIcon(<Moon className="w-5 h-5 text-indigo-400" />);
      }
    };
    updateGreeting();
  }, []);

  const progress =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-zinc-900 dark:to-zinc-800 p-8 shadow-xl text-white mb-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-blue-400/20 blur-2xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        {/* Left: Greeting & Date */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-100/90 text-sm font-medium uppercase tracking-wide">
            {new Date().toLocaleDateString("en-US", { weekday: "long" })}
            <span className="w-1 h-1 rounded-full bg-blue-300"></span>
            {format(new Date(), "M월 d일", { locale: ko })}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {greeting}, <br className="md:hidden" />
            <span className="text-blue-200 inline-block">{userName}</span>님.
          </h1>
          <p className="text-blue-100/80 text-sm md:text-lg flex items-center gap-2 mt-1 break-keep">
            {icon}
            오늘은 어떤 하루를 그리고 계신가요?
          </p>
        </div>

        {/* Right: Summary Card */}
        <div className="flex items-center gap-2">
          <WeeklyReportDialog />

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[200px]">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-blue-200 font-medium">
                오늘의 진행률
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{progress}%</span>
                <span className="text-sm text-blue-200">완료</span>
              </div>
            </div>

            <div className="h-10 w-px bg-white/20 mx-2"></div>

            <div className="flex flex-col gap-1 items-end flex-1">
              <div className="flex items-center gap-1.5 text-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs">{completedTodos} 완료</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-100">
                <ListTodo className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {totalTodos - completedTodos} 남음
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
