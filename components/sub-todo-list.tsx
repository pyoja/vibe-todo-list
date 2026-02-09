import { useState, useRef, useEffect } from "react";
import { type SubTodo } from "@/app/actions/subtodo";
import { Input } from "@/components/ui/input";
import { Check, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface SubTodoListProps {
  todoId: string;
  subTodos: SubTodo[];
  onToggle: (todoId: string, subTodoId: string, isCompleted: boolean) => void;
  onDelete: (todoId: string, subTodoId: string) => void;
  onUpdate: (todoId: string, subTodoId: string, content: string) => void;
}

export function SubTodoList({
  todoId,
  subTodos,
  onToggle,
  onDelete,
  onUpdate,
}: SubTodoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleEditSubmit = (id: string) => {
    if (editContent.trim()) {
      onUpdate(todoId, id, editContent);
    }
    setEditingId(null);
  };

  // Calculate progress
  const total = subTodos.length;
  const completed = subTodos.filter((st) => st.isCompleted).length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="w-full mt-3 space-y-2 pl-14 pr-14">
      {/* Progress Bar */}
      {total > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">
            {completed}/{total}
          </span>
        </div>
      )}

      {/* List */}
      <ul className="space-y-1">
        {subTodos.map((subTodo) => (
          <li
            key={subTodo.id}
            className="group flex items-center gap-2 text-sm p-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md transition-colors"
          >
            {/* Checkbox */}
            <button
              onClick={(e) => {
                if (!subTodo.isCompleted) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (rect.left + rect.width / 2) / window.innerWidth;
                  const y = (rect.top + rect.height / 2) / window.innerHeight;
                  confetti({
                    particleCount: 15,
                    spread: 40,
                    origin: { x, y },
                    colors: ["#60a5fa"],
                    ticks: 30,
                    gravity: 1.5,
                    scalar: 0.6,
                    zIndex: 9999,
                  });
                }
                onToggle(todoId, subTodo.id, !subTodo.isCompleted);
              }}
              className={cn(
                "flex-shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                subTodo.isCompleted
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-zinc-300 dark:border-zinc-600 hover:border-blue-400",
              )}
            >
              <Check
                className={cn(
                  "w-2.5 h-2.5 transition-transform",
                  subTodo.isCompleted ? "scale-100" : "scale-0",
                )}
              />
            </button>

            {/* Content or Edit Input */}
            {editingId === subTodo.id ? (
              <form
                className="flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSubmit(subTodo.id);
                }}
              >
                <Input
                  ref={editInputRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onBlur={() => handleEditSubmit(subTodo.id)}
                  className="h-6 text-sm py-0 px-1 rounded-sm border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
              </form>
            ) : (
              <span
                className={cn(
                  "flex-1 break-all transition-colors cursor-text",
                  subTodo.isCompleted
                    ? "text-zinc-400 line-through decoration-zinc-300"
                    : "text-zinc-700 dark:text-zinc-200",
                )}
                onDoubleClick={() => {
                  setEditingId(subTodo.id);
                  setEditContent(subTodo.content);
                }}
              >
                {subTodo.content}
              </span>
            )}

            {/* Edit Button */}
            {editingId !== subTodo.id && (
              <button
                onClick={() => {
                  setEditingId(subTodo.id);
                  setEditContent(subTodo.content);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-blue-500 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Button */}
            <button
              onClick={() => onDelete(todoId, subTodo.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
