import "server-only";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listUsers } from "@/lib/data/users";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listWorkReports } from "@/lib/data/work-reports";
import { listAttendance } from "@/lib/data/attendance";
import { listActivity } from "@/lib/data/activity";
import { listDevices } from "@/lib/data/devices";
import { listLoginEvents, listOpenSessions } from "@/lib/data/sessions";
import { listAnnouncements } from "@/lib/data/announcements";
import { getAccessSettings } from "@/lib/data/settings";
import { PRIORITY_RANK } from "@/lib/constants";
import { addDays, daysBetween, endOfMonth, formatDayMonth, formatMonth, formatMonthShort, formatWeekdayShort, toISODate, todayISO } from "@/lib/format";
import {
  countByCategory,
  countByStatus,
  countByTrack,
  employeeMetrics,
  hoursByDay,
  isDueWithin,
  isOverdue,
  monthlySeries,
  outstandingFees,
  overallOnTimeRate,
} from "@/lib/metrics";
import { sum } from "@/lib/utils";
import { employeeSlot } from "@/components/charts/scale";
import type { PersonLite } from "@/components/assignments/assignment-list";
import type { BarRow, BarSeries } from "@/components/charts/bar-chart";
import type { Viewer } from "@/lib/types";
import { byDueThenPriority, completedIn, dashboardDates, hoursIn, openAssignments, openOn, weeklyHours } from "./shared";

/** A session counts as "active now" if it has checked in within this window. */
const ACTIVE_WINDOW_MS = 30 * 60 * 1000;

/**
 * Everything the administrator's dashboard shows, loaded in one parallel pass
 * and reduced in memory (no per-item queries).
 */
