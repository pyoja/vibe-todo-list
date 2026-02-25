import { type Todo } from "@/app/actions/todo";
import {
  createTodo as createTodoAction,
  toggleTodo as toggleTodoAction,
  updateTodo as updateTodoAction,
  deleteTodo as deleteTodoAction,
  restoreTodo as restoreTodoAction,
  reorderTodos as reorderTodosAction,
} from "@/app/actions/todo";
import {
  createSubTodo as createSubTodoAction,
  toggleSubTodo as toggleSubTodoAction,
  deleteSubTodo as deleteSubTodoAction,
} from "@/app/actions/subtodo";

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
    return await createTodoAction(
      content,
      folderId,
      priority,
      dueDate,
      tags,
      imageUrl,
    );
  };

  const toggleTodo = async (id: string, isCompleted: boolean) => {
    await toggleTodoAction(id, isCompleted);
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    await updateTodoAction(id, updates);
  };

  const deleteTodo = async (id: string) => {
    return await deleteTodoAction(id);
  };

  const restoreTodo = async (todo: Todo) => {
    await restoreTodoAction(todo);
  };

  // --- SubTodo Operations ---

  const addSubTodo = async (todoId: string, content: string) => {
    return await createSubTodoAction(todoId, content);
  };

  const toggleSubTodo = async (
    todoId: string,
    subTodoId: string,
    isCompleted: boolean,
  ) => {
    await toggleSubTodoAction(subTodoId, isCompleted);
  };

  const deleteSubTodo = async (todoId: string, subTodoId: string) => {
    await deleteSubTodoAction(subTodoId);
  };

  const reorderTodos = async (items: { id: string; order: number }[]) => {
    await reorderTodosAction(items);
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
