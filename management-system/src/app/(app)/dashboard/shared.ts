import { isOpenStatus, PRIORITY_RANK } from "@/lib/constants";
import { addDays, addMonths, startOfMonth, startOfQuarter, startOfWeek } from "@/lib/format";
import { dayOf, inPeriod, type Period } from "@/lib/metrics";
import { round, sum } from "@/lib/utils";
import type { Assignment, TimeLog } from "@/lib/types";

/*
 * Date windows and small aggregations shared by the administrator and the
 * employee dashboards. Pure functions over records that are already loaded.
 */

/** Number of weeks in the hours sparklines, current week included. */
export const SPARK_WEEKS = 8;

export function dashboardDates(today: string) {
  const monthStart = startOfMonth(today);
  const weekStart = startOfWeek(today);
  const quarterStart = startOfQuarter(today);
  const sparkWeekStarts = Array.from({ length: SPARK_WEEKS }, (_, i) => addDays(weekStart, -7 * (SPARK_WEEKS - 1 - i)));
  const fortnightStart = addDays(today, -13);
  return {
    today,
    monthStart,
    month: { from: monthStart, to: today } satisfies Period,
    /** The same stretch of last month (addMonths clamps the 31st to the month's end). */
    lastMonthToDate: { from: addMonths(monthStart, -1), to: addMonths(today, -1) } satisfies Period,
    weekStart,
    week: { from: weekStart, to: today } satisfies Period,
    lastWeekToDate: { from: addDays(weekStart, -7), to: addDays(today, -7) } satisfies Period,
    quarter: { from: quarterStart, to: today } satisfies Period,
    lastQuarter: { from: addMonths(quarterStart, -3), to: addDays(quarterStart, -1) } satisfies Period,
    sparkWeekStarts,
    fortnight: { from: fortnightStart, to: today } satisfies Period,
    /** Earliest date any hours figure on the dashboards needs. */
    logsFrom: [sparkWeekStarts[0]!, monthStart, fortnightStart].sort()[0]!,
  };
}

export function hoursIn(logs: TimeLog[], period: Period, uids?: Set<string>) {
  return round(sum(logs.filter((log) => inPeriod(log.date, period) && (!uids || uids.has(log.uid))).map((log) => log.hours)), 2);
}

/** Hours per week for the sparkline weeks, oldest first. */
export function weeklyHours(logs: TimeLog[], weekStarts: string[], uids?: Set<string>) {
  return weekStarts.map((from) => hoursIn(logs, { from, to: addDays(from, 6) }, uids));
}

export function completedIn(assignments: Assignment[], period: Period) {
  return assignments.filter((assignment) => assignment.status === "completed" && inPeriod(dayOf(assignment.completedAt), period));
}

/**
 * Assignments that were open at the end of a day: created by then and not yet
 * completed. Cancelled work carries no date, so it is left out throughout.
 */
export function openOn(assignments: Assignment[], date: string) {
  return assignments.filter((assignment) => {
    if (assignment.status === "cancelled") return false;
    const created = dayOf(assignment.createdAt);
    if (!created || created > date) return false;
    if (assignment.status !== "completed") return true;
    const done = dayOf(assignment.completedAt);
    return Boolean(done && done > date);
  }).length;
}

/** Due date (no date last), then priority, then title. */
export function byDueThenPriority(a: Assignment, b: Assignment) {
  const due = (a.dueDate ?? "9999-12-31").localeCompare(b.dueDate ?? "9999-12-31");
  return due || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.title.localeCompare(b.title);
}

export function openAssignments(assignments: Assignment[]) {
  return assignments.filter((assignment) => isOpenStatus(assignment.status));
}

export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
