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
} from "lucide-react";
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

    const tempFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      userId: "optimistic",
      createdAt: new Date(),
    };

    startTransition(async () => {
      addOptimisticFolder({ type: "add", folder: tempFolder });
      try {
        await createFolder(name);
      } catch (e) {
        console.error(e);
      } finally {
        setIsCreating(false);
      }
    });
  }

  const handleUpdate = async (id: string, newName: string) => {
    startTransition(async () => {
      // Optimistic update logic is tricky here because we don't have the full folder object easily available
      // without passing it around, but we can try to find it.
      // For simplicity, we'll rely on server revalidation or try to construct optimistic object.
      // Let's just create a dummy folder obj for optimistic update or skip it for now to avoid complexity errors.
      // Actually, let's find the folder in optimisticFolders
      const folder = optimisticFolders.find((f) => f.id === id);
      if (folder) {
        addOptimisticFolder({
          type: "update",
          folder: { ...folder, name: newName },
        });
      }
      await updateFolder(id, newName);
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
              onBlur={() => !isPending && setIsCreating(false)}
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
            <FolderItem
              key={folder.id}
              folder={folder}
              isActive={currentFolderId === folder.id}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function FolderItem({
  folder,
  isActive,
  onUpdate,
  onDelete,
}: {
  folder: Folder;
  isActive: boolean;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    try {
      await onUpdate(folder.id, newName);
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
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-100 font-medium"
            : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/?folderId=${folder.id}`}
          className="flex items-center gap-2 flex-1 min-w-0 h-full"
        >
          <FolderIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate text-sm">{folder.name}</span>
        </Link>

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
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
            >
              <Pencil className="w-3 h-3" />
              <span>이름 변경</span>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>폴더 이름 변경</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="폴더 이름"
              className="col-span-3"
            />
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
