"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Puzzle } from "lucide-react";
import { HeroMinimal } from "@/components/landing/hero-minimal";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { FeaturesText } from "@/components/landing/features-text";
import { FlowText } from "@/components/landing/flow-text";
import { TestimonialsText } from "@/components/landing/testimonials-text";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black selection:bg-blue-100 dark:selection:bg-blue-900">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black">
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

      <main className="flex-1 pt-16">
        <HeroMinimal />
        <ProblemSolution />
        <FeaturesText />
        <FlowText />
        <TestimonialsText />
      </main>

      {/* Footer */}
      <footer className="py-12 bg-zinc-50 dark:bg-zinc-950 text-center text-sm text-zinc-400 dark:text-zinc-600 border-t border-zinc-100 dark:border-zinc-900">
        <p className="mb-4 font-medium">Simple is Best. Daypiece.</p>
        <p>© 2026 하루조각. All rights reserved.</p>
      </footer>
    </div>
  );
}
