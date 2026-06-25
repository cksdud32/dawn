import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { isWritingWindow, getKSTDate, isPostPublic } from "@/lib/time";

function sanitizeKeywords(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((k): k is string => typeof k === "string")
    .map((k) => k.trim())
    .filter((k) => k.length > 0 && k.length <= 15)
    .filter((k, i, arr) => arr.indexOf(k) === i)
    .slice(0, 5);
}

export async function GET(req: NextRequest) {
  const session = await getOrCreateSession();
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // optional: filter by dawnDate

  const now = new Date();
  const todayKST = getKSTDate();

  const posts = await prisma.post.findMany({
    where: dateParam ? { dawnDate: dateParam } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { comments: true } },
    },
  });

  const filtered = posts
    .map((post) => {
      const public_ = isPostPublic(post.dawnDate, now);
      const isOwn = post.userId === session.userId;

      // Same dawn date and not yet public: only show to author
      if (!public_ && post.dawnDate === todayKST && !isOwn) {
        return null;
      }
      // Past dawn dates that are still not public (edge case): hide from others
      if (!public_ && !isOwn) {
        return null;
      }

      return {
        id: post.id,
        content: post.content,
        mood: post.mood,
        musicTitle: post.musicTitle,
        musicArtist: post.musicArtist,
        keywords: post.keywords,
        dawnDate: post.dawnDate,
        createdAt: post.createdAt,
        isOwn,
        isPublic: public_,
        commentCount: post._count.comments,
        commentsEnabled: public_,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ posts: filtered });
}

export async function POST(req: NextRequest) {
  if (!isWritingWindow()) {
    return NextResponse.json(
      { error: "글쓰기는 00:00~05:00 KST 사이에만 가능합니다." },
      { status: 403 }
    );
  }

  const session = await getOrCreateSession();
  const body = await req.json();
  const { content, mood, musicTitle, musicArtist, keywords: rawKeywords } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  }
  if (content.trim().length > 1000) {
    return NextResponse.json({ error: "1000자 이내로 작성해주세요." }, { status: 400 });
  }

  const keywords = sanitizeKeywords(rawKeywords);

  const dawnDate = getKSTDate();

  // 오늘 새벽 이미 쓴 글이 있으면 차단
  const existing = await prisma.post.findFirst({
    where: { userId: session.userId, dawnDate },
  });
  if (existing) {
    return NextResponse.json(
      { error: "오늘 새벽에는 이미 기록했습니다.", existingId: existing.id },
      { status: 409 }
    );
  }

  const post = await prisma.post.create({
    data: {
      userId: session.userId,
      content: content.trim(),
      mood: mood ?? null,
      musicTitle: musicTitle?.trim() || null,
      musicArtist: musicArtist?.trim() || null,
      keywords,
      dawnDate,
    },
    select: {
      id: true,
      content: true,
      mood: true,
      musicTitle: true,
      musicArtist: true,
      keywords: true,
      dawnDate: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
