"use client";

import { usePWAInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function PWAInstallBanner() {
  const { isInstallable, installApp, isIOS, isStandalone } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if installable and not already standalone
    // Delay slightly to not annoy immediately
    if (isInstallable && !isStandalone) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone]);

  if (!isVisible && !isIOS) return null;
  // Note: For iOS, we might want to show different instructions,
  // but for now let's focus on the standard install prompt which works for Android/Desktop.
  // If we want to support iOS instructions, we'd need a separate UI state.
  // Let's hide if not installable (Android/Desktop) and handled by browser on iOS usually manual.
  // actually usePWAInstall doesn't detect "installable" on iOS the same way.

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-[calc(50%-200px)] md:right-auto md:w-[400px]"
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">앱으로 설치하기</h3>
              <p className="text-xs text-zinc-500 mt-1">
                홈 화면에 추가하고 더 빠르게 사용해보세요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={installApp} className="gap-2">
                <Download className="w-4 h-4" />
                설치
              </Button>
              <button
                onClick={() => setIsVisible(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
