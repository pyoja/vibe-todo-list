"use client";

import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { type Todo } from "@/app/actions/todo";
import { isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type DayButton } from "react-day-picker";
import React from "react";

interface CalendarViewProps {
  todos: Todo[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

interface DayModifiers {
  hasTodos: boolean;
  hasIncomplete: boolean;
  allCompleted: boolean;
  count: number;
}

export function CalendarView({
  todos,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  // 날짜별 할 일(마감일 기준) 매핑
  const getModifiers = (date: Date): DayModifiers | null => {
    const dayTodos = todos.filter((todo) => {
      if (!todo.dueDate) return false;
      return isSameDay(new Date(todo.dueDate), date);
    });

    if (dayTodos.length === 0) return null;

    const hasIncomplete = dayTodos.some((t) => !t.isCompleted);
    const allCompleted = dayTodos.every((t) => t.isCompleted);

    return {
      hasTodos: true,
      hasIncomplete,
      allCompleted,
      count: dayTodos.length,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 flex justify-center"
    >
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        locale={ko}
        className="p-0"
        modifiersClassNames={{
          selected:
            "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
          today:
            "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
        }}
        components={{
          DayButton: (props: React.ComponentProps<typeof DayButton>) => {
            const { day } = props;
            const modifiers = getModifiers(day.date);

            return (
              <CalendarDayButton {...props}>
                {/* date.getDate() logic is handled by Children of DayButton usually, but check children prop */}
                {props.children}
                {boardIndicator(modifiers)}
              </CalendarDayButton>
            );
          },
        }}
      />
    </motion.div>
  );
}

function boardIndicator(modifiers: DayModifiers | null) {
  if (!modifiers || !modifiers.hasTodos) return null;

  return (
    <div className="flex gap-0.5 justify-center w-full mt-1">
      <div
        className={cn(
          "h-1.5 w-1.5 rounded-full transition-all",
          modifiers.hasIncomplete
            ? "bg-blue-500"
            : "bg-zinc-300 dark:bg-zinc-600",
        )}
      />
      {modifiers.count > 1 && (
        <div className="h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      )}
    </div>
  );
}
