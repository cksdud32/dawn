import { prisma } from "@/lib/db";
import ResonanceCanvas, { ResonanceItem } from "@/components/ResonanceCanvas";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "잔향 — 여명",
  description: "글은 사라지고, 단어만 남았습니다.",
};

export default async function ResonancePage() {
  const rows = await prisma.resonance.findMany({
    where: { expiresAt: { gt: new Date() } },
    select: { id: true, keyword: true, createdAt: true, expiresAt: true },
  });

  // 흩어진 느낌을 위해 서버에서 셔플
  const resonances: ResonanceItem[] = rows
    .map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      _sort: Math.random(),
    }))
    .sort((a, b) => a._sort - b._sort)
    .map(({ _sort: _, ...r }) => r);

  return <ResonanceCanvas resonances={resonances} />;
}
