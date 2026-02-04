"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

function Counter({
  from,
  to,
  duration = 2,
}: {
  from: number;
  to: number;
  duration?: number;
}) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-100px" });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

      setCount(Math.floor(easeOutQuart(progress) * (to - from) + from));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, from, to, duration]);

  return <span ref={nodeRef}>{count.toLocaleString()}</span>;
}

export function StatsCounter() {
  return (
    <section className="py-20 border-t border-slate-100 dark:border-zinc-900 bg-white dark:bg-black w-full">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800">
          <div className="text-center py-4 md:py-0 space-y-2">
            <div className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-500">
              <Counter from={0} to={3} />분
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              하루를 정리하는 시간
            </p>
          </div>

          <div className="text-center py-4 md:py-0 space-y-2">
            <div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              <Counter from={0} to={128450} duration={2.5} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              기록된 하루 조각
            </p>
          </div>

          <div className="text-center py-4 md:py-0 space-y-2">
            <div className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
              <Counter from={0} to={98} />%
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              사용자 재방문율
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
