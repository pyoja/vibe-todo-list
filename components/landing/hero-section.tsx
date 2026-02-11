"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 blur-[120px] rounded-full opacity-50 dark:opacity-20 animate-pulse" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full opacity-30 dark:opacity-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full opacity-30 dark:opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-5xl"
      >
        <div className="mb-8 flex items-center justify-center">
          <span className="relative flex items-center justify-center gap-2 rounded-full border border-black/5 bg-black/5 px-4 py-1.5 text-sm font-medium text-black/60 backdrop-blur-sm transition-colors hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="font-semibold">Simple is Best</span>
          </span>
        </div>

        <h1 className="mb-6 text-6xl font-black tracking-tighter md:text-8xl lg:text-9xl leading-[0.9]">
          <span className="block text-black dark:text-white">
            하루를 채우는
          </span>
          <span className="block animate-text-gradient bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-[200%_auto] bg-clip-text text-transparent pb-4">
            가장 가벼운 방법.
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-2xl font-medium leading-relaxed break-keep dark:text-gray-400">
          복잡한 툴에 지친 당신을 위해,
          <br className="hidden md:block" />
          기록의 본질만 남겼습니다.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-black px-10 text-lg font-bold text-white transition-all duration-300 hover:w-64 hover:bg-gray-900 hover:ring-4 hover:ring-gray-900/20 hover:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-gray-100 dark:hover:ring-gray-100/20 dark:hover:ring-offset-black"
          >
            <span className="mr-2">지금 바로 시작하기</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 -z-10 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:animate-shimmer" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
