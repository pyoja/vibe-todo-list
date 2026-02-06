"use client";

import { Search, X, LayoutList, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ControlBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  priorityFilter: "all" | "low" | "medium" | "high";
  setPriorityFilter: (value: "all" | "low" | "medium" | "high") => void;
  dueDateFilter: "all" | "overdue" | "today" | "week";
  setDueDateFilter: (value: "all" | "overdue" | "today" | "week") => void;
  sortBy: "created" | "dueDate" | "priority" | "name" | "manual";
  setSortBy: (
    value: "created" | "dueDate" | "priority" | "name" | "manual",
  ) => void;
  view: "list" | "calendar";
  setView: (value: "list" | "calendar") => void;
  filter: "all" | "active" | "completed";
  setFilter: (value: "all" | "active" | "completed") => void;
}

export function ControlBar({
  searchTerm,
  setSearchTerm,
  priorityFilter,
  setPriorityFilter,
  dueDateFilter,
  setDueDateFilter,
  sortBy,
  setSortBy,
  view,
  setView,
  filter,
  setFilter,
}: ControlBarProps) {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl p-2 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 transition-all flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="무엇을 찾고 계신가요? (Cmd+K)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 h-9 bg-zinc-50 dark:bg-zinc-800 border-0 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={priorityFilter}
          onValueChange={(value) =>
            setPriorityFilter(value as "all" | "low" | "medium" | "high")
          }
        >
          <SelectTrigger className="h-9 w-28 text-xs">
            <SelectValue placeholder="우선순위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="high">높음</SelectItem>
            <SelectItem value="medium">보통</SelectItem>
            <SelectItem value="low">낮음</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={dueDateFilter}
          onValueChange={(value) =>
            setDueDateFilter(value as "all" | "overdue" | "today" | "week")
          }
        >
          <SelectTrigger className="h-9 w-28 text-xs">
            <SelectValue placeholder="마감일" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="overdue">지난 일</SelectItem>
            <SelectItem value="today">오늘</SelectItem>
            <SelectItem value="week">이번 주</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value) =>
            setSortBy(
              value as "created" | "dueDate" | "priority" | "name" | "manual",
            )
          }
        >
          <SelectTrigger className="h-9 w-28 text-xs">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">직접 설정</SelectItem>
            <SelectItem value="created">생성일</SelectItem>
            <SelectItem value="dueDate">마감일</SelectItem>
            <SelectItem value="priority">우선순위</SelectItem>
            <SelectItem value="name">이름</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 flex items-center shrink-0 h-9">
          <button
            onClick={() => setView("list")}
            className={cn(
              "p-1.5 rounded-md transition-all h-7 w-7 flex items-center justify-center",
              view === "list"
                ? "bg-white dark:bg-black shadow-sm text-blue-600"
                : "text-zinc-400 hover:text-zinc-600",
            )}
            title="리스트 보기"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "p-1.5 rounded-md transition-all h-7 w-7 flex items-center justify-center",
              view === "calendar"
                ? "bg-white dark:bg-black shadow-sm text-blue-600"
                : "text-zinc-400 hover:text-zinc-600",
            )}
            title="캘린더 보기"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
        </div>

        <Tabs
          value={filter}
          onValueChange={(v: string) =>
            setFilter(v as "all" | "active" | "completed")
          }
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-auto grid-cols-3 h-9 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger value="all" className="text-xs font-bold px-3">
              전체
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs font-bold px-3">
              진행중
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs font-bold px-3">
              완료
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
