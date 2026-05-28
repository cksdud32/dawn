"use client";

export const MOODS = [
  { value: "그리움", emoji: "🌙" },
  { value: "설렘",   emoji: "✨" },
  { value: "불안",   emoji: "🌊" },
  { value: "평온",   emoji: "🌿" },
  { value: "슬픔",   emoji: "🌧" },
  { value: "기쁨",   emoji: "🌟" },
  { value: "공허",   emoji: "🫧" },
  { value: "그냥",   emoji: "🌫" },
] as const;

export type MoodValue = typeof MOODS[number]["value"];

export function MoodBadge({ mood }: { mood: string | null }) {
  if (!mood) return null;
  const found = MOODS.find((m) => m.value === mood);
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-white/50 border border-stone-200 dark:border-white/10">
      {found?.emoji} {mood}
    </span>
  );
}
