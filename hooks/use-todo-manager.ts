import { useState, useEffect, useRef } from "react";
import { type Todo } from "@/app/actions/todo";
import * as serverActions from "@/app/actions/todo";

type TodoManagerProps = {
  initialTodos: Todo[];
  userId?: string;
  folderId?: string;
};

export function useTodoManager({
  initialTodos,
  userId,
  folderId,
}: TodoManagerProps) {
  const isGuest = !userId;
  const mounted = useRef(false);

  // Separate state for Guest Mode only
  const [guestTodos, setGuestTodos] = useState<Todo[]>(() => {
    // Initialize state lazily
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("guest_todos");
      if (saved) {
        try {
          return JSON.parse(saved, (key, value) => {
            if (key === "createdAt" || key === "dueDate") {
              return value ? new Date(value) : null;
            }
            return value;
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [];
  });

  // Derived state: Use guestTodos for guests, initialTodos for auth users
  const todos = isGuest ? guestTodos : initialTodos;

  // Reload guest todos when switching to guest mode (skip initial mount as useState handles it)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    if (isGuest) {
      const saved = localStorage.getItem("guest_todos");
      if (saved) {
        try {
          const parsed = JSON.parse(saved, (key, value) => {
            if (key === "createdAt" || key === "dueDate") {
              return value ? new Date(value) : null;
            }
            return value;
          });
          setTimeout(() => setGuestTodos(parsed), 0);
        } catch {}
      }
    }
  }, [isGuest]);

  // Persistence Helper for Guest
  const saveToLocal = (newTodos: Todo[]) => {
    localStorage.setItem("guest_todos", JSON.stringify(newTodos));
    setGuestTodos(newTodos);
  };

  // --- CRUD Operations ---

  const addTodo = async (
    content: string,
    priority: "low" | "medium" | "high" = "medium",
    dueDate?: Date,
    // by jh 20260205: 반복 설정 파라미터 추가
    isRecurring: boolean = false,
    recurrencePattern?: "daily" | "weekly" | "monthly" | null,
    recurrenceInterval: number = 1,
  ) => {
    if (isGuest) {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        content,
        isCompleted: false,
        createdAt: new Date(),
        userId: "guest",
        folderId: folderId || null,
        priority,
        dueDate: dueDate || null,
        order: Date.now(),
        // by jh 20260205: Guest logic for recurrence
        isRecurring,
        recurrencePattern,
        recurrenceInterval,
      };
      const updated = [newTodo, ...todos];
      saveToLocal(updated);
      return newTodo;
    } else {
      return await serverActions.createTodo(
        content,
        folderId,
        priority,
        dueDate,
        isRecurring,
        recurrencePattern,
        recurrenceInterval,
      );
    }
  };

  const toggleTodo = async (id: string, isCompleted: boolean) => {
    if (isGuest) {
      const updated = todos.map((t) =>
        t.id === id ? { ...t, isCompleted: isCompleted } : t,
      );
      saveToLocal(updated);
    } else {
      await serverActions.toggleTodo(id, isCompleted);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    if (isGuest) {
      const updated = todos.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      );
      saveToLocal(updated);
    } else {
      await serverActions.updateTodo(id, updates);
    }
  };

  const deleteTodo = async (id: string) => {
    if (isGuest) {
      const todoToDelete = todos.find((t) => t.id === id);
      const updated = todos.filter((t) => t.id !== id);
      saveToLocal(updated);
      return todoToDelete;
    } else {
      return await serverActions.deleteTodo(id);
    }
  };

  const restoreTodo = async (todo: Todo) => {
    if (isGuest) {
      const updated = [todo, ...todos];
      // Re-sort: Completed -> Order -> CreatedAt
      updated.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        if (a.order !== b.order) return a.order - b.order;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
      saveToLocal(updated);
    } else {
      await serverActions.restoreTodo(todo);
    }
  };

  const reorderTodos = async (items: { id: string; order: number }[]) => {
    if (isGuest) {
      const updated = [...todos];
      items.forEach((item) => {
        const todo = updated.find((t) => t.id === item.id);
        if (todo) todo.order = item.order;
      });
      // Re-sort in memory
      updated.sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
        return a.order - b.order;
      });
      saveToLocal(updated);
    } else {
      await serverActions.reorderTodos(items);
    }
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    restoreTodo,
    reorderTodos,
    isGuest,
  };
}
