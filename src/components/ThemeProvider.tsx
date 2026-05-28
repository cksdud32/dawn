"use client";

import { useEffect } from "react";
import { applyThemeVars, getThemeProgress } from "@/lib/themeColors";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 즉시 적용
    applyThemeVars(getThemeProgress());

    // 매 초 테마 진행도 계산 후 CSS 변수 업데이트
    const interval = setInterval(() => {
      applyThemeVars(getThemeProgress());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
