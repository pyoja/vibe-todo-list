"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Loader2, Calendar as CalendarIcon, Repeat } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export interface TodoInputMeta {
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  recurrence: {
    isRecurring: boolean;
    pattern: "daily" | "weekly" | "monthly" | null;
    interval: number;
  };
}

interface TodoInputProps {
  onAdd: (formData: FormData, meta: TodoInputMeta) => void;
  isPending: boolean;
  view: "list" | "calendar";
  selectedDate?: Date;
  defaultPriority?: "low" | "medium" | "high";
}

export function TodoInput({
  onAdd,
  isPending,
  view,
  selectedDate,
  defaultPriority = "medium",
}: TodoInputProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    defaultPriority,
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<{
    isRecurring: boolean;
    pattern: "daily" | "weekly" | "monthly" | null;
    interval: number;
  }>({ isRecurring: false, pattern: null, interval: 1 });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Global Shortcut: Ctrl + N to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (formData: FormData) => {
    // Pass local state as metadata to parent
    onAdd(formData, { priority, dueDate, recurrence });

    // Reset local state
    setPriority("medium");
    setDueDate(undefined);
    setRecurrence({ isRecurring: false, pattern: null, interval: 1 });
    formRef.current?.reset();
  };

  return (
    <div className="relative group z-10">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
      <form
        ref={formRef}
        action={handleSubmit}
        className="relative flex flex-col gap-4 bg-gradient-to-br from-white to-blue-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/70 shadow-lg dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3),0_8px_30px_rgba(0,0,0,0.4)] group-hover:border-blue-400/40 dark:group-hover:border-blue-500/50 transition-all duration-300"
      >
        <Input
          ref={inputRef}
          name="content"
          placeholder={
            view === "calendar" && selectedDate
              ? `${format(selectedDate, "M월 d일", { locale: ko })} 어떤 하루를 만들까요? ✨`
              : "오늘은 어떤 하루를 그리고 계신가요?"
          }
          className="border-0 focus-visible:ring-0 bg-transparent text-base sm:text-xl font-medium pl-3 min-h-[60px] placeholder:text-zinc-400 dark:placeholder:text-zinc-300 selection:bg-blue-100 dark:selection:bg-blue-900 placeholder:font-normal text-zinc-900 dark:text-zinc-100"
          autoComplete="off"
          disabled={isPending}
        />

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Select
              value={priority}
              onValueChange={(v: string) =>
                setPriority(v as "low" | "medium" | "high")
              }
            >
              <SelectTrigger className="h-8 border-transparent bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs gap-1.5 px-2.5 rounded-full transition-colors focus:ring-0">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    priority === "high"
                      ? "bg-red-500"
                      : priority === "medium"
                        ? "bg-blue-500"
                        : "bg-slate-400",
                  )}
                />
                <SelectValue placeholder="중요도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">낮음</SelectItem>
                <SelectItem value="medium">보통</SelectItem>
                <SelectItem value="high">높음</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Picker */}
            {view !== "calendar" && (
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-2.5 text-xs rounded-full bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors",
                      dueDate &&
                        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
                    )}
                  >
                    <CalendarIcon className={cn("w-3.5 h-3.5 mr-1.5")} />
                    {dueDate
                      ? format(dueDate, "M월 d일", { locale: ko })
                      : "마감일"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                    locale={ko}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Recurrence Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "h-8 px-2 text-xs font-medium rounded-full transition-colors",
                    recurrence.isRecurring
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-200 dark:ring-purple-800"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                  )}
                >
                  <Repeat className={cn("w-3.5 h-3.5 mr-1.5")} />
                  {recurrence.isRecurring
                    ? recurrence.pattern === "daily"
                      ? "매일"
                      : recurrence.pattern === "weekly"
                        ? "매주"
                        : "매월"
                    : "반복"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 space-y-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-xs text-zinc-500 dark:text-zinc-400">
                    반복 설정
                  </h4>
                  <div className="grid grid-cols-3 gap-1">
                    {(["daily", "weekly", "monthly"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setRecurrence({
                            isRecurring: true,
                            pattern: p,
                            interval: recurrence.interval || 1,
                          })
                        }
                        className={cn(
                          "px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                          recurrence.pattern === p
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 ring-1 ring-purple-500/20"
                            : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700",
                        )}
                      >
                        {p === "daily"
                          ? "매일"
                          : p === "weekly"
                            ? "매주"
                            : "매월"}
                      </button>
                    ))}
                  </div>
                </div>

                {recurrence.isRecurring && (
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500">간격:</span>
                    <Input
                      type="number"
                      min={1}
                      value={recurrence.interval}
                      onChange={(e) =>
                        setRecurrence({
                          ...recurrence,
                          interval: parseInt(e.target.value) || 1,
                        })
                      }
                      className="h-7 w-16 text-xs text-center px-1"
                    />
                    <span className="text-xs text-zinc-500">
                      {recurrence.pattern === "daily"
                        ? "일마다"
                        : recurrence.pattern === "weekly"
                          ? "주마다"
                          : "개월마다"}
                    </span>
                  </div>
                )}

                {recurrence.isRecurring && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() =>
                      setRecurrence({
                        isRecurring: false,
                        pattern: null,
                        interval: 1,
                      })
                    }
                  >
                    반복 안 함
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
            ) : (
              <Plus className="w-3.5 h-3.5 mr-1" />
            )}
            추가
          </Button>
        </div>
      </form>
    </div>
  );
}
