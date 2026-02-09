"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import useSound from "use-sound";
import {
  Check,
  Trash2,
  Calendar as CalendarIcon,
  GripVertical,
  Plus,
  Loader2,
  Folder as FolderIcon,
  Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ko } from "date-fns/locale";
import { format } from "date-fns";

// Helper functions for styles (copied from sortable-todo-item.tsx)
const getDateColor = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (date < today && !isToday)
    return "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20";
  if (isToday)
    return "text-orange-500 border-orange-200 bg-orange-50 dark:bg-orange-900/20";
  return "text-zinc-500 border-zinc-200 bg-zinc-50 dark:bg-zinc-800";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  // Check for tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  if (isToday) return "오늘";
  if (isTomorrow) return "내일";
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const FOLDER_COLORS: Record<string, string> = {
  "blue-500":
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "red-500": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "orange-500":
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  "green-500":
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "purple-500":
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

interface DemoTodo {
  id: string;
  content: string;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  folderName?: string;
  folderColor?: string;
  tags?: string[];
}

const INITIAL_TODOS: DemoTodo[] = [
  {
    id: "1",
    content: "팀 주간 회의 준비 (발표 자료 정리)",
    isCompleted: false,
    priority: "high",
    dueDate: new Date().toISOString(),
    folderName: "업무",
    folderColor: "blue-500",
    tags: ["회의", "발표"],
  },
  {
    id: "2",
    content: "비타민 영양제 주문하기",
    isCompleted: false,
    priority: "medium",
    folderName: "개인",
    folderColor: "green-500",
    tags: ["쇼핑", "건강"],
  },
  {
    id: "3",
    content: "저녁 러닝 5km 뛰기",
    isCompleted: true,
    priority: "low",
    dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    folderName: "운동",
    folderColor: "orange-500",
  },
];

const MOCK_FOLDERS = [
  { id: "work", name: "업무", color: "blue-500" },
  { id: "personal", name: "개인", color: "green-500" },
  { id: "health", name: "운동", color: "orange-500" },
];

export function InteractiveDemo() {
  const [todos, setTodos] = useState<DemoTodo[]>(INITIAL_TODOS);
  const [inputValue, setInputValue] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  const [playPop] = useSound(
    "https://pub-3626123a908346b095493b827f311c82.r2.dev/pop_c0c.mp3",
    { volume: 0.5 },
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (addedCount >= 3) {
      toast("체험판에서는 3개까지만 추가할 수 있습니다.", {
        description: "회원가입 후 제한 없이 이용해보세요!",
        action: {
          label: "가입하기",
          onClick: () => (window.location.href = "/login"),
        },
      });
      return;
    }

    setIsPending(true);

    // Simulate network delay
    setTimeout(() => {
      // Parse tags
      const tagRegex = /#([\w가-힣]+)/g;
      const tags: string[] = [];
      const contentWithoutTags = inputValue
        .replace(tagRegex, (match, tag) => {
          tags.push(tag);
          return "";
        })
        .trim();

      const folder = MOCK_FOLDERS.find((f) => f.id === selectedFolderId);

      const newTodo: DemoTodo = {
        id: crypto.randomUUID(),
        content: contentWithoutTags || inputValue,
        isCompleted: false,
        priority,
        dueDate: dueDate?.toISOString(),
        folderName: folder?.name,
        folderColor: folder?.color,
        tags: tags.length > 0 ? tags : undefined,
      };

      setTodos((prev) => [newTodo, ...prev]);
      setInputValue("");
      setPriority("medium");
      setDueDate(undefined);
      setSelectedFolderId(null);
      setAddedCount((prev) => prev + 1);
      setIsPending(false);
      toast.success("할 일이 추가되었습니다.");
    }, 400);
  };

  const toggleTodo = (id: string, isCompleted: boolean) => {
    if (!isCompleted) playPop();

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: !isCompleted } : t)),
    );

    if (!isCompleted) {
      // Confetti effect
      const end = Date.now() + 1000;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  };

  const deleteTodo = (id: string) => {
    if (confirm("데모 버전입니다. 정말 삭제하시겠습니까?")) {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const selectedFolder = MOCK_FOLDERS.find((f) => f.id === selectedFolderId);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="relative group z-10 w-full">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <form
          onSubmit={handleAdd}
          className="relative flex flex-col gap-4 bg-gradient-to-br from-white to-blue-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/70 shadow-lg dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3),0_8px_30px_rgba(0,0,0,0.4)] group-hover:border-blue-400/40 dark:group-hover:border-blue-500/50 transition-all duration-300"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="오늘은 어떤 하루를 그리고 계신가요?"
            className="border-0 focus-visible:ring-0 bg-transparent text-base sm:text-xl font-medium pl-3 min-h-[60px] placeholder:text-zinc-400 dark:placeholder:text-zinc-300 selection:bg-blue-100 dark:selection:bg-blue-900 placeholder:font-normal text-zinc-900 dark:text-zinc-100 text-left"
            autoComplete="off"
            disabled={isPending}
          />

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Select
                value={priority}
                onValueChange={(v: "low" | "medium" | "high") => setPriority(v)}
              >
                <SelectTrigger className="h-8 border-transparent bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs gap-1.5 px-2.5 rounded-full transition-colors focus:ring-0">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      priority === "high"
                        ? "bg-red-500"
                        : priority === "medium"
                          ? "bg-blue-500"
                          : "bg-slate-400",
                    )}
                  />
                  <SelectValue placeholder="중요도" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                </SelectContent>
              </Select>

              {/* Folder Selector */}
              <Select
                value={selectedFolderId || "inbox"}
                onValueChange={(v) =>
                  setSelectedFolderId(v === "inbox" ? null : v)
                }
              >
                <SelectTrigger
                  className={cn(
                    "h-8 px-2.5 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-transparent focus:ring-0",
                    selectedFolderId &&
                      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                  )}
                >
                  {selectedFolderId ? (
                    <>
                      <FolderIcon className="w-3.5 h-3.5 mr-1.5" />
                      <span className="truncate max-w-[80px]">
                        {selectedFolder?.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <Inbox className="w-3.5 h-3.5 mr-1.5" />
                      폴더
                    </>
                  )}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">
                    <div className="flex items-center">
                      <Inbox className="mr-2 h-4 w-4" />
                      미지정
                    </div>
                  </SelectItem>
                  {MOCK_FOLDERS.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center">
                        <FolderIcon
                          className={`mr-2 h-4 w-4 text-${folder.color}`}
                        />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-2.5 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                      dueDate &&
                        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                    )}
                  >
                    <CalendarIcon className={cn("w-3.5 h-3.5 mr-1.5")} />
                    {dueDate
                      ? format(dueDate, "M월 d일", { locale: ko })
                      : "마감일"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              disabled={isPending || !inputValue.trim()}
              className="h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <Plus className="w-3.5 h-3.5 mr-1" />
              )}
              추가
            </Button>
          </div>
        </form>
      </div>

      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={cn(
              "group relative flex flex-col rounded-2xl transition-all duration-300 w-full",
              "p-4 bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-lg hover:border-zinc-300/50 dark:hover:border-zinc-700 hover:-translate-y-0.5",
              todo.isCompleted &&
                "bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60 grayscale-[0.5] shadow-none hover:shadow-none hover:translate-y-0 hover:border-zinc-200/50",
            )}
          >
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-3 flex-1 min-w-0 pr-0 sm:pr-4 w-full">
                  {/* Fake Grip Handle */}
                  <div className="flex-shrink-0 cursor-grab text-zinc-300 hover:text-blue-500 transition-colors p-2 mt-0.5 -ml-2 sm:-ml-3 outline-none rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Checkbox */}
                  <button
                    onClick={(e) => {
                      if (!todo.isCompleted) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x =
                          (rect.left + rect.width / 2) / window.innerWidth;
                        const y =
                          (rect.top + rect.height / 2) / window.innerHeight;
                        confetti({
                          particleCount: 20,
                          spread: 70,
                          origin: { x, y },
                          colors: ["#60a5fa", "#3b82f6", "#2563eb"],
                          ticks: 50,
                          gravity: 1.2,
                          scalar: 0.8,
                          zIndex: 9999,
                        });
                      }
                      toggleTodo(todo.id, todo.isCompleted);
                    }}
                    className={cn(
                      "mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95",
                      todo.isCompleted
                        ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20"
                        : "border-zinc-300 dark:border-zinc-600 group-hover:border-blue-400 bg-zinc-50 dark:bg-zinc-800",
                    )}
                  >
                    <Check
                      className={cn(
                        "w-3 h-3 transition-transform duration-300",
                        todo.isCompleted ? "scale-100" : "scale-0",
                      )}
                    />
                  </button>

                  <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    {/* Content */}
                    <span
                      className={cn(
                        "text-base transition-all duration-200 select-none cursor-pointer break-all whitespace-normal leading-relaxed flex-1 text-left",
                        todo.isCompleted
                          ? "text-zinc-400 font-medium line-through decoration-zinc-400 decoration-2"
                          : "text-zinc-800 dark:text-zinc-100 font-bold",
                      )}
                      onClick={() => toggleTodo(todo.id, todo.isCompleted)}
                    >
                      {todo.content}
                    </span>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Date Badge */}
                      {todo.dueDate && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "transition-colors",
                            getDateColor(todo.dueDate),
                          )}
                        >
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {formatDate(todo.dueDate)}
                        </Badge>
                      )}

                      {/* Folder Badge */}
                      {todo.folderName && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-2 py-0 h-5 font-medium text-[10px] border-0",
                            FOLDER_COLORS[todo.folderColor || "blue-500"] ||
                              FOLDER_COLORS["blue-500"],
                          )}
                        >
                          {todo.folderName}
                        </Badge>
                      )}

                      {/* Priority */}
                      {todo.priority === "high" && (
                        <Badge
                          variant="outline"
                          className="text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20"
                        >
                          중요
                        </Badge>
                      )}

                      {/* Tags */}
                      {todo.tags && todo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {todo.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 h-5 text-indigo-500 border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions (Visual Only) */}
                <div className="mt-0 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
