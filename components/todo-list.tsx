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
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ko } from "date-fns/locale";

interface TodoListProps {
  initialTodos: Todo[];
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
  folderId?: string;
}

export function TodoList({ initialTodos, user, folderId }: TodoListProps) {
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
      // Handle add
      return [newTodo, ...state];
    },
  );

  const filteredTodos = useMemo(() => {
    return optimisticTodos.filter((todo) => {
      // 1. Search Filter
      if (
        searchTerm &&
        !todo.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // 2. Status Filter
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

    // Reset local state
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

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800";
      case "medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "low":
        return "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400 border-slate-200 dark:border-zinc-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

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

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          안녕하세요, {user.name}님! 👋
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          오늘의 할 일을 직관적으로 관리해보세요.
        </p>
      </div>

      {/* Progress & Stats */}
      <div className="flex flex-col gap-4">
        <ProgressBar
          total={optimisticTodos.length}
          completed={optimisticTodos.filter((t) => t.isCompleted).length}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-zinc-900/50 p-1 rounded-xl">
          <Tabs
            value={filter}
            onValueChange={(v: string) =>
              setFilter(v as "all" | "active" | "completed")
            }
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
              <TabsTrigger value="all">
                전체 ({optimisticTodos.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                진행중 ({optimisticTodos.filter((t) => !t.isCompleted).length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                완료 ({optimisticTodos.filter((t) => t.isCompleted).length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 bg-zinc-50 dark:bg-zinc-800/50 border-0 focus-visible:ring-1"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="relative group z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <form
          ref={formRef}
          action={handleAdd}
          className="relative flex flex-col sm:flex-row gap-2 bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex-1 flex items-center gap-2">
            <Select
              value={priority}
              onValueChange={(v: string) =>
                setPriority(v as "low" | "medium" | "high")
              }
            >
              <SelectTrigger className="w-[100px] h-10 border-0 focus:ring-0 bg-zinc-50 dark:bg-zinc-800/50">
                <SelectValue placeholder="중요도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">낮음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="high">높음</SelectItem>
              </SelectContent>
            </Select>

            <Input
              ref={inputRef}
              name="content"
              placeholder="새로운 할 일을 입력하세요..."
              className="flex-1 border-0 focus-visible:ring-0 bg-transparent text-lg h-10 px-2"
              autoComplete="off"
              disabled={isPending}
            />
          </div>

          <div className="flex items-center gap-2 pl-2 sm:pl-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-800 pt-2 sm:pt-0">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 px-3 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                    dueDate &&
                      "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                  )}
                >
                  <CalendarIcon className={cn("w-5 h-5", dueDate && "mr-2")} />
                  {dueDate && format(dueDate, "M월 d일", { locale: ko })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
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

            <Button
              type="submit"
              size="icon"
              disabled={isPending}
              className="h-10 w-10 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shrink-0 ml-auto"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* List Section */}
      <div className="space-y-3">
        {optimisticTodos.length === 0 ? (
          <EmptyState onAddClick={handleFocusInput} />
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-10 text-zinc-500">
            검색 결과가 없습니다.
          </div>
        ) : (
          <ul className="space-y-3 pb-20">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className={cn(
                  "group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all hover:shadow-md hover:scale-[1.01] gap-3",
                  todo.isCompleted &&
                    "bg-zinc-50 dark:bg-zinc-900/30 opacity-75",
                )}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(todo.id, todo.isCompleted)}
                    className={cn(
                      "mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                      todo.isCompleted
                        ? "bg-blue-600 border-blue-600 text-white scale-110"
                        : "border-zinc-300 dark:border-zinc-600 hover:border-blue-500",
                    )}
                  >
                    {todo.isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex flex-col gap-1 min-w-0 w-full">
                    <span
                      className={cn(
                        "text-lg transition-all duration-300 select-none cursor-pointer truncate",
                        todo.isCompleted
                          ? "text-zinc-400 line-through decoration-zinc-400"
                          : "text-zinc-900 dark:text-zinc-100",
                      )}
                      onClick={() => handleToggle(todo.id, todo.isCompleted)}
                    >
                      {todo.content}
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                      {todo.priority && todo.priority !== "medium" && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-1.5 py-0 h-5 font-normal border",
                            getPriorityColor(todo.priority),
                          )}
                        >
                          {todo.priority === "high" ? "높음" : "낮음"}
                        </Badge>
                      )}

                      {todo.dueDate && (
                        <div
                          className={cn(
                            "flex items-center gap-1",
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

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Select
                    value={todo.priority || "medium"}
                    onValueChange={(val: string) =>
                      handlePriorityChange(
                        todo.id,
                        val as "low" | "medium" | "high",
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-[80px] text-xs border-transparent bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                    aria-label="Delete todo"
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
