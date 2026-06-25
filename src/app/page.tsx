import { getOrCreateSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  getCurrentPhase, getKSTDate, isPostPublic,
  minutesUntilClose, secondsUntilOpen, secondsUntilPublic, moonOpacity, moonRiseOpacity,
} from "@/lib/time";
import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { AutoRefresh } from "@/components/AutoRefresh";
import { RevealingState } from "@/components/RevealingState";
import { EveningBanner } from "@/components/EveningBanner";
import { Footer } from "@/components/Footer";
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
    <div className="min-h-screen bg-surface text-fg1">
      <AutoRefresh />
      <Header
        anonName={session.anonName}
        phase={phase}
        minutesUntilClose={phase === "WRITING" ? minutesUntilClose() : null}
        secondsUntilOpen={phase === "LOCKED" || phase === "EVENING" ? secondsUntilOpen() : null}
        secondsUntilPublic={phase === "REVEALING" ? secondsUntilPublic() : null}
      />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-10">

        {/* 새벽 — 글쓰기 가능 */}
        {phase === "WRITING" && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 text-center space-y-3">
            <p className="text-amber-600 text-sm">지금은 새벽입니다</p>
            <p className="text-fg2 text-base">이 순간의 감정을 기록해두세요</p>
            <p className="text-fg4 text-xs">아침 06:00이 되면 모두에게 공개됩니다</p>
            <Link href="/write" className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/25 text-amber-600 hover:bg-amber-400/25 transition-colors text-sm">
              지금 기록하기
            </Link>
          </div>
        )}

        {/* 05:00~06:00 — 달이 지는 시간 */}
        {phase === "REVEALING" && (
          <RevealingState
            initialSeconds={secondsUntilPublic()}
            initialOpacity={moonOpacity()}
          />
        )}

        {/* 잠김 — 빈 화면 */}
        {phase === "LOCKED" && myTodayPosts.length === 0 && publicPosts.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="text-5xl opacity-10">🌙</p>
            <p className="text-fg4 text-sm">자정이 되면 새벽 창이 열립니다</p>
            <p className="text-fg5 text-xs">00:00 ~ 05:00 KST</p>
          </div>
        )}

        {/* 21:00~23:59 — 달이 뜨는 시간 */}
        {phase === "EVENING" && (
          <EveningBanner initialOpacity={moonRiseOpacity()} />
        )}

        {/* 내 오늘 비공개 글 */}
        {phase !== "REVEALING" && myTodayPosts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-fg4 px-1">오늘 새벽 · 내 기록</h2>
            <div className="space-y-3">
              {myTodayPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
            <p className="text-xs text-fg5 text-center pt-1">오늘 아침 06:00 이후 모두에게 공개됩니다</p>
          </section>
        )}

        {/* 공개된 글 목록 */}
        {publicPosts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-fg4 px-1">새벽의 기록들</h2>
            <div className="space-y-3">
              {publicPosts.map((post) => <PostCard key={post.id} post={post} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
