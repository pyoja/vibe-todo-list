"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Sun, Moon, CloudSun, CheckCircle2, ListTodo } from "lucide-react";

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
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-100/90 text-sm font-medium tracking-wide">
            {format(new Date(), "yyyy년 M월 d일 EEEE", { locale: ko })}
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white mb-2">
              {greeting},
            </h1>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-blue-200">
              {userName}님.
            </h1>
          </div>
          <p className="text-blue-100/80 text-sm md:text-lg flex items-center gap-2 mt-1 break-keep">
            {icon}
            오늘은 어떤 하루를 그리고 계신가요?
          </p>
        </div>

        {/* Right: Summary Card */}
        <div className="flex flex-col gap-3 w-full md:w-auto items-end">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full md:w-auto md:min-w-[320px]">
            <div className="flex flex-col gap-1 min-w-[120px]">
              <span className="text-xs text-blue-200 font-medium">
                오늘의 진행률
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tighter">
                  {progress}%
                </span>
                <span className="text-sm text-blue-200 font-medium">완료</span>
              </div>
            </div>

            <div className="hidden sm:block h-12 w-px bg-white/10 mx-2"></div>

            <div className="flex flex-row sm:flex-col gap-4 sm:gap-2 items-center sm:items-start flex-1 w-full sm:w-auto justify-between sm:justify-center">
              <div className="flex items-center gap-3 text-blue-50 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs opacity-70 whitespace-nowrap">
                  완료 조각
                </span>
                <div className="inline-flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-base leading-none">
                    {completedTodos}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-blue-50 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-xs opacity-70 whitespace-nowrap">
                  남은 조각
                </span>
                <div className="inline-flex items-center gap-1.5 font-bold">
                  <ListTodo className="w-4 h-4" />
                  <span className="text-base leading-none">
                    {totalTodos - completedTodos}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
