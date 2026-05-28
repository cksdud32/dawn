"use client";

import { useEffect, useState } from "react";

type Phase = "WRITING" | "LOCKED" | "OPEN";

interface TimeStatusProps {
  initialPhase: Phase;
  minutesUntilClose?: number | null;
  secondsUntilOpen?: number | null;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

export function TimeStatus({ initialPhase, minutesUntilClose, secondsUntilOpen }: TimeStatusProps) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [closeSecondsLeft, setCloseSecondsLeft] = useState((minutesUntilClose ?? 0) * 60);
  const [openSecondsLeft, setOpenSecondsLeft] = useState(secondsUntilOpen ?? 0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (phase === "WRITING") {
        setCloseSecondsLeft((s) => {
          if (s <= 1) { setPhase("LOCKED"); return 0; }
          return s - 1;
        });
      } else if (phase === "LOCKED") {
        setOpenSecondsLeft((s) => {
          if (s <= 1) { setPhase("WRITING"); return 0; }
          return s - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  if (phase === "WRITING") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-600 dark:text-amber-300/80">
          새벽 창이 열려 있어요 — {formatCountdown(closeSecondsLeft)} 남음
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-slate-600" />
      <span className="text-stone-400 dark:text-slate-500">
        글쓰기 잠김 — 다음 새벽까지 {formatCountdown(openSecondsLeft)}
      </span>
    </div>
  );
}
