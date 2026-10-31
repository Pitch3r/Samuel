/**
 * Performance and dashboard figures. Pure functions over records already
 * loaded, so they are unit tested (tests/unit/metrics.test.ts) and shared by
 * the dashboard, the performance pages and the reports.
 */

import { ASSIGNMENT_STATUSES, isOpenStatus, SCORE_WEIGHTS, TRACKS, type AssignmentStatus, type Track } from "@/lib/constants";
import { addDays, addMonths, dateRange, daysBetween, isWeekday, startOfMonth, startOfWeek, toISODate, todayISO } from "@/lib/format";
import { average, round, sum } from "@/lib/utils";
import type { Assignment, AttendanceRecord, TimeLog, UserProfile, WorkReport } from "@/lib/types";

export type Period = { from: string; to: string };

/** Calendar date (Lusaka) an ISO instant falls on. */
export function dayOf(iso: string | null) {
  return iso ? toISODate(iso) : null;
}

export function inPeriod(date: string | null, period: Period) {
  return Boolean(date && date >= period.from && date <= period.to);
}

export function isOverdue(assignment: Assignment, today = todayISO()) {
  return isOpenStatus(assignment.status) && Boolean(assignment.dueDate && assignment.dueDate < today);
}

export function isDueWithin(assignment: Assignment, days: number, today = todayISO()) {
  if (!isOpenStatus(assignment.status) || !assignment.dueDate) return false;
  const diff = daysBetween(today, assignment.dueDate);
  return diff >= 0 && diff <= days;
}

/** Completed on or before the due date (assignments without a due date are not counted either way). */
export function wasOnTime(assignment: Assignment) {
  const done = dayOf(assignment.completedAt);
  if (!done || !assignment.dueDate) return null;
  return done <= assignment.dueDate;
}

export function workingDays(period: Period) {
  return dateRange(period.from, period.to).filter(isWeekday).length;
}

export function weeksIn(period: Period) {
  const weeks = new Set(dateRange(period.from, period.to).filter(isWeekday).map(startOfWeek));
  return [...weeks];
}

export type ScoreParts = { onTime: number | null; quality: number | null; throughput: number | null; reporting: number | null };

export function scoreFrom(parts: ScoreParts) {
  let weighted = 0;
  let weights = 0;
  for (const key of Object.keys(SCORE_WEIGHTS) as (keyof ScoreParts)[]) {
    const value = parts[key];
    if (value === null || !Number.isFinite(value)) continue;
    weighted += SCORE_WEIGHTS[key] * Math.min(Math.max(value, 0), 1);
    weights += SCORE_WEIGHTS[key];
  }
  return weights ? Math.round((weighted / weights) * 100) : null;
}

export function scoreGrade(score: number | null) {
  if (score === null) return { label: "Not enough data", tone: "neutral" as const };
  if (score >= 85) return { label: "Excellent", tone: "good" as const };
  if (score >= 70) return { label: "Good", tone: "good" as const };
  if (score >= 55) return { label: "Fair", tone: "warning" as const };
  return { label: "Needs attention", tone: "danger" as const };
}

export interface EmployeeMetrics {
  uid: string;
  name: string;
  activeCount: number;
  overdueCount: number;
  dueSoonCount: number;
  underReviewCount: number;
  assignedInPeriod: number;
  completedInPeriod: number;
  completedOnTime: number;
  completedLate: number;
  onTimeRate: number | null;
  avgQuality: number | null;
  ratedCount: number;
  avgTurnaroundDays: number | null;
  hoursLogged: number;
  hoursTarget: number;
  hoursRate: number | null;
  completedTarget: number;
  reportsSubmitted: number;
  reportWeeksCovered: number;
  reportWeeksExpected: number;
  attendanceDays: number;
  workingDays: number;
  revenue: number;
  score: number | null;
  parts: ScoreParts;
}

