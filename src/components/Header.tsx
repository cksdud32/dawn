import Link from "next/link";
import { TimeStatus } from "./TimeStatus";

interface HeaderProps {
  anonName: string;
  phase: "WRITING" | "LOCKED" | "OPEN";
  minutesUntilClose?: number | null;
  secondsUntilOpen?: number | null;
}

export function Header({ anonName, phase, minutesUntilClose, secondsUntilOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#07070e]/80 backdrop-blur-md">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white/80 hover:text-white transition-colors">
          dawn
        </Link>
        <div className="flex items-center gap-4">
          <TimeStatus
            initialPhase={phase}
            minutesUntilClose={minutesUntilClose}
            secondsUntilOpen={secondsUntilOpen}
          />
          <span className="text-xs text-white/30 hidden sm:block">{anonName}</span>
          {phase === "WRITING" && (
            <Link
              href="/write"
              className="text-sm px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 hover:bg-amber-400/20 transition-colors"
            >
              기록하기
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
