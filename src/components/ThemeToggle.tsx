// src/components/ThemeToggle.tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-zinc-200 p-2 transition hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );
}
