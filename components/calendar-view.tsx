"use client";

import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { type Todo } from "@/app/actions/todo";
import {
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { type DayButton } from "react-day-picker";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface CalendarViewProps {
  todos: Todo[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  defaultMonth?: Date;
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
  defaultMonth,
}: CalendarViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Initialize with server-provided defaultMonth to ensure hydration match
  const [currentMonth, setCurrentMonth] = useState<Date>(
    defaultMonth || new Date(),
  );

  // Sync current month with selected date if changed externally
  // useEffect(() => {
  //   if (selectedDate) setCurrentMonth(selectedDate);
  // }, [selectedDate]);

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

  // Removed guard clause as we now have a valid initial state from server

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        {/* by jh 20260210: 다크모드 텍스트 가시성 개선 */}
        <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          {isExpanded && (
            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-700 p-1 mr-2 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                aria-label="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-semibold w-24 text-center text-zinc-900 dark:text-zinc-100">
                {format(currentMonth, "yyyy년 M월", { locale: ko })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                aria-label="다음 달"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          {!isExpanded && "캘린더"}
        </h2>
        {/* by jh 20260210: 다크모드 확대/축소 버튼 가시성 개선 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2 text-xs h-8 text-zinc-700 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {isExpanded ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" /> 축소
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" /> 확대
            </>
          )}
        </Button>
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden",
          isExpanded ? "p-4" : "p-4 flex justify-center",
        )}
      >
        {isExpanded ? (
          <BigCalendar
            currentMonth={currentMonth}
            todos={todos}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        ) : (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelectDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={ko}
            className="p-0"
            // by jh 20260210: 선택 날짜 hover 시 자연스러운 스타일 유지
            modifiersClassNames={{
              selected:
                "bg-blue-600 text-white hover:!bg-blue-600 hover:!text-white focus:bg-blue-600 focus:text-white rounded-md",
              today:
                "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100",
            }}
            components={{
              DayButton: (props: React.ComponentProps<typeof DayButton>) => {
                const { day } = props;
                const modifiers = getModifiers(day.date);

                return (
                  <CalendarDayButton {...props}>
                    {props.children}
                    {boardIndicator(modifiers)}
                  </CalendarDayButton>
                );
              },
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

function BigCalendar({
  currentMonth,
  todos,
  selectedDate,
  onSelectDate,
}: {
  currentMonth: Date;
  todos: Todo[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { locale: ko });
  const endDate = endOfWeek(monthEnd, { locale: ko });
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  const weeks = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="w-full">
      {/* Weekpad Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weeks.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-zinc-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {dateRange.map((date) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isSelected = selectedDate
            ? isSameDay(date, selectedDate)
            : false;
          const isTodayDate = isToday(date);
          const dayTodos = todos.filter(
            (t) => t.dueDate && isSameDay(new Date(t.dueDate), date),
          );

          return (
            <div
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={cn(
                "min-h-[100px] p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1",
                isCurrentMonth
                  ? "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                  : "bg-zinc-50/50 dark:bg-zinc-900/50 border-transparent text-zinc-400 opacity-50",
                isSelected
                  ? "ring-2 ring-blue-500 border-transparent z-10 shadow-lg"
                  : "hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-sm",
                isTodayDate &&
                  !isSelected &&
                  "bg-blue-50/30 dark:bg-blue-900/10",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isTodayDate
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-zinc-700 dark:text-zinc-300",
                    !isCurrentMonth && !isTodayDate && "text-zinc-400",
                  )}
                >
                  {format(date, "d")}
                </span>
                {dayTodos.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                    {dayTodos.length}
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 mt-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                {dayTodos.slice(0, 3).map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      "text-[10px] px-1.5 py-1 rounded border flex items-center gap-1 truncate transition-colors",
                      todo.isCompleted
                        ? "bg-zinc-50 text-zinc-400 border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800 line-through decoration-zinc-400/50"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700 shadow-sm",
                    )}
                  >
                    <div
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        todo.priority === "high"
                          ? "bg-red-500"
                          : todo.priority === "medium"
                            ? "bg-blue-500"
                            : "bg-slate-400",
                      )}
                    />
                    <span className="truncate">{todo.content}</span>
                  </div>
                ))}
                {dayTodos.length > 3 && (
                  <div className="text-[10px] text-zinc-400 text-center font-medium">
                    +{dayTodos.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
