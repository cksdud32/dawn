import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysLater = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // 삭제 대상 Post를 먼저 조회해서 키워드 추출
  const postsToDelete = await prisma.post.findMany({
    where: { createdAt: { lt: sevenDaysAgo } },
    select: { id: true, keywords: true },
  });

  // 키워드가 있는 Post의 키워드를 Resonance로 이전
  const resonanceData = postsToDelete.flatMap((post) =>
    post.keywords.map((keyword) => ({
      keyword,
      sourcePostId: post.id,
      expiresAt: fourteenDaysLater,
    }))
  );

  if (resonanceData.length > 0) {
    await prisma.resonance.createMany({ data: resonanceData });
  }

  // Post 삭제 (Comment는 onDelete: Cascade로 함께 삭제됨)
  const deletedPosts = await prisma.post.deleteMany({
    where: { createdAt: { lt: sevenDaysAgo } },
  });

  // 만료된 Resonance 삭제
  const deletedResonances = await prisma.resonance.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return NextResponse.json({
    deletedPosts: deletedPosts.count,
    transferredKeywords: resonanceData.length,
    deletedResonances: deletedResonances.count,
    at: new Date().toISOString(),
  });
}
