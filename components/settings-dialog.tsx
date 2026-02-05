"use client";

import { useState } from "react";
import { Download, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTodoManager } from "@/hooks/use-todo-manager";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type Todo } from "@/app/actions/todo";

export function SettingsDialog({ initialTodos }: { initialTodos: Todo[] }) {
  const { todos } = useTodoManager({ initialTodos });
  const [isOpen, setIsOpen] = useState(false);

  // by jh 20260205: Data Export
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(todos, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `vibe-todo-backup-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      toast.success("백업 파일이 다운로드되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("내보내기 실패");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="설정"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
          <DialogDescription>
            앱의 환경설정 및 데이터 관리를 할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Data Backup */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="export-mode" className="text-base">
                데이터 내보내기
              </Label>
              <span className="text-xs text-zinc-500">
                현재 투두 리스트를 JSON 파일로 백업합니다.
              </span>
            </div>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              내보내기
            </Button>
          </div>

          {/* Sound Settings Placeholder (Will be connected later) */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="sound-mode" className="text-base">
                효과음
              </Label>
              <span className="text-xs text-zinc-500">준비 중입니다.</span>
            </div>
            <Switch id="sound-mode" disabled checked={true} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
