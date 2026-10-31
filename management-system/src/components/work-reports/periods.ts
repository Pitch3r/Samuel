import { addDays, addMonths, endOfMonth, formatDate, fromISODate, startOfMonth, startOfWeek, weekdayOf } from "@/lib/format";
import { REPORT_PERIOD_LABELS, type ReportPeriod } from "@/lib/constants";

/*
 * Date ranges for daily, weekly and monthly reports. Safe for client and
 * server: plain date arithmetic on "YYYY-MM-DD" strings.
 */

export type Range = { start: string; end: string };

/** Default range when a report type is chosen: today; Monday to Friday this week; the whole month. */
export function defaultRange(period: ReportPeriod, today: string): Range {
  if (period === "daily") return { start: today, end: today };
  if (period === "weekly") {
    const monday = startOfWeek(today);
    return { start: monday, end: addDays(monday, 4) };
  }
  return { start: startOfMonth(today), end: endOfMonth(today) };
}

/** The range before the default: the previous working day, last week or last month. */
export function previousRange(period: ReportPeriod, today: string): Range {
  if (period === "daily") {
    let day = addDays(today, -1);
    while (weekdayOf(day) === 0 || weekdayOf(day) === 6) day = addDays(day, -1);
    return { start: day, end: day };
  }
  if (period === "weekly") {
    const monday = addDays(startOfWeek(today), -7);
    return { start: monday, end: addDays(monday, 4) };
  }
  const first = addMonths(startOfMonth(today), -1);
  return { start: first, end: endOfMonth(first) };
}

export const RANGE_CHOICES: Record<ReportPeriod, [string, string]> = {
  daily: ["Today", "Previous working day"],
  weekly: ["This week", "Last week"],
  monthly: ["This month", "Last month"],
};

const longMonth = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
const dayOnly = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "UTC" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** "31 Oct 2026", "26 to 30 Oct 2026", "28 Sept to 2 Oct 2026" or "October 2026" for a whole month. */
export function rangeLabel(start: string, end: string) {
  if (start === end) return formatDate(start);
  if (start === startOfMonth(start) && end === endOfMonth(start)) return longMonth.format(fromISODate(start));
  if (start.slice(0, 7) === end.slice(0, 7)) return `${dayOnly.format(fromISODate(start))} to ${formatDate(end)}`;
  if (start.slice(0, 4) === end.slice(0, 4)) return `${dayMonth.format(fromISODate(start))} to ${formatDate(end)}`;
  return `${formatDate(start)} to ${formatDate(end)}`;
}

/** "Weekly report, 26 to 30 Oct 2026". */
export function reportTitle(report: { period: ReportPeriod; periodStart: string; periodEnd: string }) {
  return `${REPORT_PERIOD_LABELS[report.period]}, ${rangeLabel(report.periodStart, report.periodEnd)}`;
}

/** Longest span, in days, each kind of report may cover. */
export const MAX_SPAN_DAYS: Record<ReportPeriod, number> = { daily: 1, weekly: 7, monthly: 31 };
