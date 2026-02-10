"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "✦",
    title: "본질에 집중한 인터페이스",
    desc: "설정할 것도, 배울 것도 없습니다.\n열고, 적고, 닫으세요.",
  },
  {
    icon: "⚡︎",
    title: "압도적인 속도",
    desc: "이미지 없는 텍스트 기반의 가벼움으로\n어떤 환경에서도 즉시 실행됩니다.",
  },
  {
    icon: "■",
    title: "조각들이 모여 만드는 기록",
    desc: "당신의 파편화된 생각들을\n하나의 아름다운 타임라인으로 엮어줍니다.",
  },
];

export function FeaturesText() {
  return (
    <section className="py-24 bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-zinc-200 dark:border-zinc-800 pt-16">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="space-y-4 group cursor-default"
            >
              <div className="text-4xl sm:text-5xl text-blue-600 dark:text-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300 origin-left font-serif">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold tracking-tight">
                {feature.title}
              </h3>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
