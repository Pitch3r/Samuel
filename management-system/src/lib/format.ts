/**
 * Dates, numbers and money, always shown in Lusaka time (CAT, UTC+2) and
 * British English. Calendar dates are "YYYY-MM-DD" strings in Lusaka time.
 */

export const TIME_ZONE = "Africa/Lusaka";

const dateParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "YYYY-MM-DD" for an instant, in Lusaka time. */
export function toISODate(date: Date | string | number = new Date()) {
  return dateParts.format(new Date(date));
}

export function todayISO() {
  return toISODate(new Date());
}

/** Parses "YYYY-MM-DD" as midday UTC so arithmetic never crosses a day boundary. */
export function fromISODate(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

export function addDays(isoDate: string, days: number) {
  const date = fromISODate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function addMonths(isoDate: string, months: number) {
  const date = fromISODate(isoDate);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.toISOString().slice(0, 10);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: string, b: string) {
  return Math.round((fromISODate(b).getTime() - fromISODate(a).getTime()) / 86_400_000);
}

/** 0 = Sunday. */
export function weekdayOf(isoDate: string) {
  return fromISODate(isoDate).getUTCDay();
}

/** Monday of the week containing the date. */
export function startOfWeek(isoDate: string) {
  const day = weekdayOf(isoDate);
  return addDays(isoDate, day === 0 ? -6 : 1 - day);
}

export function startOfMonth(isoDate: string) {
  return `${isoDate.slice(0, 7)}-01`;
}

export function endOfMonth(isoDate: string) {
  return addDays(addMonths(startOfMonth(isoDate), 1), -1);
}

export function startOfQuarter(isoDate: string) {
  const month = Number(isoDate.slice(5, 7));
  const first = Math.floor((month - 1) / 3) * 3 + 1;
  return `${isoDate.slice(0, 4)}-${String(first).padStart(2, "0")}-01`;
}

export function startOfYear(isoDate: string) {
  return `${isoDate.slice(0, 4)}-01-01`;
}

/** Inclusive list of dates from start to end. */
export function dateRange(start: string, end: string) {
  const dates: string[] = [];
  for (let d = start; d <= end && dates.length < 800; d = addDays(d, 1)) dates.push(d);
  return dates;
}

export function isWeekday(isoDate: string) {
  const day = weekdayOf(isoDate);
  return day !== 0 && day !== 6;
}

const fmtDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmtDateLong = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const fmtDayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtMonth = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const fmtMonthShort = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
const fmtWeekdayShort = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });
const fmtDateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});
const fmtTime = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });

/** "12 Mar 2026" for a calendar date. */
export function formatDate(isoDate: string | null | undefined, fallback = "No date") {
  if (!isoDate) return fallback;
  return fmtDate.format(fromISODate(isoDate.slice(0, 10)));
}

export function formatDateLong(isoDate: string) {
  return fmtDateLong.format(fromISODate(isoDate));
}

export function formatDayMonth(isoDate: string) {
  return fmtDayMonth.format(fromISODate(isoDate));
}

export function formatMonth(isoDate: string) {
  return fmtMonth.format(fromISODate(isoDate.length === 7 ? `${isoDate}-01` : isoDate));
}

export function formatMonthShort(isoDate: string) {
  return fmtMonthShort.format(fromISODate(isoDate.length === 7 ? `${isoDate}-01` : isoDate));
}

export function formatWeekdayShort(isoDate: string) {
  return fmtWeekdayShort.format(fromISODate(isoDate));
}

/** "12 Mar 2026, 14:05" for an instant, in Lusaka time. */
export function formatDateTime(iso: string | null | undefined, fallback = "Never") {
  if (!iso) return fallback;
  return fmtDateTime.format(new Date(iso));
}

export function formatTime(iso: string | null | undefined, fallback = "") {
  if (!iso) return fallback;
  return fmtTime.format(new Date(iso));
}

/** "3 minutes ago", "yesterday", "in 4 days". */
export function formatRelative(iso: string, now = new Date()) {
  const diff = new Date(iso).getTime() - now.getTime();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en-GB", { numeric: "auto" });
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (abs < minute) return "just now";
  if (abs < hour) return rtf.format(Math.round(diff / minute), "minute");
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour");
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day");
  return formatDateTime(iso);
}

/** "Due in 3 days", "Due today", "2 days overdue" for a calendar date. */
export function describeDue(dueDate: string | null, today = todayISO()) {
  if (!dueDate) return { label: "No due date", days: null as number | null, tone: "neutral" as const };
  const days = daysBetween(today, dueDate);
  if (days < 0) return { label: `${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} overdue`, days, tone: "danger" as const };
  if (days === 0) return { label: "Due today", days, tone: "warning" as const };
  if (days === 1) return { label: "Due tomorrow", days, tone: "warning" as const };
  if (days <= 7) return { label: `Due in ${days} days`, days, tone: "warning" as const };
  return { label: `Due ${formatDate(dueDate)}`, days, tone: "neutral" as const };
}

const numberFmt = new Intl.NumberFormat("en-GB");
const compactFmt = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 });

export function formatNumber(value: number | null | undefined, fallback = "0") {
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  return numberFmt.format(value);
}

export function formatCompact(value: number) {
  return Math.abs(value) < 10_000 ? numberFmt.format(Math.round(value)) : compactFmt.format(value);
}

/** "K 12,500" in Zambian kwacha. */
export function formatMoney(value: number | null | undefined, { compact = false } = {}) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "K 0";
  if (compact && Math.abs(value) >= 10_000) return `K ${compactFmt.format(value)}`;
  return `K ${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value)}`;
}

export function formatPercent(value: number | null | undefined, fallback = "No data") {
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  return `${Math.round(value * 100)}%`;
}

export function formatHours(hours: number | null | undefined) {
  if (!hours) return "0 h";
  const rounded = Math.round(hours * 4) / 4;
  return `${numberFmt.format(rounded)} h`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Part of the day for a greeting, in Lusaka time. */
export function greeting(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
