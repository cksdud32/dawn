import { NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { getCurrentPhase, getKSTDate, minutesUntilClose, secondsUntilOpen } from "@/lib/time";

export async function GET() {
  const session = await getOrCreateSession();
  const phase = getCurrentPhase();
  const kstDate = getKSTDate();

  return NextResponse.json({
    userId: session.userId,
    anonName: session.anonName,
    phase,
    kstDate,
    minutesUntilClose: phase === "WRITING" ? minutesUntilClose() : null,
    secondsUntilOpen: phase === "LOCKED" ? secondsUntilOpen() : null,
  });
}
