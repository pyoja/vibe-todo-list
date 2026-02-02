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
  reorderTodos,
  type Todo,
} from "@/app/actions/todo";
import { type Folder } from "@/app/actions/folder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  Search,
  X,
  Folder as FolderIcon,
  LayoutList,
  CalendarDays,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";

// DnD Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableTodoItem } from "@/components/sortable-todo-item";
import { CalendarView } from "@/components/calendar-view";

// Animation & Interaction
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";

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
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (
      state,
      newTodo:
        | Todo
        | { type: "delete"; id: string }
        | { type: "toggle"; id: string; isCompleted: boolean }
        | { type: "update"; id: string; updates: Partial<Todo> }
        | { type: "reorder"; newTodos: Todo[] },
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
        if (newTodo.type === "reorder") {
          return newTodo.newTodos;
        }
        return state;
      }
      return [newTodo, ...state];
    },
  );

  const filteredTodos = useMemo(() => {
    return optimisticTodos.filter((todo) => {
      // 1. Search filter
      if (
        searchTerm &&
        !todo.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // 2. Calendar View Date Filter
      if (view === "calendar" && selectedDate) {
        if (!todo.dueDate) return false;
        if (!isSameDay(new Date(todo.dueDate), selectedDate)) return false;
      }

      // 3. Status filter
      if (filter === "active" && todo.isCompleted) return false;
      if (filter === "completed" && !todo.isCompleted) return false;
      return true;
    });
  }, [optimisticTodos, searchTerm, filter, view, selectedDate]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleAdd(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content.trim()) return;

    setIsPending(true);
    formRef.current?.reset();

    const currentPriority = priority;
    // If in calendar view, use selectedDate as default dueDate
    const currentDueDate = view === "calendar" ? selectedDate : dueDate;

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
      order: Date.now(), // Newest on top or adjust as needed
    };

    startTransition(() => {
      addOptimisticTodo(newTodo);
    });

    try {
      await createTodo(content, folderId, currentPriority, currentDueDate);
      toast.success("할 일이 추가되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("할 일 추가에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleToggle(id: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    startTransition(() => {
      addOptimisticTodo({ type: "toggle", id, isCompleted: newStatus });
    });

    if (newStatus) {
      // Confetti effect on completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    await toggleTodo(id, newStatus);
  }

  // Undo Delete Logic
  async function handleDelete(id: string) {
    // Optimistically remove
    startTransition(() => {
      addOptimisticTodo({ type: "delete", id });
    });

    // Show Undo Toast
    toast("할 일이 삭제되었습니다.", {
      action: {
        label: "실행 취소",
        onClick: async () => {
          // Todo: Undo logic requires restore action or soft delete.
          // For now, inform user.
          toast.dismiss();
          alert(
            "실행 취소 기능은 준비 중입니다. 삭제된 데이터는 복구되지 않았습니다.",
          );
        },
      },
      duration: 3000,
      description: "되돌리려면 실행 취소를 누르세요.",
    });

    // Direct Delete (No Confirm)
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = optimisticTodos.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTodos.findIndex((t) => t.id === over?.id);

      const newTodos = arrayMove(optimisticTodos, oldIndex, newIndex);

      // Optimistic update
      startTransition(() => {
        addOptimisticTodo({ type: "reorder", newTodos });
      });

      // Calculate new orders and sync with server
      // Using index based ordering strategy
      const updates = newTodos.map((todo, index) => ({
        id: todo.id,
        order: (index + 1) * 1000, // Giving some space between items
      }));

      // Call server action
      reorderTodos(updates).catch((err) => {
        console.error("Reorder failed", err);
        toast.error("순서 변경 저장에 실패했습니다.");
      });
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
          안녕하세요, {user.name}님!
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium">
          오늘 하루를 조각조각 채워보세요. 🧩
        </p>
      </div>

      {/* Control Bar (Search & Filter & View Toggle) */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-2 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 sticky top-20 z-40 transition-all flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="무엇을 찾고 계신가요?"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-zinc-50/50 dark:bg-zinc-800/50 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all font-medium"
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

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 flex items-center shrink-0 h-9">
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-md transition-all h-7 w-7 flex items-center justify-center",
                view === "list"
                  ? "bg-white dark:bg-black shadow-sm text-blue-600"
                  : "text-zinc-400 hover:text-zinc-600",
              )}
              title="리스트 보기"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "p-1.5 rounded-md transition-all h-7 w-7 flex items-center justify-center",
                view === "calendar"
                  ? "bg-white dark:bg-black shadow-sm text-blue-600"
                  : "text-zinc-400 hover:text-zinc-600",
              )}
              title="캘린더 보기"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>

          <Tabs
            value={filter}
            onValueChange={(v: string) =>
              setFilter(v as "all" | "active" | "completed")
            }
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-auto grid-cols-3 h-9 bg-zinc-100 dark:bg-zinc-800">
              <TabsTrigger value="all" className="text-xs font-bold px-3">
                전체
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs font-bold px-3">
                진행중
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs font-bold px-3">
                완료
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <ProgressBar
        total={optimisticTodos.length}
        completed={optimisticTodos.filter((t) => t.isCompleted).length}
      />

      {/* Calendar View Area */}
      <AnimatePresence mode="popLayout">
        {view === "calendar" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <CalendarView
              todos={optimisticTodos}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <div className="flex items-center gap-2 mt-4 px-2">
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
              <span className="text-xs font-medium text-zinc-400">
                {selectedDate
                  ? format(selectedDate, "M월 d일", { locale: ko })
                  : "날짜를 선택하세요"}
              </span>
              <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Input Section */}
      <div className="relative group z-10">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <form
          ref={formRef}
          action={handleAdd}
          className="relative flex flex-col gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-blue-500/5 transition-shadow hover:shadow-blue-500/10"
        >
          <Input
            ref={inputRef}
            name="content"
            placeholder={
              view === "calendar" && selectedDate
                ? `${format(selectedDate, "M월 d일", { locale: ko })}에 할 일을 추가하세요`
                : "오늘 어떤 멋진 일을 계획하고 계신가요?"
            }
            className="border-0 focus-visible:ring-0 bg-transparent text-xl font-medium p-0 h-auto placeholder:text-zinc-400 dark:placeholder:text-zinc-500 selection:bg-blue-100 dark:selection:bg-blue-900 placeholder:font-normal"
            autoComplete="off"
            disabled={isPending}
          />

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
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

              {/* Date Picker (Hidden in Calendar Mode usually, but let's keep it for flexibility) */}
              {view !== "calendar" && (
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
              )}
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

      {/* Todo List - DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="space-y-3 pb-20">
          {optimisticTodos.length === 0 ? (
            <EmptyState onAddClick={() => inputRef.current?.focus()} />
          ) : filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
              {view === "calendar" ? (
                <>
                  <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    {selectedDate
                      ? `${format(selectedDate, "M월 d일", { locale: ko })}에 계획된 일이 없네요.`
                      : "날짜를 선택해주세요."}
                  </p>
                </>
              ) : (
                <>
                  <FolderIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">검색 결과가 없습니다.</p>
                </>
              )}
            </div>
          ) : (
            <SortableContext
              items={filteredTodos.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="grid gap-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {filteredTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      folders={folders}
                      FOLDER_COLORS={FOLDER_COLORS}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onPriorityChange={handlePriorityChange}
                      onFolderChange={handleFolderChange}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </SortableContext>
          )}
        </div>
      </DndContext>
    </div>
  );
}
