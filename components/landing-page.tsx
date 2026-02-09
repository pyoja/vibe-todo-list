"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Puzzle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
// by jh 20260209: Removed TodoList import due to guest mode removal
import { InteractiveDemo } from "@/components/landing/interactive-demo";
import { Testimonials } from "@/components/landing/testimonials";
import { StatsCounter } from "@/components/landing/stats-counter";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Navigation (Simple) */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-slate-100 dark:border-zinc-900/50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Puzzle className="w-5 h-5" />
          </div>
          <span className="text-zinc-900 dark:text-zinc-50">하루조각</span>
        </div>
        <div className="flex gap-4 items-center">
          <ModeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              className="font-medium text-zinc-700 dark:text-zinc-200"
            >
              로그인
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            🚀 더 나은 생산성을 위한 새로운 경험
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both delay-100">
            당신의 하루를 <br className="hidden sm:block" />
            <span className="text-blue-600">조각조각 완성해보세요</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both delay-200 break-keep">
            복잡한 기능을 덜어내고, 꼭 필요한 것만 남겼습니다.
            <br />
            하루조각과 함께 소중한 일상을 기록하고 관리하세요.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 fill-mode-both delay-300">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
              >
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 relative w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500 px-4 sm:px-0">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900">
            <Image
              src="/hero-app.png"
              alt="Daypiece App Interface"
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </main>

      {/* Interactive Demo Section */}
      <section className="py-20 px-4 w-full bg-slate-50/50 dark:bg-zinc-900/20">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              지금 바로 기록해보세요
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              회원가입 없이도 체험할 수 있습니다.
            </p>
          </div>
          <InteractiveDemo />
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-zinc-900/30 border-y border-slate-100 dark:border-zinc-900 w-full">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
              Simple is Best
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              복잡한 기능은 덜어냈습니다
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              수많은 버튼과 설정에 지치셨나요?
              <br className="hidden sm:block" />
              Daypiece는 오직 <strong>&apos;당신의 오늘&apos;</strong>에만
              집중할 수 있도록 설계되었습니다.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black group hover:shadow-2xl transition-all duration-500">
            <Image
              src="/comparison-ui.png"
              alt="Comparison: Complex Planner vs Daypiece"
              width={1200}
              height={600}
              className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsCounter />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-600">
        © 2026 하루조각. All rights reserved.
      </footer>
    </div>
  );
}
