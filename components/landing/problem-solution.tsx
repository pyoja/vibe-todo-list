"use client";

import { motion } from "framer-motion";

export function ProblemSolution() {
  return (
    <section className="py-24 sm:py-32 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center">
        {/* Problem */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">
              The Problem
            </h3>
            <p className="text-2xl sm:text-3xl font-medium text-zinc-400 dark:text-zinc-600 leading-snug break-keep">
              &quot;기능이 너무 많아서 무엇을 적어야 할지 고민되나요? <br />
              설정하다가 하루가 다 지나가진 않나요?&quot;
            </p>
          </motion.div>
        </div>

        {/* Solution */}
        <div className="space-y-6 md:text-right">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-2">
              The Solution
            </h3>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-black dark:text-white leading-tight break-keep">
              하루조각은 고민하지 않습니다.
              <br />
              <span className="text-blue-600 dark:text-blue-500">
                쓰기 시작하는 순간,
              </span>
              <br />
              정리는 이미 시작되었으니까요.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
