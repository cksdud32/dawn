import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Vercel Cron 인증
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const result = await prisma.post.deleteMany({
    where: { createdAt: { lt: sevenDaysAgo } },
  });

  return NextResponse.json({ deleted: result.count, at: new Date().toISOString() });
}
