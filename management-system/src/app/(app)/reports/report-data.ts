import "server-only";
import { listAllAssignments } from "@/lib/data/assignments";
import { listUsers } from "@/lib/data/users";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listWorkReports } from "@/lib/data/work-reports";
import { listAttendance } from "@/lib/data/attendance";
import { listClients } from "@/lib/data/clients";
import {
  ACADEMIC_LEVELS,
  OPEN_STATUSES,
  PAYMENT_STATUSES,
  PRIORITIES,
  TRACKS,
  isOpenStatus,
  type Priority,
  type Track,
} from "@/lib/constants";
import { formatMonth, formatMonthShort, todayISO } from "@/lib/format";
import { countByStatus, dayOf, employeeMetrics, isDueWithin, isOverdue, monthlySeries, type Period } from "@/lib/metrics";
import { previousPeriod } from "@/lib/period";
import { sum } from "@/lib/utils";
import { activeDuring, balanceOf, completedIn, createdIn, isOutstanding, summarise } from "@/components/reports/scope";
import { employeeSlot } from "@/components/charts/scale";
import type { BarRow } from "@/components/charts/bar-chart";
import type { CategoryRow } from "@/components/reports/categories";
import type { LevelRow, TrackRow } from "@/components/reports/tracks";
import type { ClientRow, OutstandingRow } from "@/components/reports/clients";
import type { TeamRow } from "@/components/reports/team";
import type { PaymentRow } from "@/components/reports/payments";
import type { Assignment, TimeLog, Viewer } from "@/lib/types";

export type TrendMonths = 6 | 12;

/** Groups assignments by client, keeping work with no client record under its typed name. */
function clientKey(assignment: Assignment) {
  return assignment.clientId ?? `name:${assignment.clientName.trim().toLowerCase() || "none"}`;
}

/** Hours logged in the period against assignments on each track (general office time is left out). */
function hoursByTrack(timeLogs: TimeLog[], assignments: Assignment[], period: Period) {
  const trackOf = new Map(assignments.map((assignment) => [assignment.id, assignment.track]));
  const hours: Record<Track, number> = { corporate: 0, academic: 0 };
  for (const log of timeLogs) {
    if (log.date < period.from || log.date > period.to || !log.assignmentId) continue;
    const track = trackOf.get(log.assignmentId);
    if (track) hours[track] += log.hours;
  }
  return hours;
}

/**
 * Everything the management report shows for one period, loaded in a single
 * parallel pass through the permission-checked data layer (administrator
 * only) and reduced in memory.
 */
