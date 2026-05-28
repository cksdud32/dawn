import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { areCommentsEnabled } from "@/lib/time";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const session = await getOrCreateSession();
  const now = new Date();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { dawnDate: true },
  });

  if (!post) {
    return NextResponse.json({ error: "존재하지 않는 글입니다." }, { status: 404 });
  }

  if (!areCommentsEnabled(post.dawnDate, now)) {
    return NextResponse.json(
      { error: "댓글은 글이 공개된 이후에만 작성할 수 있습니다." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { content } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "댓글 내용을 입력해주세요." }, { status: 400 });
  }
  if (content.trim().length > 300) {
    return NextResponse.json({ error: "300자 이내로 작성해주세요." }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: session.userId,
      content: content.trim(),
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { anonName: true } },
    },
  });

  return NextResponse.json({
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      anonName: comment.user.anonName,
      isOwn: true,
    },
  }, { status: 201 });
}
