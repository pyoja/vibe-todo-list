"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import useSound from "use-sound";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface DemoTodo {
  id: string;
  content: string;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
}

export function InteractiveDemo() {
  const [todos, setTodos] = useState<DemoTodo[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sound Effect
  const [playPop] = useSound(
    "https://pub-3626123a908346b095493b827f311c82.r2.dev/pop_c0c.mp3",
    { volume: 0.5 },
  );

  // Load from Local Storage on Mount
  useEffect(() => {
    const saved = localStorage.getItem("daypiece-guest-todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load guest todos", e);
      }
    }
  }, []);

  // Save to Local Storage on Change
  useEffect(() => {
    localStorage.setItem("daypiece-guest-todos", JSON.stringify(todos));
  }, [todos]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsPending(true);

    // Simulate network delay for realism
    setTimeout(() => {
      const newTodo: DemoTodo = {
        id: crypto.randomUUID(),
        content: inputValue.trim(),
        isCompleted: false,
        priority: "medium",
      };

      setTodos((prev) => [newTodo, ...prev]);
      setInputValue("");
      setIsPending(false);

      // Show "Sign up to save" toast on first add
      if (todos.length === 0) {
        toast("할 일이 추가되었습니다!", {
          description: "지금 가입하면 작성한 내용이 그대로 저장됩니다.",
          action: {
            label: "회원가입",
            onClick: () => (window.location.href = "/login"),
          },
          duration: 5000,
        });
      } else {
        toast.success("할 일이 추가되었습니다.");
      }
    }, 400);
  };

  const toggleTodo = (id: string, isCompleted: boolean) => {
    if (!isCompleted) playPop();

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !isCompleted } : t)),
    );

    if (!isCompleted) {
      // Confetti if completing
      const end = Date.now() + 1000;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success("삭제되었습니다.");
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="relative group z-10">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
        <form
          onSubmit={handleAdd}
          className="relative flex flex-col gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Try it now
            </label>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="오늘 어떤 멋진 일을 계획하고 계신가요?"
              className="border-0 focus-visible:ring-0 bg-transparent text-xl sm:text-2xl font-medium p-0 h-auto placeholder:text-zinc-300 dark:placeholder:text-zinc-600 selection:bg-blue-100 dark:selection:bg-blue-900 placeholder:font-normal"
              autoComplete="off"
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="flex items-center">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 font-mono">
                  Enter
                </kbd>
                <span className="hidden sm:inline ml-1">to add</span>
              </span>
            </div>

            <Button
              type="submit"
              disabled={isPending || !inputValue.trim()}
              className="h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 text-sm font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Plus className="w-4 h-4 mr-1.5" />
              )}
              추가하기
            </Button>
          </div>
        </form>
      </div>

      {/* Persistence Tip */}
      <div className="flex justify-center">
        <AnimatePresence>
          {todos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Link href="/login">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors py-1.5 px-3"
                >
                  ✨ 지금 가입하면 작성한 {todos.length}개의 할 일이 저장됩니다
                </Badge>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Todo List Preview */}
      <ul className="space-y-3">
        <AnimatePresence mode="popLayout">
          {todos.map((todo) => (
            <motion.li
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group flex items-center gap-3 p-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <button
                onClick={() => toggleTodo(todo.id, todo.isCompleted)}
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
                  todo.isCompleted
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400 dark:hover:border-blue-500",
                )}
              >
                {todo.isCompleted && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                )}
              </button>

              <span
                className={cn(
                  "flex-1 text-base transition-all truncate",
                  todo.isCompleted &&
                    "text-zinc-400 line-through decoration-zinc-400/50",
                )}
              >
                {todo.content}
              </span>

              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
