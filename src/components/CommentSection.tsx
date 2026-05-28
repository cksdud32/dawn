"use client";

import { useState } from "react";
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

export function CommentSection({
  postId,
  initialComments,
  commentsEnabled,
  dawnDate,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
        return;
      }
      setComments((prev) => [...prev, data.comment]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  if (!commentsEnabled) {
    return (
      <div className="border-t border-white/8 pt-6 text-center">
        <p className="text-white/25 text-sm">댓글은 공개 이후 작성할 수 있습니다</p>
        <p className="text-white/15 text-xs mt-1">{dawnDate} 다음날 06:00 이후</p>
      </div>
    );
  }

  return (
    <section className="border-t border-white/8 pt-6 space-y-5">
      <h2 className="text-xs uppercase tracking-widest text-white/25">댓글 {comments.length > 0 ? comments.length : ""}</h2>

      {comments.length === 0 && (
        <p className="text-white/25 text-sm py-4 text-center">아직 댓글이 없어요</p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-white/[0.03] border border-white/8 px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${c.isOwn ? "text-indigo-300/60" : "text-white/30"}`}>
                {c.isOwn ? "나" : c.anonName}
              </span>
              <span className="text-xs text-white/20">
                {format(new Date(c.createdAt), "HH:mm", { locale: ko })}
              </span>
            </div>
            <p className="text-white/65 text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submitComment} className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 남겨보세요…"
          maxLength={300}
          rows={3}
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white/70 placeholder-white/20 resize-none focus:outline-none focus:border-white/20 text-sm"
        />
        {error && <p className="text-red-400/70 text-xs">{error}</p>}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/20">{text.length} / 300</span>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "저장 중…" : "남기기"}
          </button>
        </div>
      </form>
    </section>
  );
}
