"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  createFolder,
  updateFolder,
  deleteFolder,
  type Folder,
} from "@/app/actions/folder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Folder as FolderIcon,
  Plus,
  LayoutGrid,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Check,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface SidebarProps {
  initialFolders: Folder[];
  className?: string;
}

const FOLDER_COLORS = [
  {
    name: "Blue",
    value: "blue-500",
    class: "text-blue-500",
    bg: "bg-blue-500",
  },
  { name: "Red", value: "red-500", class: "text-red-500", bg: "bg-red-500" },
  {
    name: "Orange",
    value: "orange-500",
    class: "text-orange-500",
    bg: "bg-orange-500",
  },
  {
    name: "Green",
    value: "green-500",
    class: "text-green-500",
    bg: "bg-green-500",
  },
  {
    name: "Purple",
    value: "purple-500",
    class: "text-purple-500",
    bg: "bg-purple-500",
  },
  {
    name: "Pink",
    value: "pink-500",
    class: "text-pink-500",
    bg: "bg-pink-500",
  },
  {
    name: "Slate",
    value: "slate-500",
    class: "text-slate-500",
    bg: "bg-slate-500",
  },
];

export function Sidebar({ initialFolders, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex w-64 bg-slate-50/50 dark:bg-zinc-900/50 border-r border-slate-200 dark:border-zinc-800 flex-shrink-0 flex-col h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300",
        className,
      )}
    >
      <SidebarContent initialFolders={initialFolders} />
    </aside>
  );
}

export function MobileSidebar({ initialFolders }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden -ml-2">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800">
          <SheetTitle className="text-left flex items-center gap-2">
            하루조각
          </SheetTitle>
        </SheetHeader>
        <SidebarContent
          initialFolders={initialFolders}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}

interface SidebarContentProps {
  initialFolders: Folder[];
  onNavigate?: () => void;
}

function SidebarContent({ initialFolders, onNavigate }: SidebarContentProps) {
  const searchParams = useSearchParams();
  const currentFolderId = searchParams.get("folderId");
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderColor, setNewFolderColor] = useState("blue-500");

  const [optimisticFolders, addOptimisticFolder] = useOptimistic(
    initialFolders,
    (
      state,
      action: {
        type: "add" | "update" | "delete";
        folder?: Folder;
        id?: string;
      },
    ) => {
      switch (action.type) {
        case "add":
          return [...state, action.folder!];
        case "update":
          return state.map((f) =>
            f.id === action.folder!.id ? action.folder! : f,
          );
        case "delete":
          return state.filter((f) => f.id !== action.id);
        default:
          return state;
      }
    },
  );

  async function handleCreateFolder(formData: FormData) {
    const name = formData.get("name") as string;
    if (!name.trim()) return;

    setIsCreating(true);
    formRef.current?.reset();

    const color = newFolderColor;
    setNewFolderColor("blue-500");

    const tempFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      userId: "optimistic",
      createdAt: new Date(),
      color: color,
    };

    startTransition(async () => {
      addOptimisticFolder({ type: "add", folder: tempFolder });
      try {
        await createFolder(name, color);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCreating(false);
      }
    });
  }

  const handleUpdate = async (
    id: string,
    newName: string,
    newColor: string,
  ) => {
    startTransition(async () => {
      const folder = optimisticFolders.find((f) => f.id === id);
      if (folder) {
        addOptimisticFolder({
          type: "update",
          folder: { ...folder, name: newName, color: newColor },
        });
      }
      await updateFolder(id, { name: newName, color: newColor });
    });
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("정말 삭제하시겠습니까? 안의 할 일들도 모두 삭제될 수 있습니다.")
    )
      return;
    startTransition(async () => {
      addOptimisticFolder({ type: "delete", id });
      await deleteFolder(id);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-zinc-900/50">
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
            className="px-2 mb-2 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-sm animate-in slide-in-from-top-2 duration-200 space-y-3"
          >
            <Input
              name="name"
              placeholder="Folder name"
              className="h-8 text-sm"
              autoFocus
              autoComplete="off"
            />
            <div className="flex flex-wrap gap-1.5">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setNewFolderColor(c.value)}
                  className={cn(
                    "w-4 h-4 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400",
                    c.bg,
                    newFolderColor === c.value
                      ? "scale-110 ring-2 ring-offset-1 ring-slate-400"
                      : "opacity-70 hover:opacity-100",
                  )}
                  title={c.name}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setIsCreating(false)}
              >
                취소
              </Button>
              <Button type="submit" size="sm" className="h-7 text-xs">
                생성
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-1">
          <div onClick={onNavigate}>
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
          </div>
          {optimisticFolders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isActive={currentFolderId === folder.id}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FolderItem({
  folder,
  isActive,
  onUpdate,
  onDelete,
  onNavigate,
}: {
  folder: Folder;
  isActive: boolean;
  onUpdate: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNavigate?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [newColor, setNewColor] = useState(folder.color || "blue-500");
  const [isUpdating, setIsUpdating] = useState(false);

  const activeColor =
    FOLDER_COLORS.find((c) => c.value === (folder.color || "blue-500")) ||
    FOLDER_COLORS[0];

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(folder.id, newName, newColor);
      setIsDialogOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group flex items-center justify-between w-full h-9 rounded-md px-4 transition-colors relative",
          isActive
            ? cn(
                "font-medium",
                `bg-${activeColor.value.split("-")[0]}-100 text-${activeColor.value.split("-")[0]}-700`,
                `dark:bg-${activeColor.value.split("-")[0]}-900/30 dark:text-${activeColor.value.split("-")[0]}-100`,
              )
            : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div onClick={onNavigate} className="flex-1 min-w-0 h-full">
          <Link
            href={`/?folderId=${folder.id}`}
            className="flex items-center gap-2 w-full h-full"
          >
            <FolderIcon
              className={cn(
                "w-4 h-4 flex-shrink-0 transition-colors",
                activeColor.class,
              )}
            />
            <span className="truncate text-sm">{folder.name}</span>
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100",
                isHovered ? "opacity-100" : "",
              )}
            >
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => {
                setNewName(folder.name);
                setNewColor(folder.color || "blue-500");
                setIsDialogOpen(true);
              }}
              className="gap-2"
            >
              <Pencil className="w-3 h-3" />
              <span>수정</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(folder.id)}
              className="gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <Trash2 className="w-3 h-3" />
              <span>삭제</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* ... Dialog Content ... (reuse previous code) */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>폴더 수정</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">이름</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="폴더 이름"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500">색상</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setNewColor(c.value)}
                    className={cn(
                      "w-6 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 flex items-center justify-center",
                      c.bg,
                      newColor === c.value
                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                        : "opacity-70 hover:opacity-100",
                    )}
                    title={c.name}
                  >
                    {newColor === c.value && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isUpdating}
            >
              취소
            </Button>
            <Button
              onClick={handleUpdateClick}
              disabled={!newName.trim() || isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
