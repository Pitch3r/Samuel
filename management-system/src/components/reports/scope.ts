import { isOpenStatus } from "@/lib/constants";
import { daysBetween } from "@/lib/format";
import { dayOf, inPeriod, wasOnTime, type Period } from "@/lib/metrics";
import { average, round, sum } from "@/lib/utils";
import type { Assignment, TimeLog } from "@/lib/types";

/*
 * Which records a report period covers. Pure functions shared by the
 * management report and the CSV exports, so both always agree.
 */

/** Calendar day an assignment stopped being open work, or null while it is still open. */
export function closedOn(assignment: Assignment) {
  if (assignment.status === "completed") return dayOf(assignment.completedAt) ?? dayOf(assignment.updatedAt);
  if (assignment.status === "cancelled") return dayOf(assignment.updatedAt);
  return null;
}

/**
 * Work that was live at some point in the period: opened on or before its
 * last day, and still open, or closed on or after its first day.
 */
export function activeDuring(assignment: Assignment, period: Period) {
  const opened = dayOf(assignment.createdAt);
  if (!opened || opened > period.to) return false;
  const closed = closedOn(assignment);
  return closed === null || closed >= period.from;
}

export function createdIn(assignment: Assignment, period: Period) {
  return inPeriod(dayOf(assignment.createdAt), period);
}

export function completedIn(assignment: Assignment, period: Period) {
  return assignment.status === "completed" && inPeriod(dayOf(assignment.completedAt), period);
}

/** Whole days from start (or creation) to completion. */
export function turnaroundDays(assignment: Assignment) {
  const start = assignment.startDate ?? dayOf(assignment.createdAt);
  const end = dayOf(assignment.completedAt);
  return start && end ? Math.max(daysBetween(start, end), 0) : null;
}

/** Fee still owed on an assignment (paid and waived work owes nothing). */
export function balanceOf(assignment: Assignment) {
  if (!assignment.fee || assignment.paymentStatus === "paid" || assignment.paymentStatus === "waived") return 0;
  return Math.max(assignment.fee - (assignment.amountPaid ?? 0), 0);
}

/** Fees owed on completed work: the money the firm has earned but not yet received. */
export function isOutstanding(assignment: Assignment) {
  return assignment.status === "completed" && balanceOf(assignment) > 0;
}

export type DeliverySummary = {
  active: number;
  created: number;
  completed: number;
  onTimeRate: number | null;
  timed: number;
  onTime: number;
  avgQuality: number | null;
  rated: number;
  avgTurnaround: number | null;
  revenue: number;
  hours: number;
  openNow: number;
  outstanding: number;
};

/** The headline delivery figures for a set of assignments and the time logged to them. */
export function summarise(assignments: Assignment[], timeLogs: TimeLog[], period: Period): DeliverySummary {
  const done = assignments.filter((assignment) => completedIn(assignment, period));
  const timed = done.map(wasOnTime).filter((value): value is boolean => value !== null);
  const onTime = timed.filter(Boolean).length;
  const ratings = done.map((assignment) => assignment.qualityRating).filter((value): value is number => typeof value === "number" && value > 0);
  const turnaround = done.map(turnaroundDays).filter((value): value is number => value !== null);
  const quality = average(ratings);
  const days = average(turnaround);
  return {
    active: assignments.filter((assignment) => activeDuring(assignment, period)).length,
    created: assignments.filter((assignment) => createdIn(assignment, period)).length,
    completed: done.length,
    onTimeRate: timed.length ? onTime / timed.length : null,
    timed: timed.length,
    onTime,
    avgQuality: quality === null ? null : round(quality, 1),
    rated: ratings.length,
    avgTurnaround: days === null ? null : round(days, 1),
    revenue: sum(done.map((assignment) => assignment.fee ?? 0)),
    hours: round(sum(timeLogs.filter((log) => inPeriod(log.date, period)).map((log) => log.hours)), 2),
    openNow: assignments.filter((assignment) => isOpenStatus(assignment.status)).length,
    outstanding: sum(assignments.filter(isOutstanding).map(balanceOf)),
  };
}
