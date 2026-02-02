import { cn } from "@/lib/utils";

interface ProgressBarProps {
  total: number;
  completed: number;
}

export function ProgressBar({ total, completed }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-zinc-400">
        <span className="flex items-center gap-2">
          {percent === 100 ? "🎉 달성 완료!" : "오늘의 진행률"}
        </span>
        <span className="font-bold text-slate-900 dark:text-white">
          {percent}%
        </span>
      </div>
      <div className="h-3 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden p-[2px]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden",
            percent === 100
              ? "bg-gradient-to-r from-green-400 to-emerald-500"
              : "bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-[length:200%_100%] animate-shimmer",
          )}
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 bg-white/20" />
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-zinc-500 text-right animate-in fade-in slide-in-from-top-1">
        {percent === 0 && "오늘도 힘차게 시작해봐요! 🔥"}
        {percent > 0 && percent < 50 && "시작이 반이에요! 차근차근 해봅시다 💪"}
        {percent >= 50 &&
          percent < 100 &&
          "절반 이상 왔어요! 조금만 더 힘내세요 🚀"}
        {percent === 100 && "완벽해요! 오늘 하루도 고생하셨습니다 👏"}
      </p>
    </div>
  );
}
