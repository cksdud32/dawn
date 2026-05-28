import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { format, addDays, parseISO } from "date-fns";

const KST = "Asia/Seoul";

export const WRITING_START_HOUR = 0;  // 00:00 KST
export const WRITING_END_HOUR = 5;    // 05:00 KST (exclusive)
export const PUBLIC_HOUR = 6;         // 06:00 KST next day

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

// Writing window: 00:00 ~ 05:00 KST
export function isWritingWindow(date?: Date): boolean {
  const hour = getKSTHour(date);
  return hour >= WRITING_START_HOUR && hour < WRITING_END_HOUR;
}

// Posts from dawnDate become public at 06:00 KST the next day
// = dawnDate + 1day at 06:00 KST
export function getPublicAtUTC(dawnDate: string): Date {
  const nextDay = addDays(parseISO(dawnDate), 1);
  const nextDayStr = format(nextDay, "yyyy-MM-dd");
  return fromZonedTime(`${nextDayStr}T${PUBLIC_HOUR.toString().padStart(2, "0")}:00:00`, KST);
}

export function isPostPublic(dawnDate: string, now?: Date): boolean {
  const checkAt = now ?? new Date();
  return checkAt >= getPublicAtUTC(dawnDate);
}

export function areCommentsEnabled(dawnDate: string, now?: Date): boolean {
  return isPostPublic(dawnDate, now);
}

// Minutes remaining until writing window closes
export function minutesUntilClose(date?: Date): number {
  const kst = toZonedTime(date ?? new Date(), KST);
  const closeTime = new Date(kst);
  closeTime.setHours(WRITING_END_HOUR, 0, 0, 0);
  return Math.max(0, Math.floor((closeTime.getTime() - kst.getTime()) / 60000));
}

// Seconds until writing window opens (next midnight KST)
export function secondsUntilOpen(date?: Date): number {
  const kst = toZonedTime(date ?? new Date(), KST);
  const tomorrow = addDays(kst, 1);
  tomorrow.setHours(WRITING_START_HOUR, 0, 0, 0);
  return Math.max(0, Math.floor((tomorrow.getTime() - kst.getTime()) / 1000));
}

export type TimePhase =
  | "WRITING"    // 00:00~05:00 KST — can write
  | "LOCKED"     // 05:00~23:59 KST — locked, see own posts only (same day)
  | "OPEN";      // next day 06:00+ — posts are public

export function getCurrentPhase(date?: Date): TimePhase {
  const now = date ?? new Date();
  const hour = getKSTHour(now);
  if (hour >= WRITING_START_HOUR && hour < WRITING_END_HOUR) return "WRITING";
  return "LOCKED";
}
