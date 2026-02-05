import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import confetti from "canvas-confetti";
import {
  Check,
  Trash2,
  Calendar as CalendarIcon,
  Folder as FolderIcon,
  FolderOpen,
  GripVertical,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ko } from "date-fns/locale";
import type { Todo } from "@/app/actions/todo";
import type { Folder } from "@/app/actions/folder";
import { SubTodoList } from "@/components/sub-todo-list";
import { useState, useRef, useEffect } from "react";

interface SortableTodoItemProps {
  todo: Todo;
  folders: Folder[];
  FOLDER_COLORS: Record<string, string>;
  onToggle: (id: string, isCompleted: boolean) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void; // by jh 20260205: Update Handler
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: "low" | "medium" | "high") => void;
  onFolderChange: (id: string, folderId: string | null) => void;
  // by jh 20260205: SubTask Handlers
  onAddSubTodo: (todoId: string, content: string) => Promise<void>;
  onToggleSubTodo: (
    todoId: string,
    subTodoId: string,
    isCompleted: boolean,
  ) => void;
  onDeleteSubTodo: (todoId: string, subTodoId: string) => void;
}

// Separate component to avoid "Cannot create components during render" error
function FolderMenuContent({
  todoId,
  folders,
  FOLDER_COLORS,
  onFolderChange,
}: {
  todoId: string;
  folders: Folder[];
  FOLDER_COLORS: Record<string, string>;
  onFolderChange: (id: string, folderId: string | null) => void;
}) {
  return (
    <>
      <DropdownMenuLabel>이동할 폴더 선택</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => onFolderChange(todoId, null)}>
        <FolderOpen className="w-4 h-4 mr-2 text-zinc-400" />
        <span>미분류</span>
      </DropdownMenuItem>
      {folders.map((f) => (
        <DropdownMenuItem
          key={f.id}
          onClick={() => onFolderChange(todoId, f.id)}
        >
          <div
            className={cn(
              "w-2 h-2 rounded-full mr-2",
              f.color?.startsWith("bg-")
                ? f.color
                : FOLDER_COLORS[f.color || "blue-500"]?.split(" ")[0] ||
                    "bg-blue-500",
            )}
          />
          {f.name}
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function SortableTodoItem({
  todo,
  folders,
  FOLDER_COLORS,
  onToggle,
  onUpdate,
  onDelete,
  onPriorityChange,
  onFolderChange,
  onAddSubTodo,
  onToggleSubTodo,
  onDeleteSubTodo,
}: SortableTodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
    }
  }, [isEditing]);

  const handleUpdateContent = () => {
    if (editInputRef.current) {
      const newContent = editInputRef.current.value.trim();
      if (newContent && newContent !== todo.content) {
        onUpdate(todo.id, { content: newContent });
      }
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUpdateContent();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: "relative" as const,
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

  // Calculate Subtask Progress
  const subTodos = todo.subTodos || [];
  const completedSubTodos = subTodos.filter((st) => st.isCompleted).length;
  const hasSubTodos = subTodos.length > 0;

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layoutId={todo.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      // Disable layout animation during drag to prevent flickering
      layout={isDragging ? false : true}
      className={cn(
        "group relative flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-zinc-300/50 dark:hover:border-zinc-700 hover:-translate-y-0.5 w-full max-w-full",
        todo.isCompleted &&
          "bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60 grayscale-[0.5] shadow-none hover:shadow-none hover:translate-y-0 hover:border-zinc-200/50",
        isDragging &&
          "shadow-2xl scale-[1.02] border-blue-500/50 dark:border-blue-500/50 z-50 ring-1 ring-blue-500/20 opacity-90 rotate-1",
      )}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start gap-3 flex-1 min-w-0 pr-0 sm:pr-4 w-full">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-300 hover:text-blue-500 transition-colors touch-none p-2 mt-0.5 -ml-2 sm:-ml-3 outline-none rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Checkbox */}
          <button
            onClick={(e) => {
              if (!todo.isCompleted) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (rect.left + rect.width / 2) / window.innerWidth;
                const y = (rect.top + rect.height / 2) / window.innerHeight;
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
              onToggle(todo.id, todo.isCompleted);
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
            {/* Content & Expand Toggle */}
            <div className="flex items-start gap-2">
              {isEditing ? (
                <input
                  ref={editInputRef}
                  defaultValue={todo.content}
                  className="flex-1 bg-transparent border-b border-blue-500 focus:outline-none text-base sm:text-lg font-medium py-0 h-auto"
                  onBlur={handleUpdateContent}
                  onKeyDown={handleKeyDown}
                  onClick={(e) => e.stopPropagation()} // Prevent drag/toggle
                />
              ) : (
                <span
                  className={cn(
                    "text-base transition-all duration-200 select-none cursor-pointer break-all whitespace-normal leading-relaxed flex-1",
                    todo.isCompleted
                      ? "text-zinc-400 font-medium line-through decoration-zinc-400 decoration-2"
                      : "text-zinc-800 dark:text-zinc-100 font-bold",
                  )}
                  onClick={() => onToggle(todo.id, todo.isCompleted)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  title="더블 클릭하여 수정"
                >
                  {todo.content}
                </span>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 -mt-1 text-zinc-400 hover:text-blue-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Subtask Badge */}
              {hasSubTodos && (
                <div className="flex items-center gap-1.5 text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-medium">
                  <span
                    className={cn(
                      completedSubTodos === subTodos.length
                        ? "text-green-500"
                        : "",
                    )}
                  >
                    {completedSubTodos}/{subTodos.length}
                  </span>
                </div>
              )}

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
                      todo.priority === "high" ? "bg-red-500" : "bg-zinc-400",
                    )}
                  />
                  {todo.priority === "high" ? "중요" : "낮음"}
                </Badge>
              )}

              {/* Folder Badge */}
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
                    <FolderMenuContent
                      todoId={todo.id}
                      folders={folders}
                      FOLDER_COLORS={FOLDER_COLORS}
                      onFolderChange={onFolderChange}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

              {/* Due Date */}
              {todo.dueDate && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    getDueDateColor(new Date(todo.dueDate), todo.isCompleted),
                  )}
                >
                  <CalendarIcon className="w-3 h-3" />
                  <span>{getDueDateLabel(new Date(todo.dueDate))}</span>
                </div>
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

        {/* Actions */}
        <div className="mt-0 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors"
                title="메뉴"
              >
                <FolderIcon className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <span>수정</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <FolderMenuContent
                todoId={todo.id}
                folders={folders}
                FOLDER_COLORS={FOLDER_COLORS}
                onFolderChange={onFolderChange}
              />
            </DropdownMenuContent>
          </DropdownMenu>

          <Select
            value={todo.priority || "medium"}
            onValueChange={(val: string) =>
              onPriorityChange(todo.id, val as "low" | "medium" | "high")
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
            onClick={() => onDelete(todo.id)}
            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Tasks Section */}
      {isExpanded && (
        <SubTodoList
          todoId={todo.id}
          subTodos={subTodos}
          onAdd={onAddSubTodo}
          onToggle={onToggleSubTodo}
          onDelete={onDeleteSubTodo}
        />
      )}
    </motion.li>
  );
}
