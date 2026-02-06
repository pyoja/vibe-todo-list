"use client";

import {
  useState,
  useRef,
  useOptimistic,
  useMemo,
  useEffect,
  startTransition,
} from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { type Todo } from "@/app/actions/todo";
import { type Folder } from "@/app/actions/folder";
import { type SubTodo } from "@/app/actions/subtodo";
import { useTodoManager } from "@/hooks/use-todo-manager"; // Import Hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Loader2,
  Calendar as CalendarIcon,
  Search,
  X,
  LayoutList,
  CalendarDays,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import useSound from "use-sound";
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
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useSoundEffects } from "@/hooks/use-sound-effects";
import { SortableTodoItem, TodoItem } from "@/components/sortable-todo-item";
import { CalendarView } from "@/components/calendar-view";
import { DayCompletionCard } from "@/components/day-completion-card";

// Animation & Interaction
import { toast } from "sonner";
import { parseDateFromContent } from "@/lib/nlp"; // by jh 20260205
import { AnimatePresence, motion } from "framer-motion";

interface TodoListProps {
  initialTodos: Todo[];
  folders: Folder[];
  user?: {
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // DnD State
  const [activeId, setActiveId] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  // New Todo State
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<{
    isRecurring: boolean;
    pattern: "daily" | "weekly" | "monthly" | null;
    interval: number;
  }>({ isRecurring: false, pattern: null, interval: 1 });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showCompletionCard, setShowCompletionCard] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  // by jh 20260205: Sound Effects
  const { playAdd, playComplete, playDelete } = useSoundEffects();

