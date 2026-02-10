"use client";

import { motion } from "framer-motion";

export function FlowText() {
  const lines = [
    "오늘 마신 커피 한 잔,",
    "문득 떠오른 아이디어,",
    "잊지 말아야 할 약속까지.",
  ];

  return (
    <section className="py-40 bg-white dark:bg-black min-h-[80vh] flex flex-col items-center justify-center overflow-hidden">
      <div className="space-y-12 text-center px-4">
        {lines.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
          >
            <span className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-300 dark:text-zinc-700">
              {line}
            </span>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="pt-12"
        >
          <span className="text-4xl sm:text-6xl md:text-7xl font-black text-black dark:text-white block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            당신의 모든 조각이
            <br className="md:hidden" /> 이곳에서 기록됩니다.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
