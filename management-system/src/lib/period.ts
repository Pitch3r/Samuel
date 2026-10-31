import { addDays, addMonths, endOfMonth, formatDate, startOfMonth, startOfQuarter, startOfWeek, startOfYear, todayISO } from "@/lib/format";
import type { Period } from "@/lib/metrics";

export const PERIOD_PRESETS = [
  { id: "this-week", label: "This week" },
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "last-30", label: "Last 30 days" },
  { id: "this-quarter", label: "This quarter" },
  { id: "last-90", label: "Last 90 days" },
  { id: "this-year", label: "This year" },
  { id: "custom", label: "Custom range" },
] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["id"];

/** A real calendar date from 2000 onwards; anything else falls back to the default period. */
const valid = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "2000-01-01") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

/** Longest custom range, so one request cannot ask for decades of data. */
export const MAX_PERIOD_DAYS = 3 * 366;

/**
 * Reads ?period=this-month (or ?from=YYYY-MM-DD&to=YYYY-MM-DD) from a page's
 * search params. Used by reports, performance, attendance and timesheets.
 */
export function resolvePeriod(params: Record<string, string | string[] | undefined>, fallback: PeriodPreset = "this-month") {
  const today = todayISO();
  const requested = typeof params.period === "string" ? params.period : undefined;
  const preset = (PERIOD_PRESETS.find((p) => p.id === requested)?.id ?? (valid(params.from) && valid(params.to) ? "custom" : fallback)) as PeriodPreset;
  let period: Period;
  switch (preset) {
    case "this-week":
      period = { from: startOfWeek(today), to: today };
      break;
    case "last-month": {
      const first = addMonths(startOfMonth(today), -1);
      period = { from: first, to: endOfMonth(first) };
      break;
    }
    case "last-30":
      period = { from: addDays(today, -29), to: today };
      break;
    case "this-quarter":
      period = { from: startOfQuarter(today), to: today };
      break;
    case "last-90":
      period = { from: addDays(today, -89), to: today };
      break;
    case "this-year":
      period = { from: startOfYear(today), to: today };
      break;
    case "custom": {
      const from = valid(params.from) ? params.from : startOfMonth(today);
      const to = valid(params.to) ? params.to : today;
      const ordered = from <= to ? { from, to } : { from: to, to: from };
      // Keep the end date and trim the start when the range is too long.
      const earliest = addDays(ordered.to, -(MAX_PERIOD_DAYS - 1));
      period = { from: ordered.from < earliest ? earliest : ordered.from, to: ordered.to };
      break;
    }
    default:
      period = { from: startOfMonth(today), to: today };
  }
  const label = preset === "custom" ? `${formatDate(period.from)} to ${formatDate(period.to)}` : (PERIOD_PRESETS.find((p) => p.id === preset)?.label ?? "");
  return { preset, period, label };
}

/** The same-length period immediately before, for "vs last period" deltas. */
export function previousPeriod(period: Period): Period {
  const length = Math.round((new Date(`${period.to}T12:00:00Z`).getTime() - new Date(`${period.from}T12:00:00Z`).getTime()) / 86_400_000) + 1;
  return { from: addDays(period.from, -length), to: addDays(period.from, -1) };
}
