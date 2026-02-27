"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  SensorDescriptor,
  SensorOptions,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CalendarView } from "@/components/calendar-view";
import { EmptyState } from "@/components/empty-state";
import { SortableTodoItem, TodoItem } from "@/components/sortable-todo-item";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { type Todo } from "@/app/actions/todo";
import { type Folder } from "@/app/actions/folder";
import { type SubTodo } from "@/app/actions/subtodo";

interface TodoListBodyProps {
  view: "list" | "calendar";
  filteredTodos: Todo[];
  optimisticTodos: Todo[]; // Needed for DragOverlay (source of truth for item being dragged)
  folders: Folder[];
  FOLDER_COLORS: Record<string, string>;
  activeId: string | null;
  sensors: SensorDescriptor<SensorOptions>[];
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
  selectedDate?: Date;
  onSelectDate: (date: Date | undefined) => void;

  // Handlers
  onToggle: (id: string, isCompleted: boolean) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
  onPriorityChange: (id: string, priority: "low" | "medium" | "high") => void;
  onFolderChange: (id: string, folderId: string | null) => void;
  onAddSubTodo: (todoId: string, content: string) => Promise<void>;
  onToggleSubTodo: (
    todoId: string,
    subTodoId: string,
    isCompleted: boolean,
  ) => void;
  onDeleteSubTodo: (todoId: string, subTodoId: string) => void;
  onUpdateSubTodo: (todoId: string, subTodoId: string, content: string) => void;
  onReorderSubTodos: (todoId: string, newSubTodos: SubTodo[]) => void;
  defaultDate?: Date;
  // by jh 20260210: 마감일 미지정 패널에서 폴더 필터 적용용
  folderId?: string;
}

export function TodoListBody({
  view,
  filteredTodos,
  optimisticTodos,
  folders,
  FOLDER_COLORS,
  activeId,
  sensors,
  onDragStart,
  onDragEnd,
  selectedDate,
  onSelectDate,
  onToggle,
  onUpdate,
  onDelete,
  onPriorityChange,
  onFolderChange,
  onAddSubTodo,
  onToggleSubTodo,
  onDeleteSubTodo,
  onUpdateSubTodo,
  onReorderSubTodos,
  defaultDate,
  folderId,
}: TodoListBodyProps) {
  // by jh 20260210: 마감일 미지정 패널 접기/펼치기 상태
  const [isUnscheduledOpen, setIsUnscheduledOpen] = useState(false);

  // by jh 20260210: 마감일 미지정 할 일 필터링 (폴더 필터도 적용)
  const unscheduledTodos =
    view === "calendar"
      ? optimisticTodos.filter((todo) => {
          if (todo.dueDate) return false;
          if (folderId && todo.folderId !== folderId) return false;
          return true;
        })
      : [];
  return (
    <>
      <AnimatePresence mode="popLayout">
        {view === "calendar" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <CalendarView
              todos={optimisticTodos} // Pass all todos to calendar
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              defaultMonth={defaultDate}
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

            {/* by jh 20260210: 마감일 미지정 할 일 패널 */}
            {unscheduledTodos.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setIsUnscheduledOpen(!isUnscheduledOpen)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-900/15 border border-amber-200/60 dark:border-amber-800/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/25 transition-all group"
                >
                  <span className="text-amber-600 dark:text-amber-400 text-sm">
                    📌
                  </span>
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    마감일 미지정
                  </span>
                  <span className="text-xs font-bold bg-amber-200/80 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    {unscheduledTodos.length}
                  </span>
                  <svg
                    className={`w-4 h-4 ml-auto text-amber-500 dark:text-amber-400 transition-transform duration-200 ${
                      isUnscheduledOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {isUnscheduledOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-3">
                        {unscheduledTodos.map((todo) => (
                          <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            folders={folders}
                            FOLDER_COLORS={FOLDER_COLORS}
                            onToggle={onToggle}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onPriorityChange={onPriorityChange}
                            onFolderChange={onFolderChange}
                            onAddSubTodo={onAddSubTodo}
                            onToggleSubTodo={onToggleSubTodo}
                            onDeleteSubTodo={onDeleteSubTodo}
                            onUpdateSubTodo={onUpdateSubTodo}
                            onReorderSubTodos={onReorderSubTodos}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext
        id="todo-dnd-context"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="space-y-4 relative z-0">
          <AnimatePresence mode="wait">
            {view === "calendar" ? (
              // In Calendar view, we render the filtered list based on date
              // But usually CalendarView implies a different layout.
              // Based on original code, when view is calendar, it shows CalendarView ABOVE,
              // and the LIST BELOW shows todos for the selected date.
              // The original code uses `filteredTodos` which includes the date filter logic.
              <motion.div
                key="calendar-list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                {/* Note: In original code, CalendarView was passed `optimisticTodos`. 
                    Here we reuse `CalendarView` above. 
                    The list below is for the selected date's todos. */}
                {filteredTodos.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-3 pb-20">
                    {filteredTodos.map((todo) => (
                      <SortableTodoItem
                        key={todo.id}
                        todo={todo}
                        folders={folders}
                        FOLDER_COLORS={FOLDER_COLORS}
                        onToggle={onToggle}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onPriorityChange={onPriorityChange}
                        onFolderChange={onFolderChange}
                        onAddSubTodo={onAddSubTodo}
                        onToggleSubTodo={onToggleSubTodo}
                        onDeleteSubTodo={onDeleteSubTodo}
                        onUpdateSubTodo={onUpdateSubTodo}
                        onReorderSubTodos={onReorderSubTodos}
                      />
                    ))}
                  </div>
                )}
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
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onPriorityChange={onPriorityChange}
                      onFolderChange={onFolderChange}
                      onAddSubTodo={onAddSubTodo}
                      onToggleSubTodo={onToggleSubTodo}
                      onDeleteSubTodo={onDeleteSubTodo}
                      onUpdateSubTodo={onUpdateSubTodo}
                      onReorderSubTodos={onReorderSubTodos}
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
              onUpdateSubTodo={() => {}}
              onReorderSubTodos={() => {}}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
