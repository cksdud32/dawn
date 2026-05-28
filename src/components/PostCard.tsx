"use client";

import { useState } from "react";
import Link from "next/link";
import { MoodBadge } from "./MoodBadge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  mood: string | null;
  musicTitle: string | null;
  musicArtist: string | null;
  dawnDate: string;
  createdAt: string;
  isOwn: boolean;
  isPublic: boolean;
  commentCount: number;
  commentsEnabled: boolean;
}

export function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false);
  const preview = post.content.slice(0, 120);
  const needsTruncate = post.content.length > 120;

  const createdAt = new Date(post.createdAt);
  const timeStr = format(createdAt, "HH:mm", { locale: ko });

  return (
    <article className="group relative rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] transition-colors p-5 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoodBadge mood={post.mood} />
          {post.isOwn && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300/60 border border-indigo-500/20">
              내 글
            </span>
          )}
          {!post.isPublic && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8">
              🔒 잠김
            </span>
          )}
        </div>
        <span className="text-xs text-white/25">{timeStr}</span>
      </div>

      {/* Content */}
      <div className="text-white/75 leading-relaxed text-[15px] font-light">
        {needsTruncate && !expanded ? (
          <>
            {preview}
            <span className="text-white/30">…</span>
            <button
              onClick={() => setExpanded(true)}
              className="ml-2 text-xs text-white/40 hover:text-white/60 underline underline-offset-2"
            >
              더 보기
            </button>
          </>
        ) : (
          post.content
        )}
      </div>

      {/* Music */}
      {post.musicTitle && (
        <div className="flex items-center gap-2 text-xs text-white/35">
          <span>♪</span>
          <span>{post.musicTitle}{post.musicArtist ? ` — ${post.musicArtist}` : ""}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-white/20">{post.dawnDate} 새벽</span>
        {post.isPublic && (
          <Link
            href={`/post/${post.id}`}
            className="text-xs text-white/35 hover:text-white/60 transition-colors"
          >
            댓글 {post.commentCount > 0 ? post.commentCount : ""} →
          </Link>
        )}
      </div>
    </article>
  );
}