  // by jh 20260205: Global Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + K: Focus Search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder*="검색"]',
        ) as HTMLInputElement;
        searchInput?.focus();
      }
      // Ctrl + N: Focus Add Todo
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Esc: Blur
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  // by jh 20260205: Enhanced filter state for UX optimization
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [dueDateFilter, setDueDateFilter] = useState<
    "all" | "overdue" | "today" | "week"
  >("all");
  const [sortBy, setSortBy] = useState<
    "created" | "dueDate" | "priority" | "name" | "manual"
  >("manual");

  const {
    todos: sourceTodos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    restoreTodo,
    reorderTodos,
    addSubTodo,
    toggleSubTodo,
    deleteSubTodo,
  } = useTodoManager({ initialTodos, userId: user?.id, folderId }); // Initialize Hook

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    sourceTodos,
    (
      state,
      newTodo:
        | Todo
        | { type: "delete"; id: string }
        | { type: "toggle"; id: string; isCompleted: boolean }
        | { type: "update"; id: string; updates: Partial<Todo> }
        | { type: "reorder"; newTodos: Todo[] }
        | { type: "addSubTodo"; todoId: string; subTodo: SubTodo }
        | {
            type: "toggleSubTodo";
            todoId: string;
            subTodoId: string;
            isCompleted: boolean;
          }
        | { type: "deleteSubTodo"; todoId: string; subTodoId: string }
        | { type: "add"; newTodo: Todo },
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
        // SubTodo Actions
        if (newTodo.type === "addSubTodo") {
          return state.map((t) =>
            t.id === newTodo.todoId
              ? { ...t, subTodos: [...(t.subTodos || []), newTodo.subTodo] }
              : t,
          );
        }
        if (newTodo.type === "toggleSubTodo") {
          return state.map((t) =>
            t.id === newTodo.todoId
              ? {
                  ...t,
                  subTodos: (t.subTodos || []).map((st) =>
                    st.id === newTodo.subTodoId
                      ? { ...st, isCompleted: newTodo.isCompleted }
                      : st,
                  ),
                }
              : t,
          );
        }
        if (newTodo.type === "deleteSubTodo") {
          return state.map((t) =>
            t.id === newTodo.todoId
              ? {
                  ...t,
                  subTodos: (t.subTodos || []).filter(
                    (st) => st.id !== newTodo.subTodoId,
                  ),
                }
              : t,
          );
        }
        return state;
      }
      return [newTodo, ...state];
    },
  );

  // by jh 20260205: Keyboard shortcuts listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Search focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredTodos = useMemo(() => {
    const result = optimisticTodos.filter((todo) => {
      // 1. Search filter
      if (
        searchTerm &&
        !todo.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // 2. Priority filter
      if (priorityFilter !== "all" && todo.priority !== priorityFilter) {
        return false;
      }

      // 3. Due date filter
      if (dueDateFilter !== "all") {
        if (!todo.dueDate) return false;
        const dueDate = new Date(todo.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dueDateFilter === "overdue") {
          if (dueDate >= today) return false;
        } else if (dueDateFilter === "today") {
          if (!isSameDay(dueDate, today)) return false;
        } else if (dueDateFilter === "week") {
          const weekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (dueDate < today || dueDate > weekLater) return false;
        }
      }

      // 4. Calendar View Date Filter
      if (view === "calendar" && selectedDate) {
        if (!todo.dueDate) return false;
        if (!isSameDay(new Date(todo.dueDate), selectedDate)) return false;
      }

      // 5. Status filter
      if (filter === "active" && todo.isCompleted) return false;
      if (filter === "completed" && !todo.isCompleted) return false;
      return true;
    });

    // Sorting
    if (sortBy !== "manual") {
      result.sort((a, b) => {
        switch (sortBy) {
          case "dueDate":
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          case "priority": {
            const priorityOrder: Record<string, number> = {
              high: 3,
              medium: 2,
              low: 1,
            };
            const pA = a.priority ? priorityOrder[a.priority] || 2 : 2;
            const pB = b.priority ? priorityOrder[b.priority] || 2 : 2;
            return pB - pA;
          }
          case "name":
            return a.content.localeCompare(b.content, "ko");
          case "created":
          default:
            return b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
    }

    return result;

    return result;
  }, [
    optimisticTodos,
    searchTerm,
    priorityFilter,
    dueDateFilter,
    sortBy,
    filter,
    view,
    selectedDate,
  ]);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleAdd(formData: FormData) {
    const rawContent = formData.get("content") as string;
    if (!rawContent.trim()) return;

    // by jh 20260205: 해시태그 파싱
    // 예: "운동하기 #건강 #일상" -> content: "운동하기", tags: ["건강", "일상"]
    const tagRegex = /#([\w가-힣]+)/g;
    const tags: string[] = [];
    const contentWithoutTags = rawContent
      .replace(tagRegex, (match, tag) => {
        tags.push(tag);
        return "";
      })
      .trim();

    // 만약 태그만 입력했다면 rawContent를 그대로 사용 (내용은 있어야 하므로)
    const finalContent = contentWithoutTags || rawContent;

    setIsPending(true);

    // by jh 20260205: 상태 값을 먼저 저장한 후 form reset (사용자가 추가 입력 중인 내용 보호)
    const currentPriority = priority;
    const currentRecurrence = recurrence;
    // If in calendar view, use selectedDate as default dueDate
    const currentDueDate = view === "calendar" ? selectedDate : dueDate;

    setPriority("medium");
    setDueDate(undefined);
    setRecurrence({ isRecurring: false, pattern: null, interval: 1 }); // Reset recurrence
    formRef.current?.reset();

    // by jh 20260205: NLP Parsing
    // by jh 20260205: NLP Parsing
    const { content: parsedContent, dueDate: parsedDueDate } =
      parseDateFromContent(contentWithoutTags || rawContent);
    // const finalContent = parsedContent; // Redeclaration Fixed

    const tempId = crypto.randomUUID();
    const newTodo: Todo = {
      id: tempId,
      content: parsedContent,
      isCompleted: false,
      createdAt: new Date(),
      userId: user?.id || "guest", // Handle guest user
      folderId: folderId || null,
      priority: currentPriority,
      // Fix: passed Date object instead of ISO string
      dueDate:
        parsedDueDate || (currentDueDate ? new Date(currentDueDate) : null),
      order: Date.now(), // Newest on top or adjust as needed
      isRecurring: currentRecurrence.isRecurring,
      recurrencePattern: currentRecurrence.pattern,
      recurrenceInterval: currentRecurrence.interval,
      tags: tags,
    };

    // Feedback for AI Date
    if (parsedDueDate) {
      toast.success("📅 날짜가 자동으로 설정되었습니다!", {
        description: `${parsedDueDate.toLocaleString()} 로 설정됨`,
      });
    }

    // by jh 20260205: Optimistic update와 Toast를 즉시 실행하여 즉각적인 피드백 제공
    startTransition(() => {
      addOptimisticTodo(newTodo);
    });
    playAdd(); // Sound
    toast.success("할 일이 추가되었습니다.");

    try {
      await addTodo(
        parsedContent,
        currentPriority,
        // Fix: passed Date object instead of ISO string
        parsedDueDate || currentDueDate || undefined,
        currentRecurrence.isRecurring,
        currentRecurrence.pattern,
        currentRecurrence.interval,
        tags,
      );
    } catch (e) {
      console.error(e);
      toast.error("할 일 추가에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  }

  // Sound Effect
  const [playPop] = useSound(
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==",
    { volume: 0.5 },
  );

  async function handleToggle(id: string, isCompleted: boolean) {
    const todo = optimisticTodos.find((t) => t.id === id);
    if (!todo) return;

    // Play sound when checking
    if (!isCompleted) {
      playPop();
    }

    if (!isCompleted) playComplete(); // Sound (Vibe)

    startTransition(() => {
      addOptimisticTodo({ type: "toggle", id, isCompleted: !isCompleted });
    });

    // Toggle via Hook
    await toggleTodo(id, !isCompleted);

    // Confetti Check: If we are completing the last active task
    // Note: We check against the current state before toggle
    if (!isCompleted) {
      const remaining = optimisticTodos.filter(
        (t) => !t.isCompleted && t.id !== id,
      ).length;
      if (remaining === 0 && optimisticTodos.length > 0) {
        // Delay slightly for visual check effect
        setTimeout(() => setShowCompletionCard(true), 500);
      }
    }
  }

  // Undo Delete Logic
  async function handleDelete(id: string) {
    // Find todo to delete for restoration
    const todoToDelete = optimisticTodos.find((t) => t.id === id);
    if (!todoToDelete) return;

    // by jh 20260205: Optimistic UI 업데이트를 즉시 실행하여 즉각적인 피드백 제공
    startTransition(() => {
      addOptimisticTodo({ type: "delete", id });
    });

    playDelete(); // Sound

    // by jh 20260205: Toast를 즉시 표시
    toast("할 일이 삭제되었습니다.", {
      action: {
        label: "실행 취소",
        onClick: async () => {
          try {
            await restoreTodo(todoToDelete);
            toast.success("실행 취소되었습니다.");
          } catch (e: unknown) {
            console.error(e);
            toast.error("복구에 실패했습니다.");
          }
        },
      },
      duration: 4000,
    });

    // 백그라운드에서 서버 통신
    try {
      await deleteTodo(id);
    } catch (e) {
      console.error(e);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
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

  // by jh 20260205: SubTodo Handlers
  async function handleAddSubTodo(todoId: string, content: string) {
    // 임시 ID 생성 (Optimistic용) - 실제 ID는 서버 응답 또는 useTodoManager 내부에서 처리
    // 여기서는 optimistic state만 업데이트하면 됨. useTodoManager.addSubTodo가 실제 생성 담당.
    // 하지만 useTodoManager.addSubTodo가 반환하는 값을 기다리면 느리므로,
    // 여기서 임시 객체를 만들어 즉시 업데이트.
    const tempSubTodo: SubTodo = {
      id: crypto.randomUUID(),
      todoId,
      content,
      isCompleted: false,
      createdAt: new Date(),
      order: Date.now(),
    };

    startTransition(() => {
      addOptimisticTodo({
        type: "addSubTodo",
        todoId,
        subTodo: tempSubTodo,
      });
    });

    try {
      await addSubTodo(todoId, content);
    } catch (e) {
      console.error(e);
      toast.error("서브태스크 추가 실패");
      // Rollback logic could be added here
    }
  }

  function handleToggleSubTodo(
    todoId: string,
    subTodoId: string,
    isCompleted: boolean,
  ) {
    startTransition(() => {
      addOptimisticTodo({
        type: "toggleSubTodo",
        todoId,
        subTodoId,
        isCompleted,
      });
    });
    toggleSubTodo(todoId, subTodoId, isCompleted).catch(() => {
      toast.error("업데이트 실패");
    });
  }

  function handleDeleteSubTodo(todoId: string, subTodoId: string) {
    startTransition(() => {
      addOptimisticTodo({
        type: "deleteSubTodo",
        todoId,
        subTodoId,
      });
    });
    deleteSubTodo(todoId, subTodoId).catch(() => {
      toast.error("삭제 실패");
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

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

      reorderTodos(updates).catch((err) => {
        console.error("Reorder failed", err);
        toast.error("순서 변경 저장에 실패했습니다.");
      });
    }
  }

  async function handleUpdateTodo(id: string, updates: Partial<Todo>) {
    startTransition(() => {
      addOptimisticTodo({
        type: "update",
        id,
        updates,
      });
    });
    try {
      await updateTodo(id, updates);
    } catch (e) {
      console.error(e);
      toast.error("업데이트 실패");
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader
        userName={user?.name || "게스트"}
        totalTodos={optimisticTodos.length}
        completedTodos={optimisticTodos.filter((t) => t.isCompleted).length}
      />

      {/* Control Bar (Search & Filter & View Toggle) */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-2 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 transition-all flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="무엇을 찾고 계신가요? (Cmd+K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-zinc-50 dark:bg-zinc-800 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-400"
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

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={priorityFilter}
            onValueChange={(value) =>
              setPriorityFilter(value as "all" | "low" | "medium" | "high")
            }
          >
            <SelectTrigger className="h-9 w-28 text-xs">
              <SelectValue placeholder="우선순위" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="medium">보통</SelectItem>
              <SelectItem value="low">낮음</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={dueDateFilter}
            onValueChange={(value) =>
              setDueDateFilter(value as "all" | "overdue" | "today" | "week")
            }
          >
            <SelectTrigger className="h-9 w-28 text-xs">
              <SelectValue placeholder="마감일" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="overdue">지난 일</SelectItem>
              <SelectItem value="today">오늘</SelectItem>
              <SelectItem value="week">이번 주</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) =>
              setSortBy(
                value as "created" | "dueDate" | "priority" | "name" | "manual",
              )
            }
          >
            <SelectTrigger className="h-9 w-28 text-xs">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">직접 설정</SelectItem>
              <SelectItem value="created">생성일</SelectItem>
              <SelectItem value="dueDate">마감일</SelectItem>
              <SelectItem value="priority">우선순위</SelectItem>
              <SelectItem value="name">이름</SelectItem>
            </SelectContent>
          </Select>

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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <form
          ref={formRef}
          action={handleAdd}
          className="relative flex flex-col gap-4 bg-gradient-to-br from-white to-blue-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/70 shadow-lg dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3),0_8px_30px_rgba(0,0,0,0.4)] group-hover:border-blue-400/40 dark:group-hover:border-blue-500/50 transition-all duration-300"
        >
          <Input
            ref={inputRef}
            name="content"
            placeholder={
              view === "calendar" && selectedDate
                ? `${format(selectedDate, "M월 d일", { locale: ko })} 어떤 하루를 만들까요? ✨`
                : "오늘은 어떤 하루를 그리고 계신가요?"
            }
            className="border-0 focus-visible:ring-0 bg-transparent text-base sm:text-xl font-medium pl-3 min-h-[60px] placeholder:text-zinc-400 dark:placeholder:text-zinc-300 selection:bg-blue-100 dark:selection:bg-blue-900 placeholder:font-normal text-zinc-900 dark:text-zinc-100"
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

              {/* Recurrence Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-8 px-2 text-xs font-medium rounded-full transition-colors",
                      recurrence.isRecurring
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800"
                        : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                    )}
                  >
                    <Repeat className={cn("w-3.5 h-3.5 mr-1.5")} />
                    {recurrence.isRecurring
                      ? recurrence.pattern === "daily"
                        ? "매일"
                        : recurrence.pattern === "weekly"
                          ? "매주"
                          : "매월"
                      : "반복"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3 space-y-3" align="start">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
                      반복 설정
                    </h4>
                    <div className="grid grid-cols-3 gap-1">
                      {(["daily", "weekly", "monthly"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            setRecurrence({
                              isRecurring: true,
                              pattern: p,
                              interval: recurrence.interval || 1,
                            })
                          }
                          className={cn(
                            "px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                            recurrence.pattern === p
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-500/20"
                              : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
                          )}
                        >
                          {p === "daily"
                            ? "매일"
                            : p === "weekly"
                              ? "매주"
                              : "매월"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {recurrence.isRecurring && (
                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs text-zinc-500">간격:</span>
                      <Input
                        type="number"
                        min={1}
                        value={recurrence.interval}
                        onChange={(e) =>
                          setRecurrence({
                            ...recurrence,
                            interval: parseInt(e.target.value) || 1,
                          })
                        }
                        className="h-7 w-16 text-xs text-center px-1"
                      />
                      <span className="text-xs text-zinc-500">
                        {recurrence.pattern === "daily"
                          ? "일마다"
                          : recurrence.pattern === "weekly"
                            ? "주마다"
                            : "개월마다"}
                      </span>
                    </div>
                  )}

                  {recurrence.isRecurring && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() =>
                        setRecurrence({
                          isRecurring: false,
                          pattern: null,
                          interval: 1,
                        })
                      }
                    >
                      반복 안 함
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              disabled={isPending}
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

      {/* Todo List - DnD Context */}
      <DndContext
        id="todo-dnd-context"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4 relative z-0">
          {/* Calendar View */}
          <AnimatePresence mode="wait">
            {view === "calendar" ? (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <CalendarView
                  todos={filteredTodos}
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    // if (date) setDueDate(date); // Optional: sync add form
                  }}
                />
              </motion.div>
            ) : filteredTodos.length === 0 ? (
              <EmptyState />
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 pb-20"
              >
                <SortableContext
                  items={filteredTodos.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      folders={folders}
                      FOLDER_COLORS={FOLDER_COLORS}
                      onToggle={handleToggle}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDelete}
                      onPriorityChange={handlePriorityChange}
                      onFolderChange={handleFolderChange}
                      onAddSubTodo={handleAddSubTodo}
                      onToggleSubTodo={handleToggleSubTodo}
                      onDeleteSubTodo={handleDeleteSubTodo}
                      // Pass global drag state
                      isDragActive={!!activeId}
                    />
                  ))}
                </SortableContext>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DragOverlay>
          {activeId ? (
            <TodoItem
              todo={optimisticTodos.find((t) => t.id === activeId) as Todo}
              folders={folders}
              FOLDER_COLORS={FOLDER_COLORS}
              onToggle={() => {}}
              onUpdate={() => {}}
              onDelete={() => {}}
              onPriorityChange={() => {}}
              onFolderChange={() => {}}
              onAddSubTodo={async () => {}}
              onToggleSubTodo={() => {}}
              onDeleteSubTodo={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <DayCompletionCard
        isOpen={showCompletionCard}
        onClose={() => setShowCompletionCard(false)}
        completedCount={optimisticTodos.filter((t) => t.isCompleted).length}
      />
    </div>
  );
}
