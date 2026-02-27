import { useState, useRef, useEffect } from "react";
import { type SubTodo } from "@/app/actions/subtodo";
import { Input } from "@/components/ui/input";
import { Check, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { GripVertical } from "lucide-react";
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
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SubTodoListProps {
  todoId: string;
  subTodos: SubTodo[];
  onToggle: (todoId: string, subTodoId: string, isCompleted: boolean) => void;
  onDelete: (todoId: string, subTodoId: string) => void;
  onUpdate: (todoId: string, subTodoId: string, content: string) => void;
  onReorder: (todoId: string, newSubTodos: SubTodo[]) => void;
}

// 추출된 Sortable 하위 항목 컴포넌트
function SortableSubTodoItem({
  subTodo,
  todoId,
  editingId,
  editContent,
  setEditingId,
  setEditContent,
  handleEditSubmit,
  onToggle,
  onDelete,
  editInputRef,
  setLightboxSrc,
}: {
  subTodo: SubTodo;
  todoId: string;
  editingId: string | null;
  editContent: string;
  setEditingId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  handleEditSubmit: (id: string) => void;
  onToggle: (todoId: string, subTodoId: string, isCompleted: boolean) => void;
  onDelete: (todoId: string, subTodoId: string) => void;
  editInputRef: React.RefObject<HTMLInputElement | null>;
  setLightboxSrc: (src: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subTodo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: "relative" as const,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 text-sm p-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-md transition-all duration-200",
        isDragging && "opacity-50 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm",
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        onPointerDown={(e) => {
          // by jh 20260227: Prevent parent Todo from dragging when dragging SubTodo
          e.stopPropagation();
          listeners?.onPointerDown?.(e);
        }}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-300 hover:text-blue-500 transition-colors touch-none p-1 -ml-1 outline-none rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

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
            className="h-6 text-sm py-0 px-1 rounded-sm border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
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

      {/* by jh 20260210: 하위항목 첨부 이미지 썸네일 */}
      {subTodo.imageUrl && (
        <button
          type="button"
          onClick={() => setLightboxSrc(subTodo.imageUrl || null)}
          className="flex-shrink-0 rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:ring-1 hover:ring-blue-400/50 transition-all cursor-zoom-in"
        >
          <img
            src={subTodo.imageUrl}
            alt="첨부"
            className="w-8 h-8 object-cover"
          />
        </button>
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
  );
}

export function SubTodoList({
  todoId,
  subTodos,
  onToggle,
  onDelete,
  onUpdate,
  onReorder,
}: SubTodoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);
  // by jh 20260210: 이미지 라이트박스 상태
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // 2px movement required before drag starts to allow clicks to pass through
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subTodos.findIndex((st) => st.id === active.id);
      const newIndex = subTodos.findIndex((st) => st.id === over.id);

      // We clone the array and move the item manually (or use arrayMove internal method if available)
      const newSubTodos = [...subTodos];
      const [movedItem] = newSubTodos.splice(oldIndex, 1);
      newSubTodos.splice(newIndex, 0, movedItem);

      onReorder(todoId, newSubTodos);
    }
  };

  return (
    <>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={subTodos.map((st) => st.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-1">
              {subTodos.map((subTodo) => (
                <SortableSubTodoItem
                  key={subTodo.id}
                  subTodo={subTodo}
                  todoId={todoId}
                  editingId={editingId}
                  editContent={editContent}
                  setEditingId={setEditingId}
                  setEditContent={setEditContent}
                  handleEditSubmit={handleEditSubmit}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  editInputRef={editInputRef}
                  setLightboxSrc={setLightboxSrc}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {/* by jh 20260210: 이미지 라이트박스 */}
      <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </>
  );
}
