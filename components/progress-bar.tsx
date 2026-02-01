import { cn } from "@/lib/utils";

interface ProgressBarProps {
  total: number;
  completed: number;
}

export function ProgressBar({ total, completed }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full space-y-2 mb-6">
      <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-blue-600 transition-all duration-500 ease-out",
            percent === 100 && "bg-green-500",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent === 100 && total > 0 && (
        <div className="text-center text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-2">
          🎉 모두 완료했습니다! 고생하셨어요.
        </div>
      )}
    </div>
  );
}
