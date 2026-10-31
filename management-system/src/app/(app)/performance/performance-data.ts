import "server-only";
import { listAllAssignments, listAssignmentsForUser } from "@/lib/data/assignments";
import { listEmployees } from "@/lib/data/users";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listWorkReports } from "@/lib/data/work-reports";
import { listAttendance } from "@/lib/data/attendance";
import { addMonths, endOfMonth, formatMonth, formatMonthShort, startOfMonth, todayISO } from "@/lib/format";
import { dayOf, employeeMetrics, inPeriod, wasOnTime, type EmployeeMetrics, type Period } from "@/lib/metrics";
import { previousPeriod } from "@/lib/period";
import { average, round, sum } from "@/lib/utils";
import { employeeSlot } from "@/components/charts/scale";
import type { SeriesSlot } from "@/components/charts/scale";
import type { Track } from "@/lib/constants";
import type { Assignment, AttendanceRecord, TimeLog, UserProfile, Viewer, WorkReport } from "@/lib/types";

const TREND_MONTHS = 6;

export type TrendPoint = { month: string; label: string; longLabel: string; score: number | null };

export type RecentDelivery = {
  id: string;
  ref: string;
  title: string;
  track: Track;
  categoryName: string;
  completedOn: string;
  dueDate: string | null;
  onTime: boolean | null;
  rating: number | null;
  inPeriod: boolean;
};

export type Scorecard = {
  person: {
    uid: string;
    name: string;
    jobTitle: string;
    photoVersion: string | null;
    status: UserProfile["status"];
    targets: UserProfile["targets"];
    slot: SeriesSlot;
  };
  metrics: EmployeeMetrics;
  previous: EmployeeMetrics;
  trend: TrendPoint[];
  recent: RecentDelivery[];
};

type Records = { assignments: Assignment[]; timeLogs: TimeLog[]; reports: WorkReport[]; attendance: AttendanceRecord[] };

/** The calendar months of the score trend, ending with the period's last month and never past today. */
function trendMonths(period: Period, today: string) {
  const last = startOfMonth(period.to);
  return Array.from({ length: TREND_MONTHS }, (_, i) => addMonths(last, i - (TREND_MONTHS - 1)))
    .filter((month) => month <= today)
    .map((month) => {
      const end = endOfMonth(month);
      return { month, period: { from: month, to: end < today ? end : today } };
    });
}

function buildScorecard(user: UserProfile, slot: SeriesSlot, records: Records, period: Period, today: string): Scorecard {
  const months = trendMonths(period, today);
  const recent = records.assignments
    .filter((assignment) => assignment.assigneeIds.includes(user.uid) && assignment.status === "completed")
    .map((assignment) => ({ assignment, completedOn: dayOf(assignment.completedAt) }))
    .filter((item): item is { assignment: Assignment; completedOn: string } => Boolean(item.completedOn && item.completedOn <= period.to))
    .sort((a, b) => b.completedOn.localeCompare(a.completedOn))
    .slice(0, 5)
    .map<RecentDelivery>(({ assignment, completedOn }) => ({
      id: assignment.id,
      ref: assignment.ref,
      title: assignment.title,
      track: assignment.track,
      categoryName: assignment.categoryName,
      completedOn,
      dueDate: assignment.dueDate,
      onTime: wasOnTime(assignment),
      rating: assignment.qualityRating,
      inPeriod: inPeriod(completedOn, period),
    }));

  return {
    person: {
      uid: user.uid,
      name: user.displayName,
      jobTitle: user.jobTitle,
      photoVersion: user.photoUpdatedAt,
      status: user.status,
      targets: user.targets,
      slot,
    },
    metrics: employeeMetrics(user, records, period, today),
    previous: employeeMetrics(user, records, previousPeriod(period), today),
    trend: months.map(({ month, period: monthPeriod }) => ({
      month,
      label: formatMonthShort(month),
      longLabel: formatMonth(month),
      score: employeeMetrics(user, records, monthPeriod, today).score,
    })),
    recent,
  };
}

/** First and last day of all the records a page needs: the period, the one before and the trend months. */
function dataWindow(period: Period, today: string) {
  const previous = previousPeriod(period);
  const trendFrom = addMonths(startOfMonth(period.to), -(TREND_MONTHS - 1));
  const trendTo = endOfMonth(period.to) < today ? endOfMonth(period.to) : today;
  return {
    from: [previous.from, trendFrom, period.from].sort()[0]!,
    to: [period.to, trendTo].sort().reverse()[0]!,
  };
}

/** Team totals for the administrator's summary tiles. */
function teamTotals(cards: Scorecard[], key: "metrics" | "previous") {
  const list = cards.map((card) => card[key]);
  const scores = list.map((m) => m.score).filter((score): score is number => score !== null);
  const timed = sum(list.map((m) => m.completedOnTime + m.completedLate));
  const averageScore = average(scores);
  return {
    score: averageScore === null ? null : Math.round(averageScore),
    completed: sum(list.map((m) => m.completedInPeriod)),
    onTimeRate: timed ? sum(list.map((m) => m.completedOnTime)) / timed : null,
    hours: round(sum(list.map((m) => m.hoursLogged)), 2),
    hoursTarget: round(sum(list.map((m) => m.hoursTarget)), 1),
  };
}

/**
 * Scorecards for every active employee (administrator), or for the viewer
 * alone (employee). Employees' records are read through the viewer-scoped
 * data functions, so nothing about colleagues is ever loaded for them.
 */
export async function loadPerformance(viewer: Viewer, period: Period) {
  const today = todayISO();
  const window = dataWindow(period, today);
  // Every employee, suspended included, so chart colours follow the same list as everywhere else.
  const employees = await listEmployees();
  const slotOf = new Map(employees.map((user, index) => [user.uid, employeeSlot(index)]));

  if (!viewer.isAdmin) {
    const [assignments, timeLogs, reports, attendance] = await Promise.all([
      listAssignmentsForUser(viewer, viewer.uid),
      listTimeLogs(viewer, window),
      listWorkReports(viewer),
      listAttendance(viewer, { uid: viewer.uid, ...window }),
    ]);
    const card = buildScorecard(viewer.profile, slotOf.get(viewer.uid) ?? employeeSlot(0), { assignments, timeLogs, reports, attendance }, period, today);
    return { mode: "self" as const, today, cards: [card] };
  }

  const [assignments, timeLogs, reports, attendance] = await Promise.all([
    listAllAssignments(viewer),
    listTimeLogs(viewer, window),
    listWorkReports(viewer),
    listAttendance(viewer, window),
  ]);
  const records = { assignments, timeLogs, reports, attendance };
  const cards = employees
    .filter((user) => user.status === "active")
    .map((user) => buildScorecard(user, slotOf.get(user.uid) ?? employeeSlot(0), records, period, today));
  return {
    mode: "team" as const,
    today,
    cards,
    hasEmployees: employees.length > 0,
    team: { current: teamTotals(cards, "metrics"), previous: teamTotals(cards, "previous") },
  };
}

export type PerformanceData = Awaited<ReturnType<typeof loadPerformance>>;
