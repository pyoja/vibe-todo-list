"use client";

import { motion } from "framer-motion";

const reviews = [
  {
    text: "노션이나 에버노트는 너무 무거웠어요. 하루조각은 제 메모 습관을 완전히 바꿔놓았습니다.",
    author: "사용자 A",
    role: "디자이너",
  },
  {
    text: "복잡한 설정 없이 그냥 쓰면 되는 점이 가장 좋습니다. 집중력이 끊기지 않아요.",
    author: "사용자 B",
    role: "개발자",
  },
  {
    text: "하루를 조각내어 기록한다는 컨셉이 너무 마음에 듭니다. 매일매일이 정리되는 기분이에요.",
    author: "사용자 C",
    role: "기획자",
  },
];

export function TestimonialsText() {
  return (
    <section className="py-32 bg-zinc-950 text-white">
      <div className="max-w-[1000px] mx-auto px-6 space-y-20">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest text-center mb-12">
          From Users
        </h2>

        <div className="grid gap-12">
          {reviews.map((review, idx) => (
            <motion.figure
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="border-l-2 border-zinc-800 pl-8 md:pl-12 hover:border-blue-500 transition-colors duration-300"
            >
              <blockquote className="text-2xl md:text-3xl font-bold leading-relaxed mb-6">
                &quot;{review.text}&quot;
              </blockquote>
              <figcaption className="flex items-center gap-2 text-zinc-500">
                <span className="font-semibold text-white">
                  {review.author}
                </span>
                <span className="text-zinc-700">/</span>
                <span>{review.role}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
