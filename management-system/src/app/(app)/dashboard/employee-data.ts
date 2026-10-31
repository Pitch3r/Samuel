import "server-only";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listUsers } from "@/lib/data/users";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listWorkReports } from "@/lib/data/work-reports";
import { listAttendance } from "@/lib/data/attendance";
import { listAnnouncements } from "@/lib/data/announcements";
import { getDevice } from "@/lib/data/devices";
import { addDays, formatDayMonth, formatWeekdayShort, todayISO, weekdayOf } from "@/lib/format";
import { employeeMetrics, hoursByDay, isDueWithin, isOverdue, monthlySeries } from "@/lib/metrics";
import { employeeSlot } from "@/components/charts/scale";
import { eventsFor } from "@/components/calendar/model";
import type { FeedbackItem } from "@/components/dashboard/panels";
import type { PersonLite } from "@/components/assignments/assignment-list";
import type { BarRow } from "@/components/charts/bar-chart";
import type { Viewer } from "@/lib/types";
import { byDueThenPriority, completedIn, dashboardDates, hoursIn, openAssignments, weeklyHours } from "./shared";

/**
 * Everything an employee's dashboard shows. Every list comes from data
 * functions scoped to the viewer, so only their own work is ever loaded.
 */
export async function loadEmployeeDashboard(viewer: Viewer) {
  const today = todayISO();
  const dates = dashboardDates(today);
  const weekEnd = addDays(dates.weekStart, 6);

  const [assignments, users, timeLogs, reports, attendance, announcements, device] = await Promise.all([
    listAssignmentsFor(viewer),
    listUsers(),
    listTimeLogs(viewer, { from: dates.logsFrom, to: weekEnd }),
    listWorkReports(viewer),
    listAttendance(viewer, { uid: viewer.uid, from: dates.monthStart, to: today }),
    listAnnouncements(),
    viewer.deviceId ? getDevice(viewer.deviceId) : Promise.resolve(null),
  ]);

  // Names and photos only, for the avatars of colleagues who share an assignment.
  const people = new Map<string, PersonLite>(users.map((user) => [user.uid, { uid: user.uid, name: user.displayName, photoVersion: user.photoUpdatedAt }]));
  const employeeIndex = users.filter((user) => user.role === "employee").findIndex((user) => user.uid === viewer.uid);
  const slot = employeeSlot(Math.max(employeeIndex, 0));
  const me = new Set([viewer.uid]);
  const target = viewer.profile.targets.weeklyHours;

  const open = openAssignments(assignments).sort(byDueThenPriority);
  const overdue = open.filter((assignment) => isOverdue(assignment, today));
  const dueSoon = open.filter((assignment) => isDueWithin(assignment, 7, today));
  const completedThisMonth = completedIn(assignments, dates.month);
  const completedLastMonth = completedIn(assignments, dates.lastMonthToDate);
  const hoursWeek = hoursIn(timeLogs, dates.week, me);
  const hoursLastWeek = hoursIn(timeLogs, dates.lastWeekToDate, me);
  const metrics = employeeMetrics(viewer.profile, { assignments, timeLogs, reports, attendance }, dates.month, today);
  const attendanceToday = attendance.find((record) => record.date === today) ?? null;

  const kpis = {
    open: { value: open.length, inProgress: open.filter((assignment) => assignment.status === "in_progress").length },
    dueSoon: { value: dueSoon.length, dueToday: dueSoon.filter((assignment) => assignment.dueDate === today).length },
    overdue: { value: overdue.length },
    completed: {
      value: completedThisMonth.length,
      lastMonth: completedLastMonth.length,
      target: viewer.profile.targets.monthlyAssignments,
      trend: monthlySeries(assignments, 6, today).map((row) => row.completed),
    },
    hours: { value: hoursWeek, lastWeek: hoursLastWeek, target, trend: weeklyHours(timeLogs, dates.sparkWeekStarts, me) },
    score: metrics.score,
  };

  // Monday to Sunday of this week, one bar per day.
  const week = {
    start: dates.weekStart,
    end: weekEnd,
    rows: hoursByDay(timeLogs, { from: dates.weekStart, to: weekEnd }, [viewer.uid]).map<BarRow>((row) => ({
      label: formatWeekdayShort(row.date),
      sublabel: `${formatWeekdayShort(row.date)} ${formatDayMonth(row.date)}${row.date === today ? " (today)" : ""}`,
      values: { hours: Number(row[viewer.uid] ?? 0) },
    })),
    today: hoursIn(timeLogs, { from: today, to: today }, me),
    dailyTarget: Math.round((target / 5) * 4) / 4,
  };

  // Things that need the employee to act, shown above everything else.
  const needsAction = open.filter((assignment) => assignment.status === "revision" || assignment.status === "not_started");

  const reportThisWeek = reports.find((report) => report.periodStart <= weekEnd && report.periodEnd >= dates.weekStart) ?? null;
  // Friday onwards the weekly report is due, so the reminder becomes a warning.
  const reportDue = [0, 5, 6].includes(weekdayOf(today));

  const feedback: FeedbackItem[] = [
    ...reports
      .filter((report) => report.status === "reviewed" && (report.feedback || report.rating))
      .map<FeedbackItem>((report) => ({
        key: `r-${report.id}`,
        kind: "report",
        title: `Your ${report.period} report for ${formatDayMonth(report.periodStart)}`,
        note: report.feedback,
        rating: report.rating,
        at: report.reviewedAt ?? report.updatedAt,
        href: `/work-reports/${report.id}`,
        status: null,
      })),
    ...assignments
      .filter((assignment) => assignment.reviewNote && (assignment.status === "completed" || assignment.status === "revision"))
      .map<FeedbackItem>((assignment) => ({
        key: `a-${assignment.id}`,
        kind: "assignment",
        title: `${assignment.ref} ${assignment.title}`,
        note: assignment.reviewNote,
        rating: assignment.status === "completed" ? assignment.qualityRating : null,
        at: assignment.updatedAt,
        href: `/assignments/${assignment.id}`,
        status: assignment.status,
      })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 4);

  const horizon = addDays(today, 13);
  const agenda = eventsFor(assignments, today).filter((event) => !event.closed && (event.overdue || (event.date >= today && event.date <= horizon)));

  return {
    today,
    people,
    slot,
    kpis,
    metrics,
    open,
    needsAction,
    week,
    attendanceToday,
    computer: attendanceToday?.deviceLabel || (device?.status === "approved" ? device.label : ""),
    reportThisWeek,
    reportDue,
    feedback,
    agenda,
    announcements,
  };
}

export type EmployeeDashboardData = Awaited<ReturnType<typeof loadEmployeeDashboard>>;
