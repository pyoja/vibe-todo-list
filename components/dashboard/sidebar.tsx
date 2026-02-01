"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Calendar,
  Star,
  Inbox,
  Briefcase,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Sidebar() {
  return (
    <div className="flex h-full w-[280px] flex-col bg-slate-50 dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
      {/* Profile Section */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-slate-200 dark:border-zinc-700">
          <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Antigravity User
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Pro Plan
          </span>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search"
            className="pl-9 h-9 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 rounded-lg focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {/* Navigation & Folders */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {/* Smart Lists */}
          <div className="grid grid-cols-2 gap-2 p-2">
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-zinc-700/50 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="bg-blue-500 rounded-full p-1.5 text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-slate-700 dark:text-slate-200">
                  5
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                오늘 할 일
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-zinc-700/50 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="bg-red-500 rounded-full p-1.5 text-white">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-slate-700 dark:text-slate-200">
                  2
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                예정됨
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-zinc-700/50 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="bg-amber-400 rounded-full p-1.5 text-white">
                  <Star className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-slate-700 dark:text-slate-200">
                  0
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                중요
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-zinc-700/50 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div className="bg-slate-500 rounded-full p-1.5 text-white">
                  <Inbox className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg text-slate-700 dark:text-slate-200">
                  8
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                전체
              </span>
            </div>
          </div>

          <div className="pt-4 px-2">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2 px-2">
              나의 목록
            </h3>
            <div className="space-y-0.5">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-lg h-10 px-3 hover:bg-white dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
              >
                <div className="bg-orange-400 p-1.5 rounded-full mr-3 text-white">
                  <Briefcase className="h-3 w-3" />
                </div>
                업무
                <span className="ml-auto text-xs text-slate-400">3</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-lg h-10 px-3 hover:bg-white dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300"
              >
                <div className="bg-green-400 p-1.5 rounded-full mr-3 text-white">
                  <User className="h-3 w-3" />
                </div>
                개인
                <span className="ml-auto text-xs text-slate-400">2</span>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Bottom Action */}
      <div className="p-3 mt-auto border-t border-slate-200 dark:border-zinc-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-zinc-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          새로운 목록
        </Button>
      </div>
    </div>
  );
}
