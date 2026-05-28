"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, phase, toggle } = useTheme();

  if (phase !== "choice") return null;

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
      className="text-lg transition-opacity opacity-50 hover:opacity-100"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
