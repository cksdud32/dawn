"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// KST 기준 자정(0), 05:00(글쓰기 종료), 06:00(게시글 공개) 시점에 자동 새로고침
const REFRESH_HOURS = [0, 5, 6];

function getKSTHour(): number {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })
  ).getHours();
}

export function AutoRefresh() {
  const router = useRouter();
  const lastHourRef = useRef<number | null>(null);

  useEffect(() => {
    lastHourRef.current = getKSTHour();

    const interval = setInterval(() => {
      const hour = getKSTHour();
      if (lastHourRef.current !== null && hour !== lastHourRef.current) {
        lastHourRef.current = hour;
        if (REFRESH_HOURS.includes(hour)) {
          router.refresh();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
