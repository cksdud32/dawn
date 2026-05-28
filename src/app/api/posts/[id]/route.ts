import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { isPostPublic, isWritingWindow } from "@/lib/time";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getOrCreateSession();
  const now = new Date();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true, content: true, createdAt: true, userId: true,
          user: { select: { anonName: true } },
        },
      },
    },
  });

  if (!post) return NextResponse.json({ error: "존재하지 않는 글입니다." }, { status: 404 });

  const public_ = isPostPublic(post.dawnDate, now);
  const isOwn = post.userId === session.userId;

  if (!public_ && !isOwn) return NextResponse.json({ error: "아직 공개되지 않은 글입니다." }, { status: 403 });

  return NextResponse.json({
    post: {
      id: post.id, content: post.content, mood: post.mood,
      musicTitle: post.musicTitle, musicArtist: post.musicArtist,
      dawnDate: post.dawnDate, createdAt: post.createdAt,
      isOwn, isPublic: public_, commentsEnabled: public_,
      comments: public_
        ? post.comments.map((c) => ({
            id: c.id, content: c.content, createdAt: c.createdAt,
            anonName: c.user.anonName, isOwn: c.userId === session.userId,
          }))
        : [],
    },
  });
}

// 수정 — 새벽 시간(05:00 전)에만 가능
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getOrCreateSession();

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "존재하지 않는 글입니다." }, { status: 404 });
  if (post.userId !== session.userId) return NextResponse.json({ error: "본인 글만 수정할 수 있습니다." }, { status: 403 });
  if (!isWritingWindow()) return NextResponse.json({ error: "새벽 시간에만 수정할 수 있습니다." }, { status: 403 });

  const body = await req.json();
  const { content, mood, musicTitle, musicArtist } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0)
    return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });
  if (content.trim().length > 1000)
    return NextResponse.json({ error: "1000자 이내로 작성해주세요." }, { status: 400 });

  const updated = await prisma.post.update({
    where: { id },
    data: {
      content: content.trim(),
      mood: mood ?? null,
      musicTitle: musicTitle?.trim() || null,
      musicArtist: musicArtist?.trim() || null,
    },
  });

  return NextResponse.json({ post: updated });
}

// 삭제 — 언제든 본인 글 삭제 가능
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getOrCreateSession();

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "존재하지 않는 글입니다." }, { status: 404 });
  if (post.userId !== session.userId) return NextResponse.json({ error: "본인 글만 삭제할 수 있습니다." }, { status: 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
