import Link from "next/link";
import { TimeStatus } from "./TimeStatus";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  anonName: string;
  phase: "WRITING" | "REVEALING" | "LOCKED" | "OPEN";
  minutesUntilClose?: number | null;
  secondsUntilOpen?: number | null;
  secondsUntilPublic?: number | null;
}

export function Header({ anonName, phase, minutesUntilClose, secondsUntilOpen, secondsUntilPublic }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-white/8 bg-[#faf8f4]/80 dark:bg-[#07070e]/80 backdrop-blur-md">
      <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-700 dark:text-white/80 hover:text-stone-900 dark:hover:text-white transition-colors">
          dawn
        </Link>
        <div className="flex items-center gap-4">
          <TimeStatus
            initialPhase={phase}
            minutesUntilClose={minutesUntilClose}
            secondsUntilOpen={secondsUntilOpen}
            secondsUntilPublic={secondsUntilPublic}
          />
          <span className="text-xs text-stone-400 dark:text-white/30 hidden sm:block">{anonName}</span>
          <ThemeToggle />
          {phase === "WRITING" && (
            <Link
              href="/write"
              className="text-sm px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-600 dark:text-amber-300 hover:bg-amber-400/20 transition-colors"
            >
              기록하기
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
