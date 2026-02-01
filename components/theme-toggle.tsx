"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          <span>Dark Mode</span>
        </>
      )}
    </Button>
  );
}
