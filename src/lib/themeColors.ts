export type ColorKey =
  | "bg" | "fg1" | "fg2" | "fg3" | "fg4" | "fg5"
  | "border" | "card" | "hover" | "input";

// 라이트 모드 (낮) — stone 팔레트 기반
export const LIGHT: Record<ColorKey, [number, number, number]> = {
  bg:     [250, 248, 244],  // #faf8f4
  fg1:    [41,  37,  36 ],  // stone-800
  fg2:    [87,  83,  78 ],  // stone-600
  fg3:    [120, 113, 108],  // stone-500
  fg4:    [168, 162, 158],  // stone-400
  fg5:    [214, 211, 209],  // stone-300
  border: [231, 229, 228],  // stone-200
  card:   [245, 245, 244],  // stone-50
  hover:  [231, 229, 228],  // stone-100
  input:  [255, 255, 255],  // white
};

// 다크 모드 (밤) — rgba(255,255,255,X) on #07070e 사전 계산값
export const DARK: Record<ColorKey, [number, number, number]> = {
  bg:     [7,   7,   14 ],  // #07070e
  fg1:    [193, 193, 195],  // white/75
  fg2:    [168, 168, 170],  // white/65
  fg3:    [131, 131, 133],  // white/50
  fg4:    [94,  94,  96 ],  // white/35
  fg5:    [69,  69,  71 ],  // white/25
  border: [27,  27,  29 ],  // white/08
  card:   [15,  15,  16 ],  // white/03
  hover:  [19,  19,  21 ],  // white/05
  input:  [13,  13,  16 ],  // white/02
};

export function lerp(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// t: 0 = 완전 라이트, 1 = 완전 다크
export function getInterpolatedColors(t: number): Record<ColorKey, [number, number, number]> {
  const clamp = Math.max(0, Math.min(1, t));
  return (Object.keys(LIGHT) as ColorKey[]).reduce((acc, key) => {
    acc[key] = lerp(LIGHT[key], DARK[key], clamp);
    return acc;
  }, {} as Record<ColorKey, [number, number, number]>);
}

export function applyThemeVars(t: number) {
  const colors = getInterpolatedColors(t);
  const el = document.documentElement;
  (Object.entries(colors) as [ColorKey, [number, number, number]][]).forEach(
    ([key, [r, g, b]]) => {
      el.style.setProperty(`--c-${key}`, `${r} ${g} ${b}`);
    }
  );
}

// KST 시간 기반 테마 진행도 계산 (0 = 라이트, 1 = 다크)
export function getThemeProgress(): number {
  const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const h = kst.getHours();
  const secs = kst.getMinutes() * 60 + kst.getSeconds();

  if (h >= 0 && h < 5) return 1;                              // 00:00~04:59 — 완전 다크
  if (h === 5) return Math.max(0, 1 - secs / 3600);           // 05:00~05:59 — 다크→라이트
  if (h >= 6 && h < 21) return 0;                             // 06:00~20:59 — 완전 라이트
  const elapsed = (h - 21) * 3600 + secs;
  return Math.min(1, elapsed / (3 * 3600));                   // 21:00~23:59 — 라이트→다크
}
