"use client";

import * as React from "react";
import { Circle, CheckCircle2, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  tag?: string;
}

const MOCK_TODOS: Todo[] = [
  {
    id: "1",
    title: "Supabase 프로젝트 생성 및 키 발급받기",
    completed: false,
    tag: "개발",
  },
  {
    id: "2",
    title: "better-auth 구글 연동 설정하기",
    completed: false,
    tag: "개발",
  },
  {
    id: "3",
    title: "UI 컴포넌트 전체 테마 점검하기",
    completed: true,
    tag: "디자인",
  },
  { id: "4", title: "주말 여행 계획 짜기", completed: false, tag: "개인" },
  { id: "5", title: "운동 1시간 하기", completed: false, tag: "건강" },
];

export function TodoList() {
  const [todos, setTodos] = React.useState<Todo[]>(MOCK_TODOS);

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-black">
      {/* Header */}
      <div className="pt-10 px-10 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-blue-500 mb-1">
            오늘 할 일
          </h1>
          <p className="text-3xl font-bold text-slate-200 dark:text-zinc-800">
            1월 15일 수요일
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-900"
          >
            <MoreHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Todo List Content */}
      <ScrollArea className="flex-1 px-8">
        <div className="space-y-1 py-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "group flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
                todo.completed
                  ? "opacity-50"
                  : "hover:bg-slate-50 dark:hover:bg-zinc-900/50"
              )}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-blue-500 transition-colors"
              >
                {todo.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-blue-500 fill-blue-500/10" />
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </button>
              <div className="flex-1 pt-0.5">
                <span
                  className={cn(
                    "text-lg font-medium block transition-all",
                    todo.completed
                      ? "line-through text-slate-400"
                      : "text-slate-700 dark:text-slate-200"
                  )}
                >
                  {todo.title}
                </span>
                {todo.tag && (
                  <span className="text-sm text-slate-400 mt-1 inline-block">
                    #{todo.tag}
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* New Task Input Placeholder (Visual only) */}
          <div className="group flex items-center gap-4 p-4 rounded-xl cursor-text text-slate-400 hover:text-slate-500">
            <Plus className="h-6 w-6 ml-0.5" />
            <span className="text-lg font-medium">새로운 할 일 생성...</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
