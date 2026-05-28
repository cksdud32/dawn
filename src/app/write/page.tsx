"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MOODS, MoodValue } from "@/components/MoodBadge";

export default function WritePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"WRITING" | "LOCKED" | null>(null);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodValue | "">("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicArtist, setMusicArtist] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => setPhase(data.phase));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mood: mood || null,
          musicTitle: musicTitle || null,
          musicArtist: musicArtist || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === null) {
    return (
      <div className="min-h-screen bg-[#07070e] flex items-center justify-center">
        <span className="text-white/30 text-sm">로딩 중…</span>
      </div>
    );
  }

  if (phase === "LOCKED") {
    return (
      <div className="min-h-screen bg-[#07070e] flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-4xl opacity-20">🔒</p>
        <p className="text-white/50 text-base">지금은 글을 쓸 수 없어요</p>
        <p className="text-white/30 text-sm">새벽 00:00 ~ 05:00 KST 사이에만 기록할 수 있습니다</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-sm text-white/30 hover:text-white/50 underline underline-offset-4"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070e] text-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="text-sm text-white/30 hover:text-white/50 mb-8 block"
        >
          ← 돌아가기
        </button>

        <h1 className="text-xl font-light text-white/70 mb-8">새벽 기록</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood selector */}
          <div className="space-y-2">
            <label className="text-xs text-white/30 uppercase tracking-widest">감정 (선택)</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(mood === m.value ? "" : m.value as MoodValue)}
                  className={`text-sm px-3 py-1.5 rounded-xl border transition-colors ${
                    mood === m.value
                      ? "bg-white/10 border-white/25 text-white/80"
                      : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                  }`}
                >
                  {m.emoji} {m.value}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-xs text-white/30 uppercase tracking-widest">기록</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="지금 이 순간을 적어두세요…"
              maxLength={1000}
              rows={8}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/75 placeholder-white/20 resize-none focus:outline-none focus:border-white/20 text-[15px] leading-relaxed font-light"
            />
            <div className="text-right text-xs text-white/20">{content.length} / 1000</div>
          </div>

          {/* Music (optional) */}
          <div className="space-y-2">
            <label className="text-xs text-white/30 uppercase tracking-widest">지금 듣는 음악 (선택)</label>
            <div className="flex gap-2">
              <input
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
                placeholder="곡 제목"
                maxLength={100}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white/65 placeholder-white/20 focus:outline-none focus:border-white/20 text-sm"
              />
              <input
                value={musicArtist}
                onChange={(e) => setMusicArtist(e.target.value)}
                placeholder="아티스트"
                maxLength={60}
                className="w-32 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white/65 placeholder-white/20 focus:outline-none focus:border-white/20 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-red-400/70 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="w-full py-3 rounded-xl bg-amber-400/15 border border-amber-400/25 text-amber-300 hover:bg-amber-400/25 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "저장 중…" : "기록하기"}
          </button>

          <p className="text-center text-xs text-white/20">
            아침 06:00 이후 모두에게 공개됩니다
          </p>
        </form>
      </div>
    </div>
  );
}
