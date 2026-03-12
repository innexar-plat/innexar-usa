"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

const FOCUS_CLASS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--border)] transition-colors hover:opacity-90 ${FOCUS_CLASS}`}
      style={{
        background: "var(--card-bg)",
        color: "var(--text-primary)",
      }}
    >
      {isDark ? <Sun className="w-5 h-5" aria-hidden /> : <Moon className="w-5 h-5" aria-hidden />}
    </button>
  );
}