export function employeeMetrics(
  user: Pick<UserProfile, "uid" | "displayName" | "targets"> & Partial<Pick<UserProfile, "startDate">>,
  data: { assignments: Assignment[]; timeLogs: TimeLog[]; reports: WorkReport[]; attendance: AttendanceRecord[] },
  period: Period,
  today = todayISO(),
): EmployeeMetrics {
  const mine = data.assignments.filter((assignment) => assignment.assigneeIds.includes(user.uid));
  const open = mine.filter((assignment) => isOpenStatus(assignment.status));
  const completed = mine.filter((assignment) => assignment.status === "completed" && inPeriod(dayOf(assignment.completedAt), period));
  const timed = completed.map(wasOnTime).filter((value): value is boolean => value !== null);
  const onTime = timed.filter(Boolean).length;
  const rated = completed.filter((assignment) => assignment.qualityRating);
  const turnaround = completed
    .map((assignment) => {
      const start = assignment.startDate ?? dayOf(assignment.createdAt);
      const end = dayOf(assignment.completedAt);
      return start && end ? Math.max(daysBetween(start, end), 0) : null;
    })
    .filter((value): value is number => value !== null);

  const hoursLogged = round(sum(data.timeLogs.filter((log) => log.uid === user.uid && inPeriod(log.date, period)).map((log) => log.hours)), 2);
  const days = workingDays(period);
  const hoursTarget = round((user.targets.weeklyHours / 5) * days, 1);
  const months = Math.max(daysBetween(period.from, period.to) + 1, 1) / 30.44;
  const completedTarget = Math.max(round(user.targets.monthlyAssignments * months, 1), 0.5);

  const myReports = data.reports.filter((report) => report.uid === user.uid);
  // Weeks before the person started are not expected to have reports.
  const startWeek = user.startDate ? startOfWeek(user.startDate) : null;
  const expectedWeeks = weeksIn(period).filter((week) => !startWeek || week >= startWeek);
  const coveredWeeks = new Set<string>();
  for (const report of myReports) {
    for (const weekStart of expectedWeeks) {
      if (report.periodStart <= addDays(weekStart, 6) && report.periodEnd >= weekStart) coveredWeeks.add(weekStart);
    }
  }

  const avgQuality = average(rated.map((assignment) => assignment.qualityRating ?? 0));
  const activeInPeriod = mine.some((assignment) => {
    const created = dayOf(assignment.createdAt) ?? "";
    const closedAt = assignment.status === "completed" ? dayOf(assignment.completedAt) : null;
    const closedEarly = assignment.status === "cancelled" ? (dayOf(assignment.updatedAt) ?? "") < period.from : Boolean(closedAt && closedAt < period.from);
    return created <= period.to && !closedEarly;
  });
  const parts: ScoreParts = {
    onTime: timed.length ? onTime / timed.length : null,
    quality: avgQuality !== null ? avgQuality / 5 : null,
    // Output only counts when the person had work during the period.
    throughput: activeInPeriod ? Math.min(completed.length / completedTarget, 1) : null,
    reporting: expectedWeeks.length ? coveredWeeks.size / expectedWeeks.length : null,
  };

  return {
    uid: user.uid,
    name: user.displayName,
    activeCount: open.length,
    overdueCount: open.filter((assignment) => isOverdue(assignment, today)).length,
    dueSoonCount: open.filter((assignment) => isDueWithin(assignment, 7, today)).length,
    underReviewCount: open.filter((assignment) => assignment.status === "under_review").length,
    assignedInPeriod: mine.filter((assignment) => inPeriod(dayOf(assignment.createdAt), period)).length,
    completedInPeriod: completed.length,
    completedOnTime: onTime,
    completedLate: timed.length - onTime,
    onTimeRate: timed.length ? onTime / timed.length : null,
    avgQuality: avgQuality !== null ? round(avgQuality, 1) : null,
    ratedCount: rated.length,
    avgTurnaroundDays: turnaround.length ? round(average(turnaround) ?? 0, 1) : null,
    hoursLogged,
    hoursTarget,
    hoursRate: hoursTarget ? hoursLogged / hoursTarget : null,
    completedTarget,
    reportsSubmitted: myReports.filter((report) => inPeriod(report.periodStart, period)).length,
    reportWeeksCovered: coveredWeeks.size,
    reportWeeksExpected: expectedWeeks.length,
    attendanceDays: new Set(data.attendance.filter((record) => record.uid === user.uid && inPeriod(record.date, period)).map((record) => record.date)).size,
    workingDays: days,
    revenue: sum(completed.map((assignment) => assignment.fee ?? 0)),
    score: scoreFrom(parts),
    parts,
  };
}

