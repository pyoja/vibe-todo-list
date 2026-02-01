"use client";

import { useState, useOptimistic, useRef, startTransition } from "react";
import { ProgressBar } from "@/components/progress-bar";
import {
  createTodo,
  toggleTodo,
  deleteTodo,
  type Todo,
} from "@/app/actions/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoListProps {
  initialTodos: Todo[];
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  folderId?: string;
}

export function TodoList({ initialTodos, user, folderId }: TodoListProps) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (
      state,
      newTodo:
        | Todo
        | { type: "delete"; id: string }
        | { type: "toggle"; id: string; isCompleted: boolean },
    ) => {
      // Handle actions
      if ("type" in newTodo) {
        if (newTodo.type === "delete") {
          return state.filter((t) => t.id !== newTodo.id);
        }
        if (newTodo.type === "toggle") {
          return state.map((t) =>
            t.id === newTodo.id
              ? { ...t, isCompleted: newTodo.isCompleted }
              : t,
          );
        }
        return state;
      }
      // Handle add
      return [newTodo, ...state];
    },
  );

  async function handleAdd(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content.trim()) return;

    setIsPending(true);
    formRef.current?.reset();

    const tempId = crypto.randomUUID();
    const newTodo: Todo = {
      id: tempId,
      content,
      isCompleted: false,
      createdAt: new Date(),
      userId: user.id,
      folderId: folderId || null,
    };

    startTransition(() => {
      addOptimisticTodo(newTodo);
    });

    try {
      await createTodo(content, folderId);
    } catch (e) {
      console.error(e);
      // In a real app, we might revert optimistic update here
    } finally {
      setIsPending(false);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    startTransition(() => {
      addOptimisticTodo({ type: "toggle", id, isCompleted: newStatus });
    });
    await toggleTodo(id, newStatus);
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    startTransition(() => {
      addOptimisticTodo({ type: "delete", id });
    });
    await deleteTodo(id);
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          안녕하세요, {user.name}님! 👋
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          오늘의 할 일을 직관적으로 관리해보세요.
        </p>
      </div>

      {/* Progress Section */}
      <ProgressBar
        total={optimisticTodos.length}
        completed={optimisticTodos.filter((t) => t.isCompleted).length}
      />

      {/* Input Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <form
          ref={formRef}
          action={handleAdd}
          className="relative flex gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <Input
            name="content"
            placeholder="할 일을 입력하고 엔터를 누르세요..."
            className="border-0 focus-visible:ring-0 bg-transparent text-lg h-12"
            autoComplete="off"
            disabled={isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isPending}
            className="h-12 w-12 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shrink-0"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </Button>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-3">
        {optimisticTodos.length === 0 ? (
          <div className="text-center py-20 text-zinc-400 dark:text-zinc-600 animate-in fade-in zoom-in duration-500">
            <p className="text-lg">아직 할 일이 없네요!</p>
            <p className="text-sm">위 입력창에 첫 번째 할 일을 추가해보세요.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {optimisticTodos.map((todo) => (
              <li
                key={todo.id}
                className={cn(
                  "group flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md hover:scale-[1.01]",
                  todo.isCompleted &&
                    "bg-zinc-50 dark:bg-zinc-900/30 opacity-75",
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(todo.id, todo.isCompleted)}
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      todo.isCompleted
                        ? "bg-blue-600 border-blue-600 text-white scale-110"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-blue-500",
                    )}
                  >
                    {todo.isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <span
                    className={cn(
                      "text-lg truncate transition-all duration-300 select-none cursor-pointer",
                      todo.isCompleted
                        ? "text-zinc-400 line-through decoration-zinc-400 w-full"
                        : "text-zinc-900 dark:text-zinc-100",
                    )}
                    onClick={() => handleToggle(todo.id, todo.isCompleted)}
                  >
                    {todo.content}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                  aria-label="Delete todo"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
