"use client";

import Link from "next/link";
import {
  FolderIcon,
  LayoutGrid,
  MoreVertical,
  Pencil,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { type Folder } from "@/app/actions/folder";
import { type Todo } from "@/app/actions/todo";

interface FolderSectionProps {
  folders: Folder[];
  initialTodos: Todo[]; // For counting
  folderId?: string;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onNewFolderClick: () => void;
}

export function FolderSection({
  folders,
  initialTodos,
  folderId,
  onEditFolder,
  onDeleteFolder,
  onNewFolderClick,
}: FolderSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
        {/* All Todos Card */}
        <Link
          href="/"
          className={cn(
            "flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[120px] hover:shadow-lg",
            !folderId
              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 shadow-md"
              : "bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700",
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              !folderId
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400",
            )}
          >
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              전체
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {initialTodos.length}개
            </p>
          </div>
        </Link>

        {/* Folder Cards */}
        {folders.map((folder) => {
          const folderTodoCount = initialTodos.filter(
            (t) => t.folderId === folder.id,
          ).length;
          const isSelected = folderId === folder.id;

          return (
            <div key={folder.id} className="relative group flex-shrink-0">
              <Link
                href={`/?folderId=${folder.id}`}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[120px] hover:shadow-lg",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-400 shadow-md"
                    : "bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700",
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isSelected
                      ? `bg-${folder.color} text-white`
                      : "bg-zinc-100 dark:bg-zinc-800",
                  )}
                  style={
                    isSelected
                      ? {
                          backgroundColor: folder.color.includes("-")
                            ? `rgb(var(--${folder.color.replace("-", "-")}))`
                            : folder.color,
                        }
                      : undefined
                  }
                >
                  <FolderIcon
                    className={cn(
                      "w-6 h-6",
                      isSelected
                        ? "text-white"
                        : `text-${folder.color} dark:text-${folder.color}`,
                    )}
                    style={
                      !isSelected
                        ? {
                            color: folder.color.includes("-")
                              ? `rgb(var(--${folder.color.replace("-", "-")}))`
                              : folder.color,
                          }
                        : undefined
                    }
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[100px]">
                    {folder.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {folderTodoCount}개
                  </p>
                </div>
              </Link>
              {/* Folder Menu - Shows on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditFolder(folder)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      이름 변경
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteFolder(folder.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}

        {/* New Folder Card */}
        <button
          onClick={onNewFolderClick}
          className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/80 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all min-w-[120px] hover:shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              새 폴더
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
