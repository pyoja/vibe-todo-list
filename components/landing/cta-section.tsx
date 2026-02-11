"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function CtaSection() {
  const [hovered, setHovered] = useState(false);

  return (
    <section className="relative overflow-hidden py-32 text-center">
      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-5xl font-black tracking-tight md:text-8xl">
          Ready to Vibe?
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
          지금 바로 시작하세요. 무료입니다.
        </p>

        <div className="flex justify-center">
          <Link
            href="/login"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex h-16 w-64 items-center justify-center overflow-hidden rounded-full bg-black text-xl font-bold text-white transition-all hover:w-72 hover:shadow-2xl dark:bg-white dark:text-black"
          >
            <span className="relative z-10 mr-2 transition-transform group-hover:-translate-x-2">
              Get Started
            </span>
            <ArrowRight
              className={`relative z-10 h-6 w-6 transition-all duration-300 ${
                hovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-4"
              }`}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
