"use client";

import { cn } from "@/lib/utils";

const WORDS = ["FAST", "SIMPLE", "VIBE", "CLEAN", "MODERN", "FOCUS"];

export function ScrollingTicker() {
  return (
    <div className="relative flex w-full overflow-hidden bg-black py-12 dark:bg-white/5">
      <div className="flex w-max animate-scroll">
        {[...WORDS, ...WORDS, ...WORDS].map((word, i) => (
          <div
            key={i}
            className={cn(
              "mx-8 text-7xl font-black tracking-tighter md:text-9xl",
              i % 2 === 0
                ? "text-white dark:text-white"
                : "text-transparent stroke-text", // We need to add a utility for stroke-text or use standard CSS
            )}
            style={{
              WebkitTextStroke:
                i % 2 !== 0 ? "2px rgba(255,255,255,0.3)" : undefined,
              color: i % 2 !== 0 ? "transparent" : undefined,
            }}
          >
            {word}
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-black to-transparent z-10 dark:from-black" />
      <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-black to-transparent z-10 dark:from-black" />
    </div>
  );
}
