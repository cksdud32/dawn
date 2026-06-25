import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const resonances = await prisma.resonance.findMany({
    where: { expiresAt: { gt: new Date() } },
    select: { id: true, keyword: true, createdAt: true, expiresAt: true },
  });

  // 프론트에서 opacity 계산이 가능하도록 날짜는 ISO string으로 반환
  // 흩어진 느낌을 위해 서버에서 셔플
  const shuffled = resonances
    .map((r) => ({ ...r, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ sort: _, ...r }) => r);

  return NextResponse.json({ resonances: shuffled });
}
