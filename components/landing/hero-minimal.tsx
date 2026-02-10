"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HeroMinimal() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden px-4">
      <div className="w-full max-w-[1200px] mx-auto text-center space-y-12 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-black dark:text-white leading-[0.9] break-keep"
        >
          하루를 채우는 <br />
          <span className="text-blue-600 dark:text-blue-500 inline-block mt-2">
            가장 가벼운 방법.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed break-keep"
        >
          복잡한 툴에 지친 당신을 위해,
          <br className="hidden sm:block" />
          기록의 본질만 남겼습니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <Link href="/login">
            <Button
              size="lg"
              className="h-16 px-10 text-xl font-bold rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all hover:scale-105 hover:px-12 duration-300"
            >
              지금 바로 조각 시작하기
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Background Text (Subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none">
        <span className="text-[15vw] font-black leading-none text-black dark:text-white">
          DAYPIECE
        </span>
      </div>
    </section>
  );
}
