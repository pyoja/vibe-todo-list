import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Puzzle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TodoList } from "@/components/todo-list";
import { getTodos } from "@/app/actions/todo";

import { Sidebar } from "@/components/sidebar";
import { getFolders } from "@/app/actions/folder";

// ... existing imports ...

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ folderId?: string }>;
}) {
  const params = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    const [todos, folders] = await Promise.all([
      getTodos(params?.folderId),
      getFolders(),
    ]);

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black selection:bg-blue-100 dark:selection:bg-blue-900">
        <header className="px-6 h-16 flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Puzzle className="w-5 h-5" />
            </div>
            하루조각
          </div>
          <div className="flex gap-4 items-center">
            <ModeToggle />
            {/* Optional: Add Sign Out button logic here or in a dropdown */}
          </div>
        </header>
        <div className="flex max-w-7xl mx-auto">
          <Sidebar initialFolders={folders} />
          <main className="flex-1 py-10 px-6">
            <TodoList
              initialTodos={todos}
              user={session.user}
              folderId={params?.folderId}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Navigation (Simple) */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900/50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Puzzle className="w-5 h-5" />
          </div>
          하루조각
        </div>
        <div className="flex gap-4 items-center">
          <ModeToggle />
          <Link href="/login">
            <Button variant="ghost" className="font-medium">
              로그인
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            🚀 더 나은 생산성을 위한 새로운 경험
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
            당신의 하루를 <br className="hidden sm:block" />
            <span className="text-blue-600">조각조각 완성해보세요</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200">
            복잡한 기능은 덜어내고, 꼭 필요한 것만 남겼습니다.
            <br />
            하루조각과 함께 소중한 일상을 기록하고 관리하세요.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both delay-300">
            <Link href="/login">
              <Button
                size="lg"
                className="h-12 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="https://github.com" target="_blank">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-lg rounded-full border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900"
              >
                사용법 알아보기
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-600">
        © 2026 하루조각. All rights reserved.
      </footer>
    </div>
  );
}
