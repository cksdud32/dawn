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

  const nearMidnight = kstMinutes >= 23 * 60 + 50;

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
      <div className="border-t border-line pt-6 text-center space-y-1">
        {isDawn ? (
          <>
            <p className="text-fg4 text-sm">새벽에는 댓글을 달 수 없어요</p>
            <p className="text-fg5 text-xs">06:00 이후 다시 열립니다</p>
          </>
        ) : (
          <>
            <p className="text-fg4 text-sm">댓글 창이 닫혔습니다</p>
            <p className="text-fg5 text-xs">공개 후 2일 이내에만 작성할 수 있어요</p>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="border-t border-line pt-6 space-y-5">
      <h2 className="text-xs uppercase tracking-widest text-fg4">
        댓글 {comments.length > 0 ? comments.length : ""}
      </h2>

      {comments.length === 0 && (
        <p className="text-fg4 text-sm py-4 text-center">아직 댓글이 없어요</p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-card border border-line px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${c.isOwn ? "text-indigo-500" : "text-fg4"}`}>
                {c.isOwn ? "나" : c.anonName}
              </span>
              <span className="text-xs text-fg5">
                {format(new Date(c.createdAt), "HH:mm", { locale: ko })}
              </span>
            </div>
            <p className="text-fg2 text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      {nearMidnight && (
        <div className="rounded-xl bg-amber-400/5 border border-amber-400/20 px-4 py-2.5 text-xs text-amber-600 text-center">
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
          className="w-full bg-input border border-line rounded-xl px-4 py-3 text-fg2 placeholder-fg5 resize-none focus-border-line text-sm"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-fg5">{text.length} / 300</span>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-4 py-2 rounded-xl bg-card border border-line text-fg3 hover:bg-card-hover hover:text-fg2 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "저장 중…" : "남기기"}
          </button>
        </div>
      </form>
    </section>
  );
}
