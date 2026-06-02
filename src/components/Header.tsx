import Link from "next/link";
import { TimeStatus } from "./TimeStatus";

interface HeaderProps {
  anonName: string;
  phase: "WRITING" | "REVEALING" | "LOCKED" | "EVENING" | "OPEN";
  minutesUntilClose?: number | null;
  secondsUntilOpen?: number | null;
  secondsUntilPublic?: number | null;
}

export function Header({ anonName, phase, minutesUntilClose, secondsUntilOpen, secondsUntilPublic }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-header backdrop-blur-md">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl tracking-tight text-fg1 hover:text-fg1 transition-colors" style={{ fontFamily: "'Maru Buri', serif" }}>
          여명
        </Link>
        <div className="flex items-center gap-4">
          <TimeStatus
            initialPhase={phase}
            minutesUntilClose={minutesUntilClose}
            secondsUntilOpen={secondsUntilOpen}
            secondsUntilPublic={secondsUntilPublic}
          />
          <span className="text-xs text-fg5 hidden sm:block">{anonName}</span>
          {phase === "WRITING" && (
            <Link
              href="/write"
              className="text-sm px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-600 hover:bg-amber-400/20 transition-colors"
            >
              기록하기
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
