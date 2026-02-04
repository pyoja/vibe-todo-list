"use client";

import { useEffect, useState, useCallback } from "react";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { toast } from "sonner";
import { IOSInstallGuide } from "./ios-install-guide";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

export function PWAInstallManager() {
  const { isInstallable, isIOS, isStandalone, installApp } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const showAndroidToast = useCallback(() => {
    toast.custom(
      (t) => (
        <div className="flex w-full items-center justify-between gap-4 rounded-xl border bg-background p-4 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">
              앱으로 더 편하게 사용해보세요!
            </p>
            <p className="text-xs text-muted-foreground">
              설치 없이 웹에서 바로 사용 가능합니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => toast.dismiss(t)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 gap-2 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                installApp();
                toast.dismiss(t);
              }}
            >
              <Download className="h-3.5 w-3.5" />
              설치하기
            </Button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "bottom-center",
      },
    );
  }, [installApp]);

  useEffect(() => {
    if (isStandalone) return; // Already installed

    // Trigger Logic:
    // 1. For Android/Desktop (isInstallable=true): Show toast automatically after a delay
    // 2. For iOS (isIOS=true): We need a trigger. For now, we'll show a small floating button?
    //    OR as per spec "Trigger: 2nd visit or first item created".
    //    Let's simulate "2nd visit" logic with localStorage for now.

    // Simple logic for MVP: specific delay.
    // Spec says: "Trigger: 2 visits or first daypiece created".
    // I'll implement a simple "visited check" using localStorage.

    const checkVisit = () => {
      const visits = Number(localStorage.getItem("visit_count") || "0");
      localStorage.setItem("visit_count", String(visits + 1));

      // Show prompt if visited >= 2
      if (visits >= 1) {
        // 0-indexed initially -> 2nd visit means current count is 1 before increment or similar. Let's say >= 1 is 2nd load.
        return true;
      }
      return false;
    };

    const shouldShow = checkVisit();

    if (shouldShow) {
      const timer = setTimeout(() => {
        if (isInstallable) {
          showAndroidToast();
        }
        // iOS auto-popup is annoying, we typically wait for user action or show a subtle hint.
        // But per request "Android: Toast", "iOS: Modal".
        // Let's NOT auto-show modal on iOS to avoid being intrusive, maybe a toast telling them to install?
        // Or just the toast that opens the modal.
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isStandalone, isIOS, showAndroidToast]);

  // For iOS, we can provide a function to open the guide,
  // maybe exposed via context or just a global button if needed later.
  // For now, if we want to strictly follow "Trigger: 2nd visit -> Show UI",
  // on iOS we shouldn't open the full sheet automatically (bad UX).
  // Instead, show a Toast that says "Install App" which OPENS the sheet.

  useEffect(() => {
    if (isStandalone || !isIOS) return;

    // Check visit for iOS too
    const visits = Number(localStorage.getItem("visit_count") || "0");
    if (visits >= 2) {
      // 2nd visit
      const timer = setTimeout(() => {
        toast("Daypiece를 앱처럼 사용해보세요.", {
          action: {
            label: "설치 방법",
            onClick: () => setShowIOSGuide(true),
          },
          duration: 8000,
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isIOS, isStandalone]);

  return (
    <>
      <IOSInstallGuide open={showIOSGuide} onOpenChange={setShowIOSGuide} />
    </>
  );
}
