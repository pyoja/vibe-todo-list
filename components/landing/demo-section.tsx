"use client";

import { InteractiveDemo } from "@/components/landing/interactive-demo";

export function DemoSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-[100px] rounded-full opacity-50 dark:opacity-30 pointer-events-none" />

      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
            직접 경험해보세요
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            앱을 설치하지 않아도, 웹에서 바로 시작할 수 있습니다.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Border Beam Effect Container */}
          <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl p-2 sm:p-8 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none border border-transparent rounded-3xl [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
              <div className="absolute aspect-square w-full top-0 left-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 animate-border-beam" />
            </div>

            <InteractiveDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
