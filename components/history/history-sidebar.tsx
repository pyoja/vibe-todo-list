"use client";

import { Todo } from "@/app/actions/todo";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CheckCircle2, RotateCcw, X, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface HistorySidebarProps {
  completedTodos: Todo[];
  onUndo: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function HistorySidebar({
  completedTodos,
  onUndo,
  onDelete,
  onDeleteAll,
  isOpen,
  onClose,
}: HistorySidebarProps) {
  // by jh 20260213: Back button handling
  useEffect(() => {
    if (isOpen) {
      // Push state when opened
      window.history.pushState(
        { sidebar: "history" },
        "",
        window.location.href,
      );

      const handlePopState = (event: PopStateEvent) => {
        // If back button pressed, close sidebar
        onClose();
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isOpen, onClose]);

  // Group todos by date (Simplified for "Today's Record" focus)
  // In a real app, you might cluster them by time periods (Morning, Afternoon)

  // Sort by completed time (conceptually, though we use updatedAt or order)
  // Assuming 'updatedAt' or 'createdAt' is close to completion time for now.
  // Ideally, we'd have a 'completedAt' field. For now, we'll use order or just list them.
  // Let's reverse to show newest first.
  const sortedTodos = [...completedTodos].reverse();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile and desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                  완료 조각
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {completedTodos.length}개의 조각을 모았습니다.
                </p>
              </div>
              <div className="flex items-center gap-1">
                {completedTodos.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (
                        confirm(
                          "완료된 모든 조각을 삭제하시겠습니까? (복구 불가)",
                        )
                      ) {
                        onDeleteAll();
                      }
                    }}
                    className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                    title="전체 삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Timeline Content */}
            <ScrollArea className="flex-1 p-6">
              {completedTodos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-zinc-500">
                    아직 완료 조각이 없습니다.
                    <br />
                    오늘 할 일을 시작해보세요!
                  </p>
                </div>
              ) : (
                <div className="relative pl-4 space-y-8">
                  {/* Timeline Line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-zinc-100 dark:bg-zinc-800" />

                  {sortedTodos.map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="relative pl-8 group"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 bg-green-500 z-10 shadow-sm" />

                      <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-zinc-700 dark:text-zinc-200 font-medium line-through decoration-zinc-300 dark:decoration-zinc-600">
                            {todo.content}
                          </p>
                          <div className="flex items-center gap-1 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-400 hover:text-red-500"
                              onClick={() => {
                                if (confirm("정말 삭제하시겠습니까?")) {
                                  onDelete(todo.id);
                                }
                              }}
                              title="삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-zinc-400 hover:text-blue-500"
                              onClick={() => onUndo(todo.id)}
                              title="다시 하기"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                          {todo.folderName && (
                            <span
                              className={`px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 font-medium ${
                                todo.folderColor
                                  ? `text-${todo.folderColor.split("-")[0]}-600`
                                  : ""
                              }`}
                            >
                              {todo.folderName}
                            </span>
                          )}
                          {/* Use createdAt as a proxy for completion time if not available */}
                          <span>
                            {format(new Date(), "a h:mm", { locale: ko })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
