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
  const timeStr = format(new Date(post.createdAt), "HH:mm", { locale: ko });

  return (
    <article className="rounded-2xl border border-line bg-card hover:bg-card-hover transition-colors p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MoodBadge mood={post.mood} />
          {post.isOwn && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              내 글
            </span>
          )}
          {!post.isPublic && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-card text-fg5 border border-line">
              🔒 잠김
            </span>
          )}
        </div>
        <span className="text-xs text-fg5">{timeStr}</span>
      </div>

      <div className="text-fg2 leading-relaxed text-[15px] font-light">
        {needsTruncate && !expanded ? (
          <>
            {preview}
            <span className="text-fg5">…</span>
            <button
              onClick={() => setExpanded(true)}
              className="ml-2 text-xs text-fg4 hover:text-fg2 underline underline-offset-2"
            >
              더 보기
            </button>
          </>
        ) : (
          post.content
        )}
      </div>

      {post.musicTitle && (
        <div className="flex items-center gap-2 text-xs text-fg4">
          <span>♪</span>
          <span>{post.musicTitle}{post.musicArtist ? ` — ${post.musicArtist}` : ""}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-fg5">{post.dawnDate} 새벽</span>
        {post.isPublic && (
          <Link href={`/post/${post.id}`} className="text-xs text-fg4 hover:text-fg2 transition-colors">
            댓글 {post.commentCount > 0 ? post.commentCount : ""} →
          </Link>
        )}
      </div>
    </article>
  );
}
