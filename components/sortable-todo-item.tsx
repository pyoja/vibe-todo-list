import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import confetti from "canvas-confetti";
import {
  Check,
  Trash2,
  Calendar as CalendarIcon,
  Folder as FolderIcon,
  FolderOpen,
  GripVertical,
  Plus,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ListTree } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { ko } from "date-fns/locale";
import type { Todo } from "@/app/actions/todo";
import type { Folder } from "@/app/actions/folder";
import { SubTodoList } from "@/components/sub-todo-list";
import { useState, useRef, useEffect } from "react";

// Helper functions
const getDateColor = (date: Date) => {
  if (isPast(date) && !isToday(date))
    return "text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20";
  if (isToday(date))
    return "text-orange-500 border-orange-200 bg-orange-50 dark:bg-orange-900/20";
  if (isTomorrow(date))
    return "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20";
  return "text-zinc-500 border-zinc-200 bg-zinc-50 dark:bg-zinc-800";
};

const formatDate = (date: Date) => {
  if (isToday(date)) return "오늘";
  if (isTomorrow(date)) return "내일";
  return format(date, "M/d (eee)", { locale: ko });
};

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

interface TodoItemProps extends SortableTodoItemProps {
  style?: React.CSSProperties;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  isDragging?: boolean;
  isOverlay?: boolean;
  innerRef?: React.Ref<HTMLLIElement>;
}

export function TodoItem({
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
  style,
  attributes,
  listeners,
  isDragging,
  isOverlay,
  innerRef,
}: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

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

  // Calculate Subtask Progress
  const subTodos = todo.subTodos || [];
  const hasSubTodos = subTodos.length > 0;

  return (
    <li
      ref={innerRef}
      style={style}
      // by jh 20260206: Changed from motion.li to li to eliminate framer-motion conflicts with dnd-kit
      className={cn(
        "group relative flex flex-col rounded-2xl transition-all duration-300 w-full max-w-full",
        // Default Style (Not dragging, Not overlay)
        !isDragging &&
          !isOverlay &&
          "p-4 bg-white dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-lg hover:border-zinc-300/50 dark:hover:border-zinc-700 hover:-translate-y-0.5",

        // Completed Style
        todo.isCompleted &&
          !isDragging &&
          "bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60 grayscale-[0.5] shadow-none hover:shadow-none hover:translate-y-0 hover:border-zinc-200/50",

        // Dragging Placeholder Style (Ghost Card)
        isDragging &&
          !isOverlay &&
          "opacity-100 p-4 bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 shadow-inner",

        // Overlay Style (The item following the cursor)
        isOverlay &&
          "p-4 bg-white dark:bg-zinc-900 opacity-100 shadow-2xl scale-105 border-2 border-blue-500 z-50 cursor-grabbing ring-4 ring-blue-500/10",
      )}
    >
      {/* Drop Indicator (Center of the ghost card) */}
      {isDragging && !isOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[90%] h-1 bg-blue-400/50 rounded-full" />
        </div>
      )}

      {/* Content wrapper */}
      <div
        className={cn(
          "w-full flex flex-col gap-2 transition-opacity duration-200",
          // Hide content in placeholder so we only see the "Ghost" slot
          isDragging && !isOverlay ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start gap-3 flex-1 min-w-0 pr-0 sm:pr-4 w-full">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className={cn(
                "flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-300 hover:text-blue-500 transition-colors touch-none p-2 mt-0.5 -ml-2 sm:-ml-3 outline-none rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800",
                isOverlay && "cursor-grabbing",
              )}
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
              </div>

              {/* Meta Tags */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Date Badge (Clickable) */}
                {todo.dueDate && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge
                        variant="outline"
                        className={cn(
                          "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                          getDateColor(new Date(todo.dueDate)),
                        )}
                      >
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {formatDate(new Date(todo.dueDate))}
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(todo.dueDate)}
                        onSelect={(date) => {
                          onUpdate(todo.id, { dueDate: date ?? null });
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {/* Subtask Badge (Toggle) */}
                {hasSubTodos && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors gap-1",
                      isExpanded
                        ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                        : "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800",
                    )}
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <ListTree className="w-3 h-3" />
                    <span>
                      {todo.subTodos?.filter((st) => st.isCompleted).length ||
                        0}
                      /{todo.subTodos?.length || 0}
                    </span>
                  </Badge>
                )}

                {/* Priority */}
                {todo.priority === "high" && (
                  <Badge
                    variant="outline"
                    className="text-red-500 border-red-200 bg-red-50 dark:bg-red-900/20"
                  >
                    중요
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

          {/* Actions Area */}
          <div className="mt-0 flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            {/* Add Subtask Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
                setIsAddingSubTask(true);
              }}
              className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="하위 항목 추가"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Calendar Selection */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="날짜 설정"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={todo.dueDate ? new Date(todo.dueDate) : undefined}
                  onSelect={(date) => {
                    onUpdate(todo.id, { dueDate: date ?? null });
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Folder Selection - Hidden on Mobile, shown on hover/desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <FolderIcon className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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

        {/* Sub Task Input */}
        {isAddingSubTask && (
          <div className="pl-12 pr-4 py-2 animate-in slide-in-from-top-1 duration-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem(
                  "content",
                ) as HTMLInputElement;
                if (input.value.trim()) {
                  onAddSubTodo(todo.id, input.value);
                  input.value = "";
                  setIsAddingSubTask(false);
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <input
                name="content"
                autoFocus
                className="flex-1 bg-transparent border-none text-sm focus:ring-0 placeholder:text-zinc-400 outline-none"
                placeholder="하위 항목 입력..."
                onBlur={() => {
                  setTimeout(() => setIsAddingSubTask(false), 100);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsAddingSubTask(false);
                }}
              />
            </form>
          </div>
        )}

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
      </div>
    </li>
  );
}

export function SortableTodoItem(props: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: "relative" as const,
  };

  return (
    <TodoItem
      {...props}
      innerRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
    />
  );
}
