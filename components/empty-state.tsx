"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  onAddClick?: () => void;
  type?: "all-clear" | "no-results" | "date-empty";
  className?: string;
}

export function EmptyState({
  onAddClick,
  type = "all-clear",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 group",
        className,
      )}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:bg-blue-500/30 transition-all duration-700"></div>
        {type === "all-clear" ? (
          <svg
            className="w-32 h-32 text-blue-500 relative z-10 drop-shadow-xl"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            <circle
              cx="12"
              cy="12"
              r="4"
              className="text-blue-300"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <path
              d="M10 12l2 2 4-4"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        ) : type === "no-results" ? (
          <svg
            className="w-32 h-32 text-zinc-400 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
            <path
              d="M9 9l4 4M9 13l4-4"
              strokeWidth="1.5"
              className="opacity-50"
            />
          </svg>
        ) : (
          <svg
            className="w-32 h-32 text-zinc-400 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )}
      </div>

      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 tracking-tight">
        {type === "all-clear"
          ? "모든 할 일을 완료했어요!"
          : type === "no-results"
            ? "검색 결과가 없어요"
            : "계획된 일정이 없어요"}
      </h3>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8 leading-relaxed font-medium">
        {type === "all-clear"
          ? "완벽한 하루네요. 새로운 목표를 세워보시겠어요?"
          : type === "no-results"
            ? "다른 키워드로 검색해보시거나 새로운 할 일을 추가해보세요."
            : "이 날은 여유로운 하루를 보내실 수 있겠네요."}
      </p>

      {onAddClick && (
        <Button
          onClick={onAddClick}
          className="rounded-full px-8 py-6 h-auto text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          새로운 할 일 추가
        </Button>
      )}
    </div>
  );
}
