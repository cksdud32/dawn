"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";
export type ThemePhase = "forced-dark" | "forced-light" | "choice";

function getKSTHour(): number {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  ).getHours();
}

function getPhase(hour: number): ThemePhase {
  if (hour >= 0 && hour < 5) return "forced-dark";
  if (hour >= 5 && hour < 21) return "forced-light";
  return "choice";
}

interface ThemeContextType {
  theme: ThemeMode;
  phase: ThemePhase;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  phase: "forced-dark",
  toggle: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [phase, setPhase] = useState<ThemePhase>("forced-dark");

  useEffect(() => {
    const hour = getKSTHour();
    const p = getPhase(hour);
    setPhase(p);

    let t: ThemeMode;
    if (p === "forced-dark") t = "dark";
    else if (p === "forced-light") t = "light";
    else t = (localStorage.getItem("dawn-theme") as ThemeMode) ?? "dark";

    setTheme(t);
    document.documentElement.classList.toggle("dark", t === "dark");
  }, []);

  const toggle = () => {
    if (phase !== "choice") return;
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dawn-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, phase, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
