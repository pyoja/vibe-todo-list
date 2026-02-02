import { ClipboardList, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddClick?: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-6 group cursor-default">
        <div className="absolute -inset-4 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />
        <div className="relative w-24 h-24 bg-slate-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-zinc-800 shadow-sm transform group-hover:-translate-y-2 transition-transform duration-500">
          <ClipboardList className="w-10 h-10 text-slate-300 dark:text-zinc-600 group-hover:text-blue-500 transition-colors duration-500" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 opacity-0 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500 delay-100" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-2">
        할 일이 깔끔하게 비웠네요!
      </h3>
      <p className="text-slate-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed">
        새로운 아이디어나 해야 할 일이 떠오르셨나요?
        <br />
        지금 바로 기록해서 머릿속을 가볍게 만드세요.
      </p>

      {onAddClick && (
        <Button
          onClick={onAddClick}
          variant="outline"
          className="rounded-full border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:shadow-md gap-2"
        >
          <PlusCircle className="w-4 h-4" />첫 번째 할 일 추가하기
        </Button>
      )}
    </div>
  );
}
