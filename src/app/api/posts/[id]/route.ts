import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { isPostPublic } from "@/lib/time";

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
          id: true,
          content: true,
          createdAt: true,
          userId: true,
          user: { select: { anonName: true } },
        },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "존재하지 않는 글입니다." }, { status: 404 });
  }

  const public_ = isPostPublic(post.dawnDate, now);
  const isOwn = post.userId === session.userId;

  if (!public_ && !isOwn) {
    return NextResponse.json({ error: "아직 공개되지 않은 글입니다." }, { status: 403 });
  }

  return NextResponse.json({
    post: {
      id: post.id,
      content: post.content,
      mood: post.mood,
      musicTitle: post.musicTitle,
      musicArtist: post.musicArtist,
      dawnDate: post.dawnDate,
      createdAt: post.createdAt,
      isOwn,
      isPublic: public_,
      commentsEnabled: public_,
      comments: public_
        ? post.comments.map((c) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
            anonName: c.user.anonName,
            isOwn: c.userId === session.userId,
          }))
        : [],
    },
  });
}
