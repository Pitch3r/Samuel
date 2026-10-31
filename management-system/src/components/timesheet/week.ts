import { addDays, formatDate, formatDayMonth, startOfWeek } from "@/lib/format";
import { round } from "@/lib/utils";

/*
 * Week maths for the timesheet. Weeks run Monday to Sunday; targets are
 * spread over the five working days, so a week in progress is judged against
 * the working days already behind us.
 */

/** Monday of the week named by ?week=, or of the current week. */
export function parseWeek(value: unknown, fallbackMonday: string) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallbackMonday;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return fallbackMonday;
  return startOfWeek(value);
}

/** The seven dates of a week, Monday first. */
export function weekDays(monday: string) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** "26 Oct to 1 Nov 2026" for a Monday. */
export function weekLabel(monday: string) {
  return `${formatDayMonth(monday)} to ${formatDate(addDays(monday, 6))}`;
}

export type TargetState = "met" | "on-track" | "behind" | "short" | "upcoming" | "none";

export type TargetStatus = { state: TargetState; label: string; gap: number; expected: number };

/**
 * How a week's hours compare with the weekly target.
 * - met: the full target is reached
 * - on-track: a week in progress, at or above the pro-rata target so far
 * - behind: a week in progress, below the pro-rata target so far
 * - short: a finished week below the target
 */
export function targetStatus(hours: number, target: number, monday: string, today: string): TargetStatus {
  if (target <= 0) return { state: "none", label: "No target set", gap: 0, expected: 0 };
  if (monday > today) return { state: "upcoming", label: "Not started", gap: target, expected: 0 };
  if (hours >= target - 0.001) return { state: "met", label: "Target met", gap: 0, expected: target };
  // Once Friday is behind us (including the weekend of that week) the week is judged in full.
  if (addDays(monday, 4) < today) {
    const gap = round(target - hours, 2);
    return { state: "short", label: `${formatGap(gap)} short`, gap, expected: target };
  }
  // Working days strictly before today count as elapsed; today is still in progress.
  const elapsed = weekDays(monday)
    .slice(0, 5)
    .filter((day) => day < today).length;
  const expected = round((target * elapsed) / 5, 2);
  if (hours >= expected - 0.001) return { state: "on-track", label: "On track", gap: 0, expected };
  const gap = round(expected - hours, 2);
  return { state: "behind", label: `${formatGap(gap)} behind`, gap, expected };
}

function formatGap(hours: number) {
  const rounded = Math.round(hours * 4) / 4;
  return `${rounded.toLocaleString("en-GB")} h`;
}
