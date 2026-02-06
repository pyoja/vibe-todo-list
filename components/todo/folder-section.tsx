"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderIcon,
  LayoutGrid,
  MoreVertical,
  Pencil,
  Trash2,
  FolderPlus,
  ChevronDown,
  ChevronUp,
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
import { motion, AnimatePresence } from "framer-motion";

interface FolderSectionProps {
  folders: Folder[];
  initialTodos: Todo[]; // For counting
  folderId?: string;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onNewFolderClick: () => void;
}

// Helper to get pastel background colors
const getFolderColors = (colorName: string, isSelected: boolean) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    "blue-500": {
      bg: "bg-blue-100 dark:bg-blue-900/40",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-700",
    },
    "red-500": {
      bg: "bg-red-100 dark:bg-red-900/40",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-200 dark:border-red-700",
    },
    "orange-500": {
      bg: "bg-orange-100 dark:bg-orange-900/40",
      text: "text-orange-700 dark:text-orange-300",
      border: "border-orange-200 dark:border-orange-700",
    },
    "green-500": {
      bg: "bg-green-100 dark:bg-green-900/40",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-200 dark:border-green-700",
    },
    "purple-500": {
      bg: "bg-purple-100 dark:bg-purple-900/40",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-700",
    },
    "pink-500": {
      bg: "bg-pink-100 dark:bg-pink-900/40",
      text: "text-pink-700 dark:text-pink-300",
      border: "border-pink-200 dark:border-pink-700",
    },
    "slate-500": {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      border: "border-slate-200 dark:border-slate-700",
    },
  };

  const defaultColor = {
    bg: "bg-white dark:bg-zinc-900/80",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-200 dark:border-zinc-800",
  };
  const selectedTheme = colors[colorName] || defaultColor;

  if (isSelected) {
    return {
      container: `${selectedTheme.bg} ${selectedTheme.border} shadow-sm`,
      iconBg: "bg-white/50 dark:bg-black/20",
      iconText: selectedTheme.text,
      text: "text-zinc-900 dark:text-zinc-100",
    };
  }

  return {
    container:
      "bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconText: selectedTheme.text, // Show color in icon even when not selected
    text: "text-zinc-900 dark:text-zinc-100",
  };
};

export function FolderSection({
  folders,
  initialTodos,
  folderId,
  onEditFolder,
  onDeleteFolder,
  onNewFolderClick,
}: FolderSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Grid constants
  const INITIAL_VISIBLE_COUNT = 4; // Mobile: 2 rows of 2, Desktop: 1 row of 4 + 1(All)

  const allItems = [
    { type: "all", id: "all" },
    ...folders.map((f) => ({ type: "folder", ...f })),
    { type: "new", id: "new" },
  ];

  const visibleItems = isExpanded
    ? allItems
    : allItems.slice(0, INITIAL_VISIBLE_COUNT + 1); // +1 because we always want at least 'All' visible
  const shouldShowExpandButton = allItems.length > INITIAL_VISIBLE_COUNT + 1;

  return (
    <div className="mb-6 space-y-2">
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3"
      >
        <AnimatePresence>
          {visibleItems.map((item) => {
            if (item.type === "all") {
              return (
                <Link
                  key="all"
                  href="/"
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5",
                    !folderId
                      ? "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800 shadow-sm"
                      : "bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      !folderId
                        ? "bg-blue-500 text-white shadow-blue-200 dark:shadow-none shadow-lg"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400",
                    )}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      전체
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {initialTodos.length}개
                    </p>
                  </div>
                </Link>
              );
            }

            if (item.type === "new") {
              return (
                <button
                  key="new"
                  onClick={onNewFolderClick}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    새 폴더
                  </p>
                </button>
              );
            }

            // Normal Folder
            const folder = item as Folder & { type: string };
            const folderTodoCount = initialTodos.filter(
              (t) => t.folderId === folder.id,
            ).length;
            const isSelected = folderId === folder.id;
            const styles = getFolderColors(folder.color, isSelected);

            return (
              <div key={folder.id} className="relative group">
                <Link
                  href={`/?folderId=${folder.id}`}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5 min-h-[110px] justify-between",
                    styles.container,
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      styles.iconBg,
                    )}
                  >
                    <FolderIcon
                      className={cn(
                        "w-5 h-5",
                        isSelected ? styles.iconText : styles.iconText,
                      )}
                    />
                  </div>
                  <div className="text-center w-full">
                    <p
                      className={cn(
                        "text-sm font-semibold truncate w-full px-2",
                        styles.text,
                      )}
                    >
                      {folder.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium opacity-80">
                      {folderTodoCount}개
                    </p>
                  </div>
                </Link>

                {/* Folder Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical className="w-4 h-4 text-zinc-500" />
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
        </AnimatePresence>
      </motion.div>

      {shouldShowExpandButton && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 h-8 text-xs gap-1"
          >
            {isExpanded ? (
              <>
                접기 <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                더보기 <ChevronDown className="w-3 h-3" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
