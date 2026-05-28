import { getOrCreateSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getCurrentPhase, getKSTDate, isPostPublic, minutesUntilClose, secondsUntilOpen } from "@/lib/time";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getOrCreateSession();
  const phase = getCurrentPhase();
  const todayKST = getKSTDate();
  const now = new Date();

  const rawPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: { _count: { select: { comments: true } } },
  });

  const posts = rawPosts.map((post) => {
    const public_ = isPostPublic(post.dawnDate, now);
    const isOwn = post.userId === session.userId;
    if (!public_ && !isOwn) return null;
    return {
      id: post.id, content: post.content, mood: post.mood,
      musicTitle: post.musicTitle, musicArtist: post.musicArtist,
      dawnDate: post.dawnDate, createdAt: post.createdAt.toISOString(),
      isOwn, isPublic: public_, commentCount: post._count.comments, commentsEnabled: public_,
    };
  }).filter(Boolean) as {
    id: string; content: string; mood: string | null; musicTitle: string | null;
    musicArtist: string | null; dawnDate: string; createdAt: string;
    isOwn: boolean; isPublic: boolean; commentCount: number; commentsEnabled: boolean;
  }[];

  const myTodayPosts = posts.filter((p) => p.isOwn && p.dawnDate === todayKST && !p.isPublic);
  const publicPosts = posts.filter((p) => p.isPublic);

  return (
    <div className="min-h-screen bg-[#faf8f4] dark:bg-[#07070e] text-stone-800 dark:text-white">
      <Header
        anonName={session.anonName}
        phase={phase}
        minutesUntilClose={phase === "WRITING" ? minutesUntilClose() : null}
        secondsUntilOpen={phase === "LOCKED" ? secondsUntilOpen() : null}
      />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-10">
        {phase === "WRITING" && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-400/15 bg-amber-50 dark:bg-amber-400/5 p-6 text-center space-y-3">
            <p className="text-amber-600 dark:text-amber-200/60 text-sm">지금은 새벽입니다</p>
            <p className="text-stone-700 dark:text-white/70 text-base">이 순간의 감정을 기록해두세요</p>
            <p className="text-stone-400 dark:text-white/35 text-xs">아침 06:00이 되면 모두에게 공개됩니다</p>
            <Link
              href="/write"
              className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/25 text-amber-600 dark:text-amber-300 hover:bg-amber-400/25 transition-colors text-sm"
            >
              지금 기록하기
            </Link>
          </div>
        )}

        {phase === "LOCKED" && myTodayPosts.length === 0 && publicPosts.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="text-5xl opacity-15">🌙</p>
            <p className="text-stone-400 dark:text-white/30 text-sm">자정이 되면 새벽 창이 열립니다</p>
            <p className="text-stone-300 dark:text-white/20 text-xs">00:00 ~ 05:00 KST</p>
          </div>
        )}

        {myTodayPosts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-stone-400 dark:text-white/25 px-1">오늘 새벽 · 내 기록</h2>
            <div className="space-y-3">
              {myTodayPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            <p className="text-xs text-stone-300 dark:text-white/20 text-center pt-1">내일 아침 06:00 이후 모두에게 공개됩니다</p>
          </section>
        )}

        {publicPosts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-stone-400 dark:text-white/25 px-1">새벽의 기록들</h2>
            <div className="space-y-3">
              {publicPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