export async function loadManagementReport(viewer: Viewer, period: Period, trendMonths: TrendMonths) {
  const today = todayISO();
  const previous = previousPeriod(period);

  const [assignments, users, timeLogs, reports, attendance, clients] = await Promise.all([
    listAllAssignments(viewer),
    listUsers(),
    listTimeLogs(viewer, { from: previous.from, to: period.to }),
    listWorkReports(viewer),
    listAttendance(viewer, { from: period.from, to: period.to }),
    listClients(),
  ]);

  /* ---------------------------------------------------------------- summary */
  const current = summarise(assignments, timeLogs, period);
  const before = summarise(assignments, timeLogs, previous);
  const scope = assignments.filter((assignment) => activeDuring(assignment, period));
  const completed = assignments.filter((assignment) => completedIn(assignment, period));
  const outstandingFromPeriod = sum(completed.filter(isOutstanding).map(balanceOf));
  const outstandingCount = assignments.filter(isOutstanding).length;

  /* ---------------------------------------------------------------- delivery trend */
  const monthly = monthlySeries(assignments, trendMonths, period.to);
  const delivery = {
    rows: monthly.map<BarRow>((row) => ({
      label: formatMonthShort(row.month),
      sublabel: formatMonth(row.month),
      values: { academic: row.academic, corporate: row.corporate },
    })),
    onTime: monthly
      .filter((row) => row.timed > 0)
      .map((row) => ({ label: formatMonthShort(row.month), value: Math.round((row.onTime / row.timed) * 100) })),
    table: monthly.map((row) => ({
      month: row.month,
      label: formatMonth(row.month),
      created: row.created,
      corporate: row.corporate,
      academic: row.academic,
      completed: row.completed,
      onTimeRate: row.timed ? row.onTime / row.timed : null,
      onTime: row.onTime,
      timed: row.timed,
      revenue: row.revenue,
    })),
  };

  /* ---------------------------------------------------------------- workload (today) */
  const open = assignments.filter((assignment) => isOpenStatus(assignment.status));
  const statusCounts = countByStatus(open);
  const priorityCounts = Object.fromEntries(PRIORITIES.map((priority) => [priority, 0])) as Record<Priority, number>;
  for (const assignment of open) priorityCounts[assignment.priority] += 1;
  const workload = {
    total: open.length,
    statusCounts,
    priorityCounts,
    overdue: open.filter((assignment) => isOverdue(assignment, today)).length,
    dueSoon: open.filter((assignment) => isDueWithin(assignment, 7, today)).length,
    unassigned: open.filter((assignment) => assignment.assigneeIds.length === 0).length,
    openByTrack: Object.fromEntries(TRACKS.map((track) => [track, open.filter((assignment) => assignment.track === track).length])) as Record<Track, number>,
    statuses: OPEN_STATUSES,
  };

  /* ---------------------------------------------------------------- categories */
  const categoryMap = new Map<string, CategoryRow>();
  for (const assignment of scope) {
    const row = categoryMap.get(assignment.categoryId) ?? {
      id: assignment.categoryId,
      name: assignment.categoryName || "Uncategorised",
      track: assignment.track,
      active: 0,
      created: 0,
      completed: 0,
      openNow: 0,
      revenue: 0,
    };
    row.active += 1;
    if (createdIn(assignment, period)) row.created += 1;
    if (completedIn(assignment, period)) {
      row.completed += 1;
      row.revenue += assignment.fee ?? 0;
    }
    if (isOpenStatus(assignment.status)) row.openNow += 1;
    categoryMap.set(assignment.categoryId, row);
  }
  const categories = [...categoryMap.values()].sort((a, b) => b.active - a.active || b.revenue - a.revenue || a.name.localeCompare(b.name));

  /* ---------------------------------------------------------------- tracks */
  const trackHours = hoursByTrack(timeLogs, assignments, period);
  const tracks: TrackRow[] = TRACKS.map((track) => {
    const ofTrack = assignments.filter((assignment) => assignment.track === track);
    const summary = summarise(ofTrack, [], period);
    return { ...summary, hours: Math.round(trackHours[track] * 100) / 100, track, share: current.revenue ? summary.revenue / current.revenue : 0 };
  });
  const academicScope = scope.filter((assignment) => assignment.track === "academic");
  const levels: LevelRow[] = [...ACADEMIC_LEVELS, "Not recorded" as const]
    .map((level) => {
      const ofLevel = academicScope.filter((assignment) => (assignment.academicLevel ?? "Not recorded") === level);
      const done = ofLevel.filter((assignment) => completedIn(assignment, period));
      return { level, active: ofLevel.length, completed: done.length, revenue: sum(done.map((assignment) => assignment.fee ?? 0)) };
    })
    .filter((row) => row.active > 0);

  /* ---------------------------------------------------------------- clients */
  const clientInfo = new Map(clients.map((client) => [client.id, client]));
  const clientMap = new Map<string, ClientRow>();
  for (const assignment of scope) {
    const key = clientKey(assignment);
    const info = assignment.clientId ? clientInfo.get(assignment.clientId) : undefined;
    const row = clientMap.get(key) ?? {
      key,
      id: info ? info.id : null,
      name: info?.name ?? (assignment.clientName || "No client recorded"),
      type: info?.type ?? null,
      active: 0,
      completed: 0,
      revenue: 0,
      billed: 0,
    };
    row.active += 1;
    if (completedIn(assignment, period)) {
      row.completed += 1;
      row.revenue += assignment.fee ?? 0;
    }
    row.billed += assignment.fee ?? 0;
    clientMap.set(key, row);
  }
  const topClients = [...clientMap.values()].sort((a, b) => b.revenue - a.revenue || b.active - a.active || a.name.localeCompare(b.name));

  const owedMap = new Map<string, OutstandingRow>();
  for (const assignment of assignments.filter(isOutstanding)) {
    const key = clientKey(assignment);
    const info = assignment.clientId ? clientInfo.get(assignment.clientId) : undefined;
    const row = owedMap.get(key) ?? { key, id: info ? info.id : null, name: info?.name ?? (assignment.clientName || "No client recorded"), count: 0, balance: 0, oldest: null };
    row.count += 1;
    row.balance += balanceOf(assignment);
    const done = dayOf(assignment.completedAt);
    if (done && (!row.oldest || done < row.oldest)) row.oldest = done;
    owedMap.set(key, row);
  }
  const outstandingByClient = [...owedMap.values()].sort((a, b) => b.balance - a.balance);

  /* ---------------------------------------------------------------- team */
  const employees = users.filter((user) => user.role === "employee");
  const team: TeamRow[] = employees
    .map((user, index) => ({ user, slot: employeeSlot(index) }))
    .filter(({ user }) => user.status === "active")
    .map(({ user, slot }) => ({
      uid: user.uid,
      name: user.displayName,
      jobTitle: user.jobTitle,
      photoVersion: user.photoUpdatedAt,
      slot,
      metrics: employeeMetrics(user, { assignments, timeLogs, reports, attendance }, period, today),
    }));

  /* ---------------------------------------------------------------- payments */
  const billable = scope.filter((assignment) => (assignment.fee ?? 0) > 0);
  const payments: PaymentRow[] = PAYMENT_STATUSES.map((status) => {
    const rows = billable.filter((assignment) => assignment.paymentStatus === status);
    return {
      status,
      count: rows.length,
      fees: sum(rows.map((assignment) => assignment.fee ?? 0)),
      paid: sum(rows.map((assignment) => (status === "paid" ? (assignment.fee ?? 0) : (assignment.amountPaid ?? 0)))),
      balance: sum(rows.map(balanceOf)),
    };
  });

  return {
    today,
    period,
    previous,
    current,
    before,
    outstanding: { total: current.outstanding, count: outstandingCount, fromPeriod: outstandingFromPeriod },
    scopeCount: scope.length,
    delivery,
    workload,
    categories,
    tracks,
    levels,
    topClients,
    outstandingByClient,
    team,
    hasEmployees: employees.length > 0,
    payments,
    billableCount: billable.length,
  };
}

export type ManagementReport = Awaited<ReturnType<typeof loadManagementReport>>;
