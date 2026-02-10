"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { type Folder } from "@/app/actions/folder";
import { cn } from "@/lib/utils";

interface FolderDialogsProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  editingFolder: Folder | null;
  folderName: string;
  setFolderName: (value: string) => void;
  folderColor: string;
  setFolderColor: (value: string) => void;
  onSave: () => void;
  // by jh 20260210: 폴더 저장 중 로딩 상태
  isSaving?: boolean;
}

const COLORS = [
  { value: "blue-500", label: "Blue", bg: "bg-blue-500" },
  { value: "red-500", label: "Red", bg: "bg-red-500" },
  { value: "orange-500", label: "Orange", bg: "bg-orange-500" },
  { value: "green-500", label: "Green", bg: "bg-green-500" },
  { value: "purple-500", label: "Purple", bg: "bg-purple-500" },
  { value: "pink-500", label: "Pink", bg: "bg-pink-500" },
  { value: "slate-500", label: "Slate", bg: "bg-slate-500" },
];

export function FolderDialogs({
  isOpen,
  onClose,
  editingFolder,
  folderName,
  setFolderName,
  folderColor,
  setFolderColor,
  onSave,
  isSaving = false,
}: FolderDialogsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingFolder ? "폴더 수정" : "새 폴더 만들기"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              이름
            </Label>
            <Input
              id="name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="col-span-3"
              placeholder="폴더 이름"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">색상</Label>
            <RadioGroup
              value={folderColor}
              onValueChange={setFolderColor}
              className="col-span-3 flex flex-wrap gap-2"
            >
              {COLORS.map((color) => (
                <div key={color.value}>
                  <RadioGroupItem
                    value={color.value}
                    id={color.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={color.value}
                    className={cn(
                      "flex h-6 w-6 cursor-pointer items-center justify-center rounded-full ring-offset-2 transition-all hover:opacity-80 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-400 peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-zinc-400",
                      color.bg,
                    )}
                  >
                    <span className="sr-only">{color.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onClose(false)}>
            취소
          </Button>
          <Button
            type="submit"
            onClick={onSave}
            className="bg-blue-600"
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingFolder ? "수정" : "만들기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
