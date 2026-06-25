"use client";

import Link from "next/link";

export interface ResonanceItem {
  id: string;
  keyword: string;
  createdAt: string;
  expiresAt: string;
}

// 결정론적 유사 난수 — hydration mismatch 없음
function pseudo(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// 생성(0) → 만료(1) 진행률에 따라 opacity 감소
// 방금 이전: 0.70 / 만료 직전: 0.07
function calcOpacity(createdAt: string, expiresAt: string): number {
  const now = Date.now();
  const start = new Date(createdAt).getTime();
  const end = new Date(expiresAt).getTime();
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  return Math.max(0.07, 0.70 - progress * 0.63);
}

const C = {
  text: "rgb(210 207 200)",
  dim: (a: number) => `rgba(210, 207, 200, ${a})`,
  accent: `rgba(180, 180, 215, 0.16)`, // 연한 라벤더-회색 (잔향 레이블)
} as const;

export default function ResonanceCanvas({ resonances }: { resonances: ResonanceItem[] }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d0d0f",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      {/* ── 내비게이션 ── */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.75rem 2rem",
          flexShrink: 0,
        }}
      >
        <Link
          href="/"
          style={{
            color: C.dim(0.14),
            fontSize: "0.65rem",
            letterSpacing: "0.22em",
            textDecoration: "none",
          }}
        >
          ← 여명
        </Link>
        <span
          style={{
            color: C.accent,
            fontSize: "0.65rem",
            letterSpacing: "0.3em",
          }}
        >
          잔향
        </span>
      </nav>

      {/* ── ① 서술형 소개 ── */}
      <section
        style={{
          padding: "1.5rem 2.5rem 2rem",
          flexShrink: 0,
          maxWidth: "38rem",
        }}
      >
        <p
          style={{
            color: C.dim(0.38),
            fontSize: "0.82rem",
            fontWeight: 300,
            lineHeight: 2,
            letterSpacing: "0.02em",
          }}
        >
          감정은 사라진다.
          <br />
          하지만 완전히는 아니다.
          <br />
          <br />
          잔향은 글이 지워진 뒤에도
          <br />
          당신이 고른 단어들이 잠시 머무는 공간이다.
          <br />
          <br />
          <span style={{ color: C.dim(0.22) }}>
            아무도 맥락을 모른다.
            <br />
            키워드만 남는다.
            <br />
            2주 뒤, 그것도 사라진다.
          </span>
        </p>
      </section>

      {/* ── 구분선 ── */}
      <div
        style={{
          borderTop: `1px solid ${C.dim(0.05)}`,
          margin: "0 2rem",
          flexShrink: 0,
        }}
      />

      {/* ── 키워드 부유 공간 ── */}
      <div
        style={{
          flex: 1,
          position: "relative",
          minHeight: "38vh",
          overflow: "hidden",
        }}
      >
        {resonances.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
            }}
          >
            <p style={{ color: C.dim(0.1), fontSize: "0.78rem", fontWeight: 300, letterSpacing: "0.04em" }}>
              아직 남겨진 말이 없습니다.
            </p>
            <p style={{ color: C.dim(0.06), fontSize: "0.65rem", fontWeight: 300 }}>
              글이 사라질 때 단어가 이곳에 남습니다.
            </p>
          </div>
        )}

        {resonances.map((r, i) => {
          const x = pseudo(i * 3 + 0) * 76 + 8;   // 8% ~ 84%
          const y = pseudo(i * 3 + 1) * 70 + 10;  // 10% ~ 80%
          const opacity = calcOpacity(r.createdAt, r.expiresAt);
          const size = 0.72 + pseudo(i * 3 + 2) * 0.22; // 0.72rem ~ 0.94rem

          return (
            <span
              key={r.id}
              className="resonance-word"
              style={
                {
                  "--kw-op": opacity,
                  left: `${x}%`,
                  top: `${y}%`,
                  fontSize: `${size}rem`,
                } as React.CSSProperties
              }
            >
              {r.keyword}
            </span>
          );
        })}
      </div>

      {/* ── ③ 질문형 CTA ── */}
      <footer
        style={{
          padding: "2rem 2.5rem 2.5rem",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            borderTop: `1px solid ${C.dim(0.04)}`,
            marginBottom: "1.25rem",
          }}
        />
        <p
          style={{
            color: C.dim(0.2),
            fontSize: "0.75rem",
            fontWeight: 300,
            letterSpacing: "0.02em",
            lineHeight: 1.7,
          }}
        >
          다 쓰고 나면, 무엇이 남을 것 같으세요?
        </p>
        <Link
          href="/write"
          style={{
            color: C.dim(0.14),
            fontSize: "0.7rem",
            fontWeight: 300,
            letterSpacing: "0.08em",
            textDecoration: "none",
          }}
        >
          여명에서 기록하기 →
        </Link>
      </footer>
    </div>
  );
}
