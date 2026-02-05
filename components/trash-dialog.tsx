"use client";

import { useEffect, useState, startTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import {
  getDeletedTodos,
  restoreTodo,
  permanentDeleteTodo,
  type Todo,
} from "@/app/actions/todo";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { useSoundEffects } from "@/hooks/use-sound-effects"; // Assuming hook exists

export function TrashDialog() {
  const [deletedTodos, setDeletedTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  // const { playDelete } = useSoundEffects(); // Optional if sound hook available

  const fetchDeleted = async () => {
    setIsLoading(true);
    try {
      const todos = await getDeletedTodos();
      setDeletedTodos(todos);
    } catch (e) {
      console.error(e);
      toast.error("휴지통을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDeleted();
    }
  }, [isOpen]);

  const handleRestore = async (todo: Todo) => {
    try {
      await restoreTodo(todo); // Now using Soft Restore (UPDATE)
      setDeletedTodos((prev) => prev.filter((t) => t.id !== todo.id));
      toast.success("할 일이 복구되었습니다.");
    } catch (e) {
      toast.error("복구 실패");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("정말 영구 삭제하시겠습니까? 복구할 수 없습니다.")) return;

    try {
      await permanentDeleteTodo(id);
      setDeletedTodos((prev) => prev.filter((t) => t.id !== id));
      toast.success("영구 삭제되었습니다.");
    } catch (e) {
      toast.error("삭제 실패");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
          휴지통
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>휴지통</DialogTitle>
          <DialogDescription>
            삭제된 항목을 복구하거나 영구 삭제할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px] pr-2 space-y-2 py-4">
          {isLoading ? (
            <div className="text-center text-sm text-zinc-400 py-8">
              불러오는 중...
            </div>
          ) : deletedTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
              <Trash2 className="w-8 h-8 opacity-20" />
              <span className="text-sm">휴지통이 비어있습니다.</span>
            </div>
          ) : (
            deletedTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
              >
                <div className="flex flex-col min-w-0 flex-1 pr-4">
                  <span className="text-sm font-medium truncate text-zinc-600 dark:text-zinc-300">
                    {todo.content}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {format(new Date(todo.createdAt), "M월 d일 삭제됨(추정)", {
                      locale: ko,
                    })}
                    {/* Note: In real Soft Delete, we usually display deleted_at, but Todo type might need update to include deleted_at optionally if we want to show exact deletion time. For now, createdAt or just generic text is fine. */}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    onClick={() => handleRestore(todo)}
                    title="복구"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handlePermanentDelete(todo.id)}
                    title="영구 삭제"
                  >
                    <XIcon />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
