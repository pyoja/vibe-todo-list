"use client";

import {
  useState,
  useOptimistic,
  useRef,
  startTransition,
  useMemo,
} from "react";
import { ProgressBar } from "@/components/progress-bar";
import {
  createTodo,
  toggleTodo,
  deleteTodo,
  updateTodo,
  type Todo,
} from "@/app/actions/todo";
import { type Folder } from "@/app/actions/folder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  Trash2,
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  Search,
  X,
  Folder as FolderIcon,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ko } from "date-fns/locale";

interface TodoListProps {
  initialTodos: Todo[];
  folders: Folder[];
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  folderId?: string;
}

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
  "pink-500":
    "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  "slate-500":
    "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
};

export function TodoList({
  initialTodos,
  folders,
  user,
  folderId,
}: TodoListProps) {
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // New Todo State
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (
      state,
      newTodo:
        | Todo
        | { type: "delete"; id: string }
        | { type: "toggle"; id: string; isCompleted: boolean }
        | { type: "update"; id: string; updates: Partial<Todo> },
    ) => {
      // Handle actions
      if ("type" in newTodo) {
        if (newTodo.type === "delete") {
          return state.filter((t) => t.id !== newTodo.id);
        }
        if (newTodo.type === "toggle") {
          return state.map((t) =>
            t.id === newTodo.id
              ? { ...t, isCompleted: newTodo.isCompleted }
              : t,
          );
        }
        if (newTodo.type === "update") {
          return state.map((t) =>
            t.id === newTodo.id ? { ...t, ...newTodo.updates } : t,
          );
        }
        return state;
      }
      return [newTodo, ...state];
    },
  );

  const filteredTodos = useMemo(() => {
    return optimisticTodos.filter((todo) => {
      if (
        searchTerm &&
        !todo.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (filter === "active" && todo.isCompleted) return false;
      if (filter === "completed" && !todo.isCompleted) return false;
      return true;
    });
  }, [optimisticTodos, searchTerm, filter]);

  async function handleAdd(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content.trim()) return;

    setIsPending(true);
    formRef.current?.reset();

    const currentPriority = priority;
    const currentDueDate = dueDate;
    setPriority("medium");
    setDueDate(undefined);

    const tempId = crypto.randomUUID();
    const newTodo: Todo = {
      id: tempId,
      content,
      isCompleted: false,
      createdAt: new Date(),
      userId: user.id,
      folderId: folderId || null,
      priority: currentPriority,
      dueDate: currentDueDate || null,
    };

    startTransition(() => {
      addOptimisticTodo(newTodo);
    });

    try {
      await createTodo(content, folderId, currentPriority, currentDueDate);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    startTransition(() => {
      addOptimisticTodo({ type: "toggle", id, isCompleted: newStatus });
    });
    await toggleTodo(id, newStatus);
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    startTransition(() => {
      addOptimisticTodo({ type: "delete", id });
    });
    await deleteTodo(id);
  }

  async function handlePriorityChange(
    id: string,
    newPriority: "low" | "medium" | "high",
  ) {
    startTransition(() => {
      addOptimisticTodo({
        type: "update",
        id,
        updates: { priority: newPriority },
      });
    });
    await updateTodo(id, { priority: newPriority });
  }

  async function handleFolderChange(id: string, newFolderId: string | null) {
    const targetFolder = folders.find((f) => f.id === newFolderId);
    startTransition(() => {
      addOptimisticTodo({
        type: "update",
        id,
        updates: {
          folderId: newFolderId,
          folderName: targetFolder?.name,
          folderColor: targetFolder?.color,
        },
      });
    });
    await updateTodo(id, { folderId: newFolderId });
  }

  const getDueDateLabel = (date: Date) => {
    if (isToday(date)) return "오늘까지";
    if (isTomorrow(date)) return "내일까지";
    return format(date, "M월 d일까지", { locale: ko });
  };

  const getDueDateColor = (date: Date, isCompleted: boolean) => {
    if (isCompleted) return "text-zinc-400";
    if (isPast(date) && !isToday(date)) return "text-red-500 font-medium";
    if (isToday(date)) return "text-amber-500 font-medium";
    return "text-zinc-500 dark:text-zinc-400";
  };

  const FolderMenuContent = ({ todoId }: { todoId: string }) => (
    <>
      <DropdownMenuLabel>이동할 폴더 선택</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => handleFolderChange(todoId, null)}>
        <FolderOpen className="w-4 h-4 mr-2 text-zinc-400" />
        <span>Inbox (미분류)</span>
      </DropdownMenuItem>
      {folders.map((f) => (
        <DropdownMenuItem
          key={f.id}
          onClick={() => handleFolderChange(todoId, f.id)}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              f.color?.startsWith("bg-")
                ? f.color
                : FOLDER_COLORS[f.color || "blue-500"]?.split(" ")[0] ||
                    "bg-blue-500", // Extract bg class from FOLDER_COLORS
            )}
          />
          {f.name}
        </DropdownMenuItem>
      ))}
    </>
  );

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          안녕하세요, {user.name}님!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          오늘 하루를 조각조각 채워보세요. 🧩
        </p>
      </div>

      {/* Control Bar (Search & Filter) */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-2 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 sticky top-20 z-40 transition-all flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="무엇을 찾고 계신가요?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-zinc-50/50 dark:bg-zinc-800/50 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Tabs
          value={filter}
          onValueChange={(v: string) =>
            setFilter(v as "all" | "active" | "completed")
          }
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-3 h-9 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger value="all" className="text-xs">
              전체
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              진행중
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              완료
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ProgressBar
        total={optimisticTodos.length}
        completed={optimisticTodos.filter((t) => t.isCompleted).length}
      />

      {/* Smart Input Section */}
      <div className="relative group z-10">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <form
          ref={formRef}
          action={handleAdd}
          className="relative flex flex-col gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <Input
            ref={inputRef}
            name="content"
            placeholder="새로운 조각을 추가하세요..."
            className="border-0 focus-visible:ring-0 bg-transparent text-lg font-medium p-0 h-auto placeholder:text-zinc-400"
            autoComplete="off"
            disabled={isPending}
          />

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Select
                value={priority}
                onValueChange={(v: string) =>
                  setPriority(v as "low" | "medium" | "high")
                }
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

              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                    onSelect={(date) => {
                      setDueDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <Plus className="w-3.5 h-3.5 mr-1.5" />
              )}
              추가
            </Button>
          </div>
        </form>
      </div>

      {/* Todo List */}
      <div className="space-y-3 pb-20">
        {optimisticTodos.length === 0 ? (
          <EmptyState onAddClick={() => inputRef.current?.focus()} />
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <FolderIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={cn(
                  "group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-zinc-200 dark:hover:border-zinc-700",
                  todo.isCompleted &&
                    "bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60 grayscale-[0.5]",
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(todo.id, todo.isCompleted)}
                    className={cn(
                      "mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                      todo.isCompleted
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-zinc-300 dark:border-zinc-600 group-hover:border-blue-400",
                    )}
                  >
                    {todo.isCompleted && <Check className="w-3 h-3" />}
                  </button>

                  <div className="flex flex-col gap-1.5 min-w-0 w-full">
                    {/* Content */}
                    <span
                      className={cn(
                        "text-base transition-all duration-200 select-none cursor-pointer truncate font-medium",
                        todo.isCompleted
                          ? "text-zinc-400 line-through decoration-zinc-300"
                          : "text-zinc-700 dark:text-zinc-200",
                      )}
                      onClick={() => handleToggle(todo.id, todo.isCompleted)}
                    >
                      {todo.content}
                    </span>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Priority */}
                      {todo.priority && todo.priority !== "medium" && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "px-1.5 py-0 h-5 font-normal text-[10px] bg-white border pointer-events-none gap-1",
                            todo.priority === "high"
                              ? "text-red-500 border-red-100"
                              : "text-zinc-500 border-zinc-100",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              todo.priority === "high"
                                ? "bg-red-500"
                                : "bg-zinc-400",
                            )}
                          />
                          {todo.priority === "high" ? "중요" : "낮음"}
                        </Badge>
                      )}

                      {/* Folder Badge & Move Action */}
                      {todo.folderName ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "px-2 py-0 h-5 font-medium text-[10px] border-0 cursor-pointer hover:opacity-80 transition-opacity",
                                FOLDER_COLORS[todo.folderColor || "blue-500"] ||
                                  FOLDER_COLORS["blue-500"],
                              )}
                            >
                              {todo.folderName}
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <FolderMenuContent todoId={todo.id} />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}

                      {/* Due Date */}
                      {todo.dueDate && (
                        <div
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            getDueDateColor(
                              new Date(todo.dueDate),
                              todo.isCompleted,
                            ),
                          )}
                        >
                          <CalendarIcon className="w-3 h-3" />
                          <span>{getDueDateLabel(new Date(todo.dueDate))}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 sm:mt-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                  {/* Folder Move Button (Visible in Action Area) */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                        title="이동"
                      >
                        <FolderIcon className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <FolderMenuContent todoId={todo.id} />
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Select
                    value={todo.priority || "medium"}
                    onValueChange={(val: string) =>
                      handlePriorityChange(
                        todo.id,
                        val as "low" | "medium" | "high",
                      )
                    }
                  >
                    <SelectTrigger className="h-7 text-[10px] w-auto border-transparent bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 focus:ring-0 px-2 rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                    </SelectContent>
                  </Select>

                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
