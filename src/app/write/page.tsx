"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MOODS, MoodValue } from "@/components/MoodBadge";

interface ExistingPost {
  id: string;
  content: string;
  mood: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
}

export default function WritePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"WRITING" | "LOCKED" | null>(null);
  const [existing, setExisting] = useState<ExistingPost | null | "none">(null);
  const [mode, setMode] = useState<"write" | "edit">("write");

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodValue | "">("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicArtist, setMusicArtist] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then(async (data) => {
        setPhase(data.phase);
        if (data.phase === "WRITING") {
          // 오늘 새벽 기존 글 확인
          const res = await fetch(`/api/posts?date=${data.kstDate}`);
          const json = await res.json();
          const mine = json.posts?.find((p: ExistingPost & { isOwn: boolean }) => p.isOwn);
          if (mine) {
            setExisting(mine);
            setMode("edit");
            setContent(mine.content);
            setMood((mine.mood as MoodValue) ?? "");
            setMusicTitle(mine.musicTitle ?? "");
            setMusicArtist(mine.musicArtist ?? "");
          } else {
            setExisting("none");
          }
        }
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const isEdit = mode === "edit" && existing && existing !== "none";
      const url = isEdit ? `/api/posts/${existing.id}` : "/api/posts";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mood: mood || null, musicTitle: musicTitle || null, musicArtist: musicArtist || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!existing || existing === "none") return;
    if (!confirm("정말 삭제할까요? 삭제 후 새로 쓸 수 있습니다.")) return;
    const res = await fetch(`/api/posts/${existing.id}`, { method: "DELETE" });
    if (res.ok) {
      setExisting("none");
      setMode("write");
      setContent(""); setMood(""); setMusicTitle(""); setMusicArtist("");
    }
  }

  if (phase === null || existing === null) {
    return <div className="min-h-screen bg-surface flex items-center justify-center"><span className="text-fg4 text-sm">로딩 중…</span></div>;
  }

  if (phase === "LOCKED") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-4xl opacity-20">🔒</p>
        <p className="text-fg3 text-base">지금은 글을 쓸 수 없어요</p>
        <p className="text-fg4 text-sm">새벽 00:00 ~ 05:00 KST 사이에만 기록할 수 있습니다</p>
        <button onClick={() => router.push("/")} className="mt-4 text-sm text-fg4 hover:text-fg2 underline underline-offset-4">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-fg1">
      <div className="max-w-xl mx-auto px-4 py-12">
        <button onClick={() => router.back()} className="text-sm text-fg4 hover:text-fg2 mb-8 block">← 돌아가기</button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-light text-fg3">
            {mode === "edit" ? "오늘 새벽 기록 수정" : "새벽 기록"}
          </h1>
          {mode === "edit" && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-500 underline underline-offset-2"
            >
              삭제하고 새로 쓰기
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-fg4 uppercase tracking-widest">감정 (선택)</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m.value} type="button"
                  onClick={() => setMood(mood === m.value ? "" : m.value as MoodValue)}
                  className={`text-sm px-3 py-1.5 rounded-xl border transition-colors ${
                    mood === m.value ? "bg-card-hover border-line text-fg1" : "bg-transparent border-line text-fg4 hover:text-fg2"
                  }`}
                >
                  {m.emoji} {m.value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-fg4 uppercase tracking-widest">기록</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="지금 이 순간을 적어두세요…" maxLength={1000} rows={8}
              className="w-full bg-input border border-line rounded-xl px-4 py-3 text-fg2 placeholder-fg5 resize-none focus-border-line text-[15px] leading-relaxed font-light"
            />
            <div className="text-right text-xs text-fg5">{content.length} / 1000</div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-fg4 uppercase tracking-widest">지금 듣는 음악 (선택)</label>
            <div className="flex gap-2">
              <input value={musicTitle} onChange={(e) => setMusicTitle(e.target.value)} placeholder="곡 제목" maxLength={100}
                className="flex-1 bg-input border border-line rounded-xl px-4 py-2.5 text-fg2 placeholder-fg5 focus-border-line text-sm" />
              <input value={musicArtist} onChange={(e) => setMusicArtist(e.target.value)} placeholder="아티스트" maxLength={60}
                className="w-32 bg-input border border-line rounded-xl px-4 py-2.5 text-fg2 placeholder-fg5 focus-border-line text-sm" />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={submitting || !content.trim()}
            className="w-full py-3 rounded-xl bg-amber-400/15 border border-amber-400/25 text-amber-600 hover:bg-amber-400/25 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? "저장 중…" : mode === "edit" ? "수정하기" : "기록하기"}
          </button>

          <p className="text-center text-xs text-fg5">아침 06:00 이후 모두에게 공개됩니다</p>
        </form>
      </div>
    </div>
  );
}
