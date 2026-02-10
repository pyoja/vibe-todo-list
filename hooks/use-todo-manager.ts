import { useRef } from "react";
import { type Todo } from "@/app/actions/todo";
import * as serverActions from "@/app/actions/todo";
import * as subTodoActions from "@/app/actions/subtodo";

type TodoManagerProps = {
  initialTodos: Todo[];
  userId?: string;
  folderId?: string;
};

export function useTodoManager({ initialTodos, userId }: TodoManagerProps) {
  // Derived state: Use guestTodos for guests, initialTodos for auth users
  const todos = initialTodos;

  // --- CRUD Operations ---

  const addTodo = async (
    content: string,
    folderId?: string,
    priority: "low" | "medium" | "high" = "medium",
    dueDate?: Date,
    tags: string[] = [],
    // by jh 20260210: 이미지 URL 파라미터 추가
    imageUrl?: string | null,
  ) => {
    return await serverActions.createTodo(
      content,
      folderId,
      priority,
      dueDate,
      tags,
      imageUrl,
    );
  };

  const toggleTodo = async (id: string, isCompleted: boolean) => {
    await serverActions.toggleTodo(id, isCompleted);
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    await serverActions.updateTodo(id, updates);
  };

  const deleteTodo = async (id: string) => {
    return await serverActions.deleteTodo(id);
  };

  const restoreTodo = async (todo: Todo) => {
    await serverActions.restoreTodo(todo);
  };

  // --- SubTodo Operations ---

  const addSubTodo = async (todoId: string, content: string) => {
    return await subTodoActions.createSubTodo(todoId, content);
  };

  const toggleSubTodo = async (
    todoId: string,
    subTodoId: string,
    isCompleted: boolean,
  ) => {
    await subTodoActions.toggleSubTodo(subTodoId, isCompleted);
  };

  const deleteSubTodo = async (todoId: string, subTodoId: string) => {
    await subTodoActions.deleteSubTodo(subTodoId);
  };

  const reorderTodos = async (items: { id: string; order: number }[]) => {
    await serverActions.reorderTodos(items);
  };

  return {
    todos,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    restoreTodo,
    reorderTodos,
    addSubTodo,
    toggleSubTodo,
    deleteSubTodo,
  };
}
