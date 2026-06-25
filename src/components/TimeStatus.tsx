"use client";

import { useEffect, useState } from "react";

type Phase = "WRITING" | "REVEALING" | "LOCKED" | "EVENING" | "OPEN";

interface TimeStatusProps {
  initialPhase: Phase;
  minutesUntilClose?: number | null;
  secondsUntilOpen?: number | null;
  secondsUntilPublic?: number | null;
}

function fmt(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function TimeStatus({ initialPhase, minutesUntilClose, secondsUntilOpen, secondsUntilPublic }: TimeStatusProps) {
  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [closeLeft, setCloseLeft] = useState((minutesUntilClose ?? 0) * 60);
  const [openLeft, setOpenLeft] = useState(secondsUntilOpen ?? 0);
  const [publicLeft, setPublicLeft] = useState(secondsUntilPublic ?? 0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (phase === "WRITING") {
        setCloseLeft((s) => { if (s <= 1) { setPhase("REVEALING"); return 0; } return s - 1; });
      } else if (phase === "REVEALING") {
        setPublicLeft((s) => { if (s <= 1) { setPhase("LOCKED"); return 0; } return s - 1; });
      } else if (phase === "LOCKED" || phase === "EVENING") {
        setOpenLeft((s) => { if (s <= 1) { setPhase("WRITING"); return 0; } return s - 1; });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  if (phase === "WRITING") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-amber-600">새벽 창이 열려 있어요 — {fmt(closeLeft)} 남음</span>
      </div>
    );
  }

  if (phase === "REVEALING") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400/50 animate-pulse" />
        <span className="text-fg4">게시글 공개까지 {fmt(publicLeft)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-2 h-2 rounded-full bg-fg5" />
      <span className="text-fg4">글쓰기 잠김 — 다음 새벽까지 {fmt(openLeft)}</span>
    </div>
  );
}
