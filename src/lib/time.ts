import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { format, addDays, parseISO } from "date-fns";

const KST = "Asia/Seoul";

export const WRITING_START_HOUR = 0;  // 00:00 KST
export const WRITING_END_HOUR = 5;    // 05:00 KST (exclusive)
export const PUBLIC_HOUR = 6;         // 06:00 KST same day
export const REVEALING_START_HOUR = 5; // 05:00~05:59 KST

export function getKSTNow(): Date {
  return toZonedTime(new Date(), KST);
}

export function getKSTDate(date?: Date): string {
  const d = date ?? new Date();
  return format(toZonedTime(d, KST), "yyyy-MM-dd");
}

export function getKSTHour(date?: Date): number {
  const d = date ?? new Date();
  return toZonedTime(d, KST).getHours();
}

export function isWritingWindow(date?: Date): boolean {
  const hour = getKSTHour(date);
  return hour >= WRITING_START_HOUR && hour < WRITING_END_HOUR;
}

export function getPublicAtUTC(dawnDate: string): Date {
  return fromZonedTime(`${dawnDate}T${PUBLIC_HOUR.toString().padStart(2, "0")}:00:00`, KST);
}

export function isPostPublic(dawnDate: string, now?: Date): boolean {
  const checkAt = now ?? new Date();
  return checkAt >= getPublicAtUTC(dawnDate);
}

// 댓글 창: 공개 후 2일(다다음날 06:00) 이내 + 새벽(00:00~05:59) 제외
export function areCommentsEnabled(dawnDate: string, now?: Date): boolean {
  const checkAt = now ?? new Date();

  // 아직 공개 전
  if (!isPostPublic(dawnDate, checkAt)) return false;

  // 새벽 시간 (00:00~05:59 KST) 제외
  const hour = getKSTHour(checkAt);
  if (hour < PUBLIC_HOUR) return false;

  // 공개 후 2일(dawnDate+2 06:00 KST)까지만 허용
  const closeDate = format(addDays(parseISO(dawnDate), 2), "yyyy-MM-dd");
  const commentCloseAt = fromZonedTime(
    `${closeDate}T${PUBLIC_HOUR.toString().padStart(2, "0")}:00:00`,
    KST
  );
  return checkAt < commentCloseAt;
}

export function minutesUntilClose(date?: Date): number {
  const kst = toZonedTime(date ?? new Date(), KST);
  const closeTime = new Date(kst);
  closeTime.setHours(WRITING_END_HOUR, 0, 0, 0);
  return Math.max(0, Math.floor((closeTime.getTime() - kst.getTime()) / 60000));
}

export function secondsUntilOpen(date?: Date): number {
  const kst = toZonedTime(date ?? new Date(), KST);
  const tomorrow = addDays(kst, 1);
  tomorrow.setHours(WRITING_START_HOUR, 0, 0, 0);
  return Math.max(0, Math.floor((tomorrow.getTime() - kst.getTime()) / 1000));
}

// 05:00~06:00 사이 게시글 공개까지 남은 초
export function secondsUntilPublic(date?: Date): number {
  const now = date ?? new Date();
  const kst = toZonedTime(now, KST);
  const publicTime = new Date(kst);
  publicTime.setHours(PUBLIC_HOUR, 0, 0, 0);
  const publicUTC = fromZonedTime(publicTime, KST);
  return Math.max(0, Math.floor((publicUTC.getTime() - now.getTime()) / 1000));
}

// 05:00~05:59 구간에서 달 투명도 (1.0 → 0.0)
export function moonOpacity(date?: Date): number {
  const kst = toZonedTime(date ?? new Date(), KST);
  const hour = kst.getHours();
  if (hour < REVEALING_START_HOUR) return 1;
  if (hour >= PUBLIC_HOUR) return 0;
  const elapsed = kst.getMinutes() * 60 + kst.getSeconds();
  return Math.max(0, 1 - elapsed / 3600);
}

export type TimePhase =
  | "WRITING"    // 00:00~04:59 KST
  | "REVEALING"  // 05:00~05:59 KST — 달이 지는 시간, 공개 카운트다운
  | "LOCKED"     // 06:00~23:59 KST
  | "OPEN";

export function getCurrentPhase(date?: Date): TimePhase {
  const now = date ?? new Date();
  const hour = getKSTHour(now);
  if (hour >= WRITING_START_HOUR && hour < WRITING_END_HOUR) return "WRITING";
  if (hour >= REVEALING_START_HOUR && hour < PUBLIC_HOUR) return "REVEALING";
  return "LOCKED";
}
