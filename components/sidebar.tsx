"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createFolder, type Folder } from "@/app/actions/folder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder as FolderIcon, Plus, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  initialFolders: Folder[];
}

export function Sidebar({ initialFolders }: SidebarProps) {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [optimisticFolders, addOptimisticFolder] = useOptimistic(
    initialFolders,
    (state, newFolder: Folder) => [...state, newFolder],
  );

  async function handleCreateFolder(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name.trim()) return;

    setIsCreating(true);
    formRef.current?.reset();

    const tempFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      userId: "optimistic",
      createdAt: new Date(),
    };

    startTransition(async () => {
      addOptimisticFolder(tempFolder);
      try {
        await createFolder(name);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCreating(false);
      }
    });
  }

  return (
    <aside className="w-64 bg-slate-50/50 dark:bg-zinc-900/50 border-r border-slate-200 dark:border-zinc-800 flex-shrink-0 flex flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300">
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Folders
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-slate-200 dark:hover:bg-zinc-800"
            onClick={() => setIsCreating(true)}
            disabled={isCreating}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {isCreating && (
          <form
            ref={formRef}
            action={handleCreateFolder}
            className="px-2 mb-2 animate-in slide-in-from-top-2 duration-200"
          >
            <Input
              name="name"
              placeholder="Folder name"
              className="h-8 text-sm bg-white dark:bg-zinc-900"
              autoFocus
              onBlur={() => !isPending && setIsCreating(false)} // Optional: close on blur if empty
              autoComplete="off"
            />
          </form>
        )}

        <div className="space-y-1">
          <Link href="/">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-9",
                !currentFolderId &&
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100",
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              전체 보기
            </Button>
          </Link>
          {optimisticFolders.map((folder) => (
            <Link key={folder.id} href={`/?folderId=${folder.id}`}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 h-9 font-normal",
                  currentFolderId === folder.id &&
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 font-medium",
                )}
              >
                <FolderIcon className="w-4 h-4" />
                <span className="truncate">{folder.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
