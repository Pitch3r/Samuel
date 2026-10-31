import { addDays, dateRange, isWeekday, TIME_ZONE } from "@/lib/format";
import { average, round } from "@/lib/utils";
import type { Period } from "@/lib/metrics";
import type { AttendanceRecord } from "@/lib/types";

/*
 * Attendance figures from the daily sign-in records. All clock times are in
 * Lusaka time. Pure functions, safe on client and server.
 */

/** Arrivals after 08:30 count as late. */
export const LATE_AFTER_MINUTES = 8 * 60 + 30;
export const LATE_AFTER_LABEL = "08:30";

const clockParts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE });

/** Minutes after midnight, Lusaka time, for an ISO instant. */
export function lusakaMinutes(iso: string) {
  const parts = clockParts.formatToParts(new Date(iso));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

/** "08:05" for minutes after midnight. */
export function formatClock(minutes: number | null, fallback = "No data") {
  if (minutes === null || !Number.isFinite(minutes)) return fallback;
  const rounded = Math.round(minutes);
  return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
}

/** "8 h 25 min" for a number of hours. */
export function formatDuration(hours: number | null, fallback = "No data") {
  if (hours === null || !Number.isFinite(hours)) return fallback;
  const minutes = Math.round(hours * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function firstSignIn(record: AttendanceRecord) {
  return record.firstSignInAt || record.lastSeenAt;
}

/** The later of last seen and signed out: when the person was last known to be working. */
export function lastActivity(record: AttendanceRecord) {
  return [record.lastSeenAt, record.lastSignOutAt].filter((value): value is string => Boolean(value)).sort().at(-1) ?? record.lastSeenAt;
}

/** Hours from first sign-in to last activity. */
export function hoursInOffice(record: AttendanceRecord) {
  const start = Date.parse(firstSignIn(record));
  const end = Date.parse(lastActivity(record));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return (end - start) / 3_600_000;
}

/** Late means after 08:30 on a working day; weekend visits are never late. */
export function isLate(record: AttendanceRecord) {
  return isWeekday(record.date) && lusakaMinutes(firstSignIn(record)) > LATE_AFTER_MINUTES;
}

/** Signed out, and not seen again since. */
export function isSignedOut(record: AttendanceRecord) {
  return Boolean(record.lastSignOutAt && record.lastSignOutAt >= record.lastSeenAt);
}

/**
 * Working days the person was expected in: weekdays in the period, from
 * their start date, up to yesterday. Today only counts once they have signed in,
 * so a morning view does not show everyone as absent.
 */
export function expectedDays(period: Period, today: string, startDate: string | null, presentToday: boolean) {
  const from = startDate && startDate > period.from ? startDate : period.from;
  const to = period.to < today ? period.to : addDays(today, -1);
  const days = from <= to ? dateRange(from, to).filter(isWeekday) : [];
  if (presentToday && isWeekday(today) && today >= from && today <= period.to) days.push(today);
  return days;
}

export type AttendanceSummary = {
  daysPresent: number;
  expected: number;
  weekendDays: number;
  rate: number | null;
  avgFirstIn: number | null;
  late: number;
  avgHours: number | null;
  missed: string[];
};

export function summarise(records: AttendanceRecord[], expected: string[]): AttendanceSummary {
  const dates = new Set(records.map((record) => record.date));
  const presentOnWorkingDays = expected.filter((day) => dates.has(day)).length;
  const weekendDays = [...dates].filter((day) => !isWeekday(day)).length;
  // Arrival times and day lengths describe normal working days, so weekend visits are left out.
  const working = records.filter((record) => isWeekday(record.date));
  const lengths = working.map(hoursInOffice).filter((hours) => hours > 0);
  return {
    daysPresent: presentOnWorkingDays,
    expected: expected.length,
    weekendDays,
    rate: expected.length ? presentOnWorkingDays / expected.length : null,
    avgFirstIn: average(working.map((record) => lusakaMinutes(firstSignIn(record)))),
    late: records.filter(isLate).length,
    avgHours: lengths.length ? round(average(lengths) ?? 0, 2) : null,
    missed: expected.filter((day) => !dates.has(day)).reverse(),
  };
}

/** Meter colour for an attendance rate, paired with a written label wherever it is shown. */
export function rateTone(rate: number | null) {
  if (rate === null) return "navy" as const;
  if (rate >= 0.9) return "good" as const;
  if (rate >= 0.75) return "blue" as const;
  return "warning" as const;
}

/** Heatmap steps for hours in the office: a short visit, half a day, most of a day, a full day, a long day. */
export const OFFICE_THRESHOLDS = [0.01, 3, 5, 7, 9];

/** Hours in the office per date, for the calendar heatmap. */
export function hoursByDate(records: AttendanceRecord[]) {
  const values: Record<string, number> = {};
  for (const record of records) values[record.date] = round((values[record.date] ?? 0) + hoursInOffice(record), 1);
  return values;
}
