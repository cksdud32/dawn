"use client";

import { useEffect, useState } from "react";

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface RevealingStateProps {
  initialSeconds: number;
  initialOpacity: number;
  // postCount: number; // 오늘 새벽에는 {postCount}개의 기록이 새겨졌습니다.
}

export function RevealingState({ initialSeconds, initialOpacity }: RevealingStateProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [opacity, setOpacity] = useState(initialOpacity);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
      setOpacity((o) => Math.max(0, o - 1 / 3600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-24 space-y-6">
      <p className="text-6xl transition-opacity duration-1000" style={{ opacity }}>🌙</p>
      <div className="space-y-2">
        <p className="text-xs text-fg4 uppercase tracking-widest">게시글 공개까지</p>
        <p className="text-2xl font-light tabular-nums text-fg3">{fmt(seconds)}</p>
      </div>
      {/* <p className="text-sm text-fg4">오늘 새벽에는 {postCount}개의 기록이 새겨졌습니다.</p> */}
    </div>
  );
}
