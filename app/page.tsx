import { Puzzle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TodoList } from "@/components/todo-list";
import { getTodos } from "@/app/actions/todo";
import { LandingPage } from "@/components/landing-page";
import { UserProfile } from "@/components/user-profile";

import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { getFolders } from "@/app/actions/folder";

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
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <MobileSidebar initialFolders={folders} />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Puzzle className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline">하루조각</span>
              <span className="sm:hidden">하루조각</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <ModeToggle />
            <UserProfile user={session.user} />
          </div>
        </header>
        <div className="flex max-w-7xl mx-auto">
          <Sidebar initialFolders={folders} />
          <main className="flex-1 py-4 sm:py-10 px-4 sm:px-6">
            <TodoList
              initialTodos={todos}
              folders={folders}
              user={session.user}
              folderId={params?.folderId}
            />
          </main>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
