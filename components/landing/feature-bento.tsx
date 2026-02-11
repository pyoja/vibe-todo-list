"use client";

import { motion } from "framer-motion";
import { Copy, Layers, Zap, Calendar } from "lucide-react";

export const features = [
  {
    title: "본질에 집중한 인터페이스",
    description: "설정할 것도, 배울 것도 없습니다. 열고, 적고, 닫으세요.",
    icon: Copy,
    className:
      "col-span-1 md:col-span-2 lg:col-span-1 bg-blue-500/5 hover:bg-blue-500/10 border-blue-200/20",
  },
  {
    title: "압도적인 속도",
    description:
      "이미지 없는 텍스트 기반의 가벼움으로 어떤 환경에서도 즉시 실행됩니다.",
    icon: Zap,
    className:
      "col-span-1 md:col-span-2 lg:col-span-2 bg-purple-500/5 hover:bg-purple-500/10 border-purple-200/20",
  },
  {
    title: "조각들이 모여 만드는 기록",
    description:
      "당신의 파편화된 생각들을 하나의 아름다운 타임라인으로 엮어줍니다.",
    icon: Layers,
    className:
      "col-span-1 md:col-span-2 lg:col-span-2 bg-amber-500/5 hover:bg-amber-500/10 border-amber-200/20",
  },
  {
    title: "캘린더 뷰",
    description: "일정을 한눈에 파악하고 드래그로 손쉽게 관리할 수 있습니다.",
    icon: Calendar,
    className:
      "col-span-1 md:col-span-1 lg:col-span-1 bg-green-500/5 hover:bg-green-500/10 border-green-200/20",
  },
];

export function FeatureBento() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mb-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
          Designed for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Flow State
          </span>
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          불필요한 기능은 과감히 덜어냈습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className={`group relative overflow-hidden rounded-3xl border backdrop-blur-md p-8 transition-all hover:-translate-y-1 hover:shadow-2xl ${feature.className}`}
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-sm backdrop-blur-xl">
              <feature.icon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 break-keep">
              {feature.description}
            </p>

            {/* Border Beam Effect Mockup */}
            <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