/* ------------------------------------------------------------------ organisation */

export function countByStatus(assignments: Assignment[]) {
  const counts = Object.fromEntries(ASSIGNMENT_STATUSES.map((status) => [status, 0])) as Record<AssignmentStatus, number>;
  for (const assignment of assignments) counts[assignment.status] += 1;
  return counts;
}

export function countByTrack(assignments: Assignment[]) {
  const counts = Object.fromEntries(TRACKS.map((track) => [track, 0])) as Record<Track, number>;
  for (const assignment of assignments) counts[assignment.track] += 1;
  return counts;
}

export function countByCategory(assignments: Assignment[]) {
  const map = new Map<string, { id: string; name: string; track: Track; total: number; open: number; completed: number; revenue: number }>();
  for (const assignment of assignments) {
    const entry = map.get(assignment.categoryId) ?? {
      id: assignment.categoryId,
      name: assignment.categoryName,
      track: assignment.track,
      total: 0,
      open: 0,
      completed: 0,
      revenue: 0,
    };
    entry.total += 1;
    if (isOpenStatus(assignment.status)) entry.open += 1;
    if (assignment.status === "completed") {
      entry.completed += 1;
      entry.revenue += assignment.fee ?? 0;
    }
    map.set(assignment.categoryId, entry);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

/** Month-by-month counts for the last `months` months, oldest first. */
export function monthlySeries(assignments: Assignment[], months = 6, today = todayISO()) {
  const first = addMonths(startOfMonth(today), -(months - 1));
  const keys = Array.from({ length: months }, (_, i) => addMonths(first, i).slice(0, 7));
  const rows = keys.map((month) => ({ month, created: 0, completed: 0, corporate: 0, academic: 0, revenue: 0, onTime: 0, timed: 0 }));
  const index = new Map(keys.map((key, i) => [key, i]));
  for (const assignment of assignments) {
    const created = index.get((dayOf(assignment.createdAt) ?? "").slice(0, 7));
    if (created !== undefined) rows[created]!.created += 1;
    const doneDay = assignment.status === "completed" ? dayOf(assignment.completedAt) : null;
    const done = doneDay ? index.get(doneDay.slice(0, 7)) : undefined;
    if (done !== undefined) {
      const row = rows[done]!;
      row.completed += 1;
      row[assignment.track] += 1;
      row.revenue += assignment.fee ?? 0;
      const timely = wasOnTime(assignment);
      if (timely !== null) {
        row.timed += 1;
        if (timely) row.onTime += 1;
      }
    }
  }
  return rows;
}

/** Hours per day per person between two dates. */
export function hoursByDay(timeLogs: TimeLog[], period: Period, uids: string[]) {
  return dateRange(period.from, period.to).map((date) => {
    const row: Record<string, number | string> & { date: string } = { date };
    for (const uid of uids) {
      row[uid] = round(sum(timeLogs.filter((log) => log.uid === uid && log.date === date).map((log) => log.hours)), 2);
    }
    return row;
  });
}

export function overallOnTimeRate(assignments: Assignment[], period: Period) {
  const timed = assignments
    .filter((assignment) => assignment.status === "completed" && inPeriod(dayOf(assignment.completedAt), period))
    .map(wasOnTime)
    .filter((value): value is boolean => value !== null);
  return timed.length ? timed.filter(Boolean).length / timed.length : null;
}

/** Fees on completed work not yet fully paid. */
export function outstandingFees(assignments: Assignment[]) {
  return sum(
    assignments
      .filter((assignment) => assignment.status === "completed" && assignment.fee && assignment.paymentStatus !== "paid" && assignment.paymentStatus !== "waived")
      .map((assignment) => Math.max((assignment.fee ?? 0) - (assignment.amountPaid ?? 0), 0)),
  );
}