export async function loadAdminDashboard(viewer: Viewer) {
  const today = todayISO();
  const dates = dashboardDates(today);

  const [assignments, users, timeLogs, reports, attendance, activity, devices, loginEvents, announcements, access, sessions] = await Promise.all([
    listAssignmentsFor(viewer),
    listUsers(),
    listTimeLogs(viewer, { from: dates.logsFrom, to: today }),
    listWorkReports(viewer),
    listAttendance(viewer, { from: dates.monthStart, to: today }),
    listActivity(12),
    listDevices(),
    listLoginEvents(100),
    listAnnouncements(),
    getAccessSettings(),
    listOpenSessions(),
  ]);

  const people = new Map<string, PersonLite>(users.map((user) => [user.uid, { uid: user.uid, name: user.displayName, photoVersion: user.photoUpdatedAt }]));
  const employees = users.filter((user) => user.role === "employee");
  const team = employees.filter((user) => user.status === "active");
  const employeeUids = new Set(employees.map((user) => user.uid));
  // Slots follow each person's place in the full employee list, so colours do not move.
  const slotOf = new Map(employees.map((user, i) => [user.uid, employeeSlot(i)]));

  const now = Date.now();
  const activeUids = new Set(
    sessions.filter((session) => now - new Date(session.lastSeenAt).getTime() < ACTIVE_WINDOW_MS).map((session) => session.uid),
  );

  /* ---------------------------------------------------------------- KPIs */
  const open = openAssignments(assignments);
  const dueSoon = open.filter((assignment) => isDueWithin(assignment, 7, today));
  const overdue = open.filter((assignment) => isOverdue(assignment, today)).sort(byDueThenPriority);
  const monthly = monthlySeries(assignments, 6, today);
  const completedThisMonth = completedIn(assignments, dates.month);
  const completedLastMonth = completedIn(assignments, dates.lastMonthToDate);
  const onTimeQuarter = overallOnTimeRate(assignments, dates.quarter);
  const onTimeLastQuarter = overallOnTimeRate(assignments, dates.lastQuarter);
  const teamHoursWeek = hoursIn(timeLogs, dates.week, employeeUids);
  const teamHoursLastWeek = hoursIn(timeLogs, dates.lastWeekToDate, employeeUids);
  const unpaid = assignments.filter(
    (assignment) =>
      assignment.status === "completed" &&
      assignment.fee &&
      assignment.paymentStatus !== "paid" &&
      assignment.paymentStatus !== "waived" &&
      assignment.fee - assignment.amountPaid > 0,
  );

  const kpis = {
    active: {
      value: open.length,
      lastMonth: openOn(assignments, dates.lastMonthToDate.to),
      // Open at the end of each of the last six months (today for this month).
      trend: monthly.map((row, i) => (i === monthly.length - 1 ? open.length : openOn(assignments, endOfMonth(`${row.month}-01`)))),
      byTrack: countByTrack(open),
    },
    dueSoon: { value: dueSoon.length, dueToday: dueSoon.filter((assignment) => assignment.dueDate === today).length },
    overdue: { value: overdue.length, oldestDays: overdue[0]?.dueDate ? daysBetween(overdue[0].dueDate, today) : 0 },
    completed: { value: completedThisMonth.length, lastMonth: completedLastMonth.length, trend: monthly.map((row) => row.completed) },
    onTime: {
      value: onTimeQuarter,
      lastQuarter: onTimeLastQuarter,
      trend: monthly.filter((row) => row.timed > 0).map((row) => Math.round((row.onTime / row.timed) * 100)),
    },
    hours: {
      value: teamHoursWeek,
      lastWeek: teamHoursLastWeek,
      target: sum(team.map((user) => user.targets.weeklyHours)),
      trend: weeklyHours(timeLogs, dates.sparkWeekStarts, employeeUids),
    },
    revenue: {
      value: sum(completedThisMonth.map((assignment) => assignment.fee ?? 0)),
      lastMonth: sum(completedLastMonth.map((assignment) => assignment.fee ?? 0)),
      trend: monthly.map((row) => row.revenue),
    },
    outstanding: { value: outstandingFees(assignments), count: unpaid.length },
  };

  /* ---------------------------------------------------------------- charts */
  const delivery = {
    rows: monthly.map<BarRow>((row) => ({
      label: formatMonthShort(row.month),
      sublabel: formatMonth(row.month),
      values: { academic: row.academic, corporate: row.corporate },
    })),
    totals: {
      created: sum(monthly.map((row) => row.created)),
      completed: sum(monthly.map((row) => row.completed)),
      onTime: sum(monthly.map((row) => row.timed)) ? sum(monthly.map((row) => row.onTime)) / sum(monthly.map((row) => row.timed)) : null,
      revenue: sum(monthly.map((row) => row.revenue)),
    },
  };

  const categories = countByCategory(assignments)
    .filter((row) => row.open + row.completed > 0)
    .sort((a, b) => b.open + b.completed - (a.open + a.completed) || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((row) => ({ id: row.id, name: row.name, track: row.track, open: row.open, completed: row.completed }));

  const teamUids = team.map((user) => user.uid);
  const teamHours = {
    series: team.map<BarSeries>((user) => ({ key: user.uid, label: user.displayName, slot: slotOf.get(user.uid) ?? 1 })),
    rows: hoursByDay(timeLogs, dates.fortnight, teamUids).map<BarRow>((row) => ({
      label: String(Number(row.date.slice(8))),
      sublabel: `${formatWeekdayShort(row.date)} ${formatDayMonth(row.date)}`,
      values: Object.fromEntries(teamUids.map((uid) => [uid, Number(row[uid] ?? 0)])),
    })),
    totals: team.map((user) => ({
      uid: user.uid,
      name: user.displayName,
      slot: slotOf.get(user.uid) ?? 1,
      hours: hoursIn(timeLogs, dates.fortnight, new Set([user.uid])),
      days: new Set(timeLogs.filter((log) => log.uid === user.uid && log.date >= dates.fortnight.from && log.hours > 0).map((log) => log.date)).size,
    })),
  };

  /* ---------------------------------------------------------------- team */
  const teamCards = team.map((user) => {
    const attendanceToday = attendance.find((record) => record.uid === user.uid && record.date === today) ?? null;
    return {
      person: {
        uid: user.uid,
        name: user.displayName,
        jobTitle: user.jobTitle,
        photoVersion: user.photoUpdatedAt,
        lastSeenAt: user.lastSeenAt,
        online: activeUids.has(user.uid),
      },
      slot: slotOf.get(user.uid) ?? employeeSlot(0),
      metrics: employeeMetrics(user, { assignments, timeLogs, reports, attendance }, dates.month, today),
      hoursThisWeek: hoursIn(timeLogs, dates.week, new Set([user.uid])),
      weeklyTarget: user.targets.weeklyHours,
      attendance: attendanceToday,
    };
  });

  /* ---------------------------------------------------------------- lists */
  const reviewQueue = open
    .filter((assignment) => assignment.status === "under_review")
    .sort((a, b) => (a.submittedAt ?? a.updatedAt).localeCompare(b.submittedAt ?? b.updatedAt));
  // Work already in the review queue is not repeated here.
  const followUp = open
    .filter((assignment) => assignment.status !== "under_review" && (assignment.status === "revision" || isOverdue(assignment, today)))
    .sort(byDueThenPriority);
  const horizon = addDays(today, 14);
  const upcoming = open
    .filter((assignment) => assignment.dueDate && assignment.dueDate >= today && assignment.dueDate <= horizon)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "") || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  const reportsAwaiting = reports.filter((report) => report.status === "submitted").sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const security = {
    enforced: access.enforce,
    pendingDevices: devices.filter((device) => device.status === "pending").length,
    failedToday: loginEvents.filter((event) => !event.success && toISODate(event.at) === today),
    signedInNow: [...activeUids].filter((uid) => employeeUids.has(uid)).length,
  };

  return {
    today,
    people,
    kpis,
    delivery,
    statusCounts: countByStatus(assignments),
    openByTrack: countByTrack(open),
    categories,
    teamHours,
    teamCards,
    hasEmployees: employees.length > 0,
    reviewQueue,
    followUp: followUp.slice(0, 6),
    followUpTotal: followUp.length,
    upcoming: upcoming.slice(0, 8),
    upcomingTotal: upcoming.length,
    activity,
    security,
    announcements,
    reportsAwaiting: reportsAwaiting.slice(0, 6),
    reportsAwaitingTotal: reportsAwaiting.length,
  };
}

export type AdminDashboardData = Awaited<ReturnType<typeof loadAdminDashboard>>;
