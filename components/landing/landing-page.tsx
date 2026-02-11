"use client";

import { CtaSection } from "./cta-section";
import { DemoSection } from "./demo-section";
import { FeatureBento } from "./feature-bento";
import { HeroSection } from "./hero-section";
import { ScrollingTicker } from "./scrolling-ticker";
import { TestimonialsSection } from "./testimonials-section";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white dark:bg-black dark:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Noise Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 h-full w-full bg-noise opacity-[0.03] mix-blend-overlay" />

      <HeroSection />
      <DemoSection />
      <ScrollingTicker />
      <FeatureBento />
      <TestimonialsSection />
      <CtaSection />

      <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-gray-500 dark:text-gray-600 bg-zinc-50 dark:bg-black">
        <p className="mb-2 font-medium">Simple is Best. Daypiece.</p>
        <p>© {new Date().getFullYear()} 하루조각. All rights reserved.</p>
      </footer>
    </main>
  );
}
