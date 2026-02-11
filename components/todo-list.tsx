"use client";

import { useState, useOptimistic, useMemo, startTransition } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { type Todo } from "@/app/actions/todo";
import { type Folder } from "@/app/actions/folder";
import { type SubTodo, updateSubTodo } from "@/app/actions/subtodo";
import { useTodoManager } from "@/hooks/use-todo-manager";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { DayCompletionCard } from "@/components/day-completion-card";
import { parseDateFromContent } from "@/lib/nlp";
import { toast } from "sonner";
import { isSameDay } from "date-fns";
import useSound from "use-sound";

// DnD Imports
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

// Sub-components
import { ControlBar } from "@/components/todo/control-bar";
import { FolderSection } from "@/components/todo/folder-section";
import { TodoInput, type TodoInputMeta } from "@/components/todo/todo-input";
import { TodoListBody } from "@/components/todo/todo-list-body";
import { FolderDialogs } from "@/components/todo/folder-dialogs";
import { HistorySidebar } from "@/components/history/history-sidebar";

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
  today?: Date;
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

// Define Optimistic Action Types
type OptimisticAction =
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
  | {
      type: "updateSubTodo";
      todoId: string;
      subTodoId: string;
      content: string;
    };

export function TodoList({
  initialTodos,
  folders,
  user,
  folderId,
  today = new Date(),
}: TodoListProps) {
  const [isPending, setIsPending] = useState(false);

  // DnD State
  const [activeId, setActiveId] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [dueDateFilter, setDueDateFilter] = useState<
    "all" | "overdue" | "today" | "week"
  >("all");
  const [sortBy, setSortBy] = useState<
    "created" | "dueDate" | "priority" | "name" | "manual"
  >("manual");

  // Folder Management State
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("blue-500");

  const [showCompletionCard, setShowCompletionCard] = useState(false);
  // by jh 20260210: 폴더 생성/수정 중복 클릭 방지
  const [isSavingFolder, setIsSavingFolder] = useState(false);

  // History Sidebar State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sound Effects
  const { playAdd, playComplete, playDelete } = useSoundEffects();
  const [playPop] = useSound(
    "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==",
    { volume: 0.5 },
  );

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
  } = useTodoManager({ initialTodos, userId: user?.id, folderId });

  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    sourceTodos,
    (state: Todo[], newTodo: Todo | OptimisticAction) => {
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
        if (newTodo.type === "updateSubTodo") {
          return state.map((t) =>
            t.id === newTodo.todoId
              ? {
                  ...t,
                  subTodos: (t.subTodos || []).map((st) =>
                    st.id === newTodo.subTodoId
                      ? { ...st, content: newTodo.content }
                      : st,
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

  const completedTodos = useMemo(() => {
    return optimisticTodos.filter((t) => t.isCompleted);
  }, [optimisticTodos]);

  const filteredTodos = useMemo(() => {
    const result = optimisticTodos.filter((todo) => {
      // Force hide completed items from main list ("Today's Record" feature)
      if (todo.isCompleted) return false;

      if (
        searchTerm &&
        !todo.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (priorityFilter !== "all" && todo.priority !== priorityFilter) {
        return false;
      }
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
      if (view === "calendar" && selectedDate) {
        if (!todo.dueDate) return false;
        if (!isSameDay(new Date(todo.dueDate), selectedDate)) return false;
      }
      if (filter === "active" && todo.isCompleted) return false;
      if (filter === "completed" && !todo.isCompleted) return false;

      // Filter by Folder
      if (folderId && todo.folderId !== folderId) {
        return false;
      }

      return true;
    });

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
  }, [
    optimisticTodos,
    searchTerm,
    priorityFilter,
    dueDateFilter,
    sortBy,
    filter,
    view,
    selectedDate,
    folderId,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (active.id !== over?.id) {
      const oldIndex = optimisticTodos.findIndex((t) => t.id === active.id);
      const newIndex = optimisticTodos.findIndex((t) => t.id === over?.id);

      const newTodos = arrayMove(optimisticTodos, oldIndex, newIndex);

      startTransition(() => {
        addOptimisticTodo({ type: "reorder", newTodos });
      });

      const updates = newTodos.map((todo, index) => ({
        id: todo.id,
        order: (index + 1) * 1000,
      }));

      reorderTodos(updates).catch((err) => {
        console.error("Reorder failed", err);
        toast.error("순서 변경 저장에 실패했습니다.");
      });
    }
  };

  const handleAdd = async (formData: FormData, meta: TodoInputMeta) => {
    const rawContent = formData.get("content") as string;
    if (!rawContent.trim()) return;

    const tagRegex = /#([\w가-힣]+)/g;
    const tags: string[] = [];
    const contentWithoutTags = rawContent
      .replace(tagRegex, (match, tag) => {
        tags.push(tag);
        return "";
      })
      .trim();

    setIsPending(true);

    const { content: parsedContent, dueDate: parsedDueDate } =
      parseDateFromContent(contentWithoutTags || rawContent);

    // Determine folder ID: explicitly provided in meta > current view folderId > null (inbox)
    // Note: meta.folderId can be null (meaning Inbox explicitly selected)
    const targetFolderId =
      meta.folderId !== undefined ? meta.folderId : folderId || null;

    const tempId = crypto.randomUUID();
    const newTodo: Todo = {
      id: tempId,
      content: parsedContent,
      isCompleted: false,
      createdAt: new Date(),
      userId: user?.id || "guest",
      folderId: targetFolderId,
      priority: meta.priority,
      dueDate: parsedDueDate || (meta.dueDate ? new Date(meta.dueDate) : null),
      order: Date.now(),
      tags: tags,
      // by jh 20260210: 이미지 URL Optimistic UI
      imageUrl: meta.imageUrl,
    };

    if (parsedDueDate) {
      toast.success("📅 날짜가 자동으로 설정되었습니다!", {
        description: `${parsedDueDate.toLocaleString()} 로 설정됨`,
      });
    }

    startTransition(() => {
      addOptimisticTodo(newTodo);
    });
    playAdd();
    toast.success("할 일이 추가되었습니다.");

    try {
      await addTodo(
        parsedContent,
        targetFolderId || undefined,
        meta.priority,
        parsedDueDate || meta.dueDate || undefined,
        tags,
        // by jh 20260210: 이미지 URL 전달
        meta.imageUrl,
      );
    } catch (e) {
      console.error(e);
      toast.error("할 일 추가에 실패했습니다.");
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    const todoToDelete = optimisticTodos.find((t) => t.id === id);
    if (!todoToDelete) return;

    startTransition(() => {
      addOptimisticTodo({ type: "delete", id });
    });

    playDelete();
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

    try {
      await deleteTodo(id);
    } catch (e) {
      console.error(e);
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleToggle = async (id: string, isCompleted: boolean) => {
    const todo = optimisticTodos.find((t) => t.id === id);
    if (!todo) return;

    if (!isCompleted) playPop();
    if (!isCompleted) playComplete();

    startTransition(() => {
      addOptimisticTodo({ type: "toggle", id, isCompleted: !isCompleted });
    });

    await toggleTodo(id, !isCompleted);

    if (!isCompleted) {
      const remaining = optimisticTodos.filter(
        (t) => !t.isCompleted && t.id !== id,
      ).length;
      if (remaining === 0 && optimisticTodos.length > 0) {
        setTimeout(() => setShowCompletionCard(true), 500);
      }
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
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
  };

  const handlePriorityChange = async (
    id: string,
    newPriority: "low" | "medium" | "high",
  ) => {
    startTransition(() => {
      addOptimisticTodo({
        type: "update",
        id,
        updates: { priority: newPriority },
      });
    });
    await updateTodo(id, { priority: newPriority });
  };

  // SubTodo Handlers
  const handleAddSubTodo = async (todoId: string, content: string) => {
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
    }
  };

  const handleToggleSubTodo = (
    todoId: string,
    subTodoId: string,
    isCompleted: boolean,
  ) => {
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
  };

  const handleDeleteSubTodo = (todoId: string, subTodoId: string) => {
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
  };

  const handleUpdateSubTodo = async (
    todoId: string,
    subTodoId: string,
    content: string,
  ) => {
    startTransition(() => {
      addOptimisticTodo({
        type: "updateSubTodo",
        todoId,
        subTodoId,
        content,
      });
    });
    try {
      await updateSubTodo(subTodoId, todoId, content);
    } catch (e) {
      console.error(e);
      toast.error("업데이트 실패");
    }
  };

  // Guest Folder State
  const activeFolders = folders;

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
    setShowNewDialog(true);
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("이 폴더를 삭제하시겠습니까?")) return;

    try {
      const { deleteFolder } = await import("@/app/actions/folder");
      await deleteFolder(folderId);
      toast.success("폴더가 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      toast.error("폴더 삭제에 실패했습니다.");
    }
  };

  const handleSaveFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("폴더 이름을 입력해주세요.");
      return;
    }

    // by jh 20260210: 중복 클릭 방지
    if (isSavingFolder) return;
    setIsSavingFolder(true);

    try {
      if (editingFolder) {
        const { updateFolder } = await import("@/app/actions/folder");
        await updateFolder(editingFolder.id, {
          name: newFolderName,
          color: newFolderColor,
        });
        toast.success("폴더가 수정되었습니다.");
      } else {
        const { createFolder } = await import("@/app/actions/folder");
        await createFolder(newFolderName, newFolderColor);
        toast.success("폴더가 생성되었습니다.");
      }

      setShowNewDialog(false);
      setEditingFolder(null);
      setNewFolderName("");
      setNewFolderColor("blue-500");
    } catch (error) {
      console.error(error);
      toast.error("폴더 저장에 실패했습니다.");
    } finally {
      setIsSavingFolder(false);
    }
  };

  const handleUndo = async (id: string) => {
    handleToggle(id, true); // toggle back to false (isCompleted: true -> false)
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 relative">
      <DashboardHeader
        userName={user?.name || "게스트"}
        totalTodos={optimisticTodos.length}
        completedTodos={completedTodos.length}
      />

      <FolderSection
        folders={activeFolders}
        initialTodos={sourceTodos}
        folderId={folderId}
        onEditFolder={handleEditFolder}
        onDeleteFolder={handleDeleteFolder}
        onNewFolderClick={() => {
          setEditingFolder(null);
          setNewFolderName("");
          setNewFolderColor("blue-500");
          setShowNewDialog(true);
        }}
      />

      <ControlBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        dueDateFilter={dueDateFilter}
        setDueDateFilter={setDueDateFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        view={view}
        setView={setView}
        filter={filter}
        setFilter={setFilter}
        onHistoryClick={() => setIsHistoryOpen(true)}
      />

      <TodoInput
        onAdd={handleAdd}
        isPending={isPending}
        view={view}
        selectedDate={selectedDate}
        folders={activeFolders}
        defaultFolderId={folderId}
      />

      <TodoListBody
        view={view}
        filteredTodos={filteredTodos}
        optimisticTodos={optimisticTodos}
        folders={activeFolders}
        FOLDER_COLORS={FOLDER_COLORS}
        activeId={activeId}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onToggle={handleToggle}
        onUpdate={handleUpdateTodo}
        onDelete={handleDelete}
        onPriorityChange={handlePriorityChange}
        onFolderChange={async (id, newFolderId) => {
          const targetFolder = activeFolders.find((f) => f.id === newFolderId);
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
        }}
        onAddSubTodo={handleAddSubTodo}
        onToggleSubTodo={handleToggleSubTodo}
        onDeleteSubTodo={handleDeleteSubTodo}
        onUpdateSubTodo={handleUpdateSubTodo}
        defaultDate={today}
        folderId={folderId}
      />

      <FolderDialogs
        isOpen={showNewDialog}
        onClose={setShowNewDialog}
        editingFolder={editingFolder}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        folderColor={newFolderColor}
        setFolderColor={setNewFolderColor}
        onSave={handleSaveFolder}
        isSaving={isSavingFolder}
      />

      <DayCompletionCard
        isOpen={showCompletionCard}
        onClose={() => setShowCompletionCard(false)}
        completedCount={completedTodos.length}
      />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        completedTodos={completedTodos}
        onUndo={handleUndo}
      />
    </div>
  );
}
