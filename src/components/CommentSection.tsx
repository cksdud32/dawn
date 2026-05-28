"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  anonName: string;
  isOwn: boolean;
}

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
  commentsEnabled: boolean;
  dawnDate: string;
}

export function CommentSection({ postId, initialComments, commentsEnabled, dawnDate }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [kstMinutes, setKstMinutes] = useState(() => {
    const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    return kst.getHours() * 60 + kst.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      setKstMinutes(kst.getHours() * 60 + kst.getMinutes());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 23:50~23:59 경고
  const nearMidnight = kstMinutes >= 23 * 60 + 50 && kstMinutes < 24 * 60;

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
      setComments((prev) => [...prev, data.comment]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  if (!commentsEnabled) {
    const nowHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" })).getHours();
    const isDawn = nowHour >= 0 && nowHour < 6;

    return (
      <div className="border-t border-stone-200 dark:border-white/8 pt-6 text-center space-y-1">
        {isDawn ? (
          <>
            <p className="text-stone-400 dark:text-white/25 text-sm">새벽에는 댓글을 달 수 없어요</p>
            <p className="text-stone-300 dark:text-white/15 text-xs">06:00 이후 다시 열립니다</p>
          </>
        ) : (
          <>
            <p className="text-stone-400 dark:text-white/25 text-sm">댓글 창이 닫혔습니다</p>
            <p className="text-stone-300 dark:text-white/15 text-xs">공개 후 2일 이내에만 작성할 수 있어요</p>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="border-t border-stone-200 dark:border-white/8 pt-6 space-y-5">
      <h2 className="text-xs uppercase tracking-widest text-stone-400 dark:text-white/25">
        댓글 {comments.length > 0 ? comments.length : ""}
      </h2>

      {comments.length === 0 && (
        <p className="text-stone-400 dark:text-white/25 text-sm py-4 text-center">아직 댓글이 없어요</p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/8 px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${c.isOwn ? "text-indigo-500 dark:text-indigo-300/60" : "text-stone-400 dark:text-white/30"}`}>
                {c.isOwn ? "나" : c.anonName}
              </span>
              <span className="text-xs text-stone-300 dark:text-white/20">
                {format(new Date(c.createdAt), "HH:mm", { locale: ko })}
              </span>
            </div>
            <p className="text-stone-600 dark:text-white/65 text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      {nearMidnight && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-400/5 border border-amber-200 dark:border-amber-400/15 px-4 py-2.5 text-xs text-amber-600 dark:text-amber-300/70 text-center">
          자정(00:00)부터는 댓글을 달 수 없어요
        </div>
      )}

      <form onSubmit={submitComment} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 남겨보세요…"
          maxLength={300}
          rows={3}
          className="w-full bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 rounded-xl px-4 py-3 text-stone-700 dark:text-white/70 placeholder-stone-300 dark:placeholder-white/20 resize-none focus:outline-none focus:border-stone-300 dark:focus:border-white/20 text-sm"
        />
        {error && <p className="text-red-500 dark:text-red-400/70 text-xs">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-300 dark:text-white/20">{text.length} / 300</span>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-500 dark:text-white/50 hover:bg-stone-200 dark:hover:bg-white/10 hover:text-stone-700 dark:hover:text-white/70 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "저장 중…" : "남기기"}
          </button>
        </div>
      </form>
    </section>
  );
}
