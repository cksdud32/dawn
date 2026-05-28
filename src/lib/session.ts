import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "dawn_session";

const ANON_ADJECTIVES = [
  "새벽", "달빛", "별빛", "안개", "고요한", "흐릿한", "희미한", "깊은",
  "차가운", "따뜻한", "외로운", "조용한", "어두운", "잔잔한",
];

const ANON_NOUNS = [
  "고양이", "여우", "토끼", "늑대", "곰", "새", "나비", "달팽이",
  "구름", "별", "파도", "바람", "안개", "이슬", "서리",
];

function generateAnonName(): string {
  const adj = ANON_ADJECTIVES[Math.floor(Math.random() * ANON_ADJECTIVES.length)];
  const noun = ANON_NOUNS[Math.floor(Math.random() * ANON_NOUNS.length)];
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `${adj}${noun}#${num}`;
}

// Middleware guarantees the cookie exists before this runs.
// This only reads the cookie and lazily creates the DB user if needed.
export async function getOrCreateSession(): Promise<{ userId: string; anonName: string }> {
  const cookieStore = await cookies();
  const sessionKey = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionKey) {
    // Fallback: middleware should have set this, but handle defensively
    return { userId: "anonymous", anonName: "익명" };
  }

  const existing = await prisma.user.findUnique({
    where: { sessionKey },
    select: { id: true, anonName: true },
  });
  if (existing) return { userId: existing.id, anonName: existing.anonName };

  // First time seeing this session key — create the user
  const anonName = generateAnonName();
  const user = await prisma.user.create({
    data: { sessionKey, anonName },
    select: { id: true, anonName: true },
  });
  return { userId: user.id, anonName: user.anonName };
}

export async function getSession(): Promise<{ userId: string; anonName: string } | null> {
  const cookieStore = await cookies();
  const sessionKey = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionKey) return null;

  const user = await prisma.user.findUnique({
    where: { sessionKey },
    select: { id: true, anonName: true },
  });
  return user ? { userId: user.id, anonName: user.anonName } : null;
}
