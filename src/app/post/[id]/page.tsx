import { notFound } from "next/navigation";
import { getOrCreateSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { isPostPublic, areCommentsEnabled, getCurrentPhase, minutesUntilClose, secondsUntilOpen, secondsUntilPublic } from "@/lib/time";
import { MoodBadge } from "@/components/MoodBadge";
import { CommentSection } from "@/components/CommentSection";
import { Header } from "@/components/Header";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getOrCreateSession();
  const now = new Date();
  const phase = getCurrentPhase();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { anonName: true } } },
      },
    },
  });

  if (!post) notFound();

  const public_ = isPostPublic(post.dawnDate, now);
  const isOwn = post.userId === session.userId;
  const commentsEnabled = areCommentsEnabled(post.dawnDate, now);

  if (!public_ && !isOwn) {
    return (
      <div className="min-h-screen bg-surface text-fg1">
        <Header
          anonName={session.anonName}
          phase={phase}
          minutesUntilClose={phase === "WRITING" ? minutesUntilClose() : null}
          secondsUntilOpen={phase === "LOCKED" || phase === "EVENING" ? secondsUntilOpen() : null}
          secondsUntilPublic={phase === "REVEALING" ? secondsUntilPublic() : null}
        />
        <div className="flex flex-col items-center justify-center gap-4 text-center px-6 py-32">
          <p className="text-4xl opacity-20">🔒</p>
          <p className="text-fg3">아직 공개되지 않은 글입니다</p>
        </div>
      </div>
    );
  }

  const comments = public_
    ? post.comments.map((c) => ({
        id: c.id, content: c.content, createdAt: c.createdAt.toISOString(),
        anonName: c.user.anonName, isOwn: c.userId === session.userId,
      }))
    : [];

  const timeStr = format(post.createdAt, "M월 d일 HH:mm", { locale: ko });

  return (
    <div className="min-h-screen bg-surface text-fg1">
      <Header
        anonName={session.anonName}
        phase={phase}
        minutesUntilClose={phase === "WRITING" ? minutesUntilClose() : null}
        secondsUntilOpen={phase === "LOCKED" || phase === "EVENING" ? secondsUntilOpen() : null}
        secondsUntilPublic={phase === "REVEALING" ? secondsUntilPublic() : null}
      />
      <div className="max-w-xl mx-auto px-4 py-10">

        <article className="space-y-4 mb-12">
          <div className="flex items-center gap-3">
            <MoodBadge mood={post.mood} />
            {isOwn && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">내 글</span>
            )}
            <span className="text-xs text-fg5 ml-auto">{timeStr}</span>
          </div>

          <p className="text-fg2 leading-relaxed text-[16px] font-light whitespace-pre-wrap">{post.content}</p>

          {post.musicTitle && (
            <div className="flex items-center gap-2 text-sm text-fg4 border-t border-line pt-3">
              <span>♪</span>
              <span>{post.musicTitle}{post.musicArtist ? ` — ${post.musicArtist}` : ""}</span>
            </div>
          )}

          <p className="text-xs text-fg5">{post.dawnDate} 새벽의 기록</p>
        </article>

        <CommentSection
          postId={post.id}
          initialComments={comments}
          commentsEnabled={commentsEnabled}
          dawnDate={post.dawnDate}
        />
      </div>
    </div>
  );
}
