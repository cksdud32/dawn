"use client";

import { useEffect, useState } from "react";

interface EveningBannerProps {
  initialOpacity: number;
}

export function EveningBanner({ initialOpacity }: EveningBannerProps) {
  const [opacity, setOpacity] = useState(initialOpacity);

  useEffect(() => {
    const interval = setInterval(() => {
      const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      const h = kst.getHours();
      if (h < 21) { setOpacity(0); return; }
      const elapsed = (h - 21) * 3600 + kst.getMinutes() * 60 + kst.getSeconds();
      setOpacity(Math.min(1, elapsed / (3 * 3600)));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-6 space-y-1 pointer-events-none select-none">
      <span
        className="text-4xl inline-block transition-opacity duration-1000"
        style={{ opacity }}
      >
        🌙
      </span>
    </div>
  );
}
