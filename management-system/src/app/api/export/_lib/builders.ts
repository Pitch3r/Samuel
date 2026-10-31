import "server-only";
import { listAllAssignments, listAssignmentsFor } from "@/lib/data/assignments";
import { listEmployees, userNameMap } from "@/lib/data/users";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listWorkReports } from "@/lib/data/work-reports";
import { listAttendance } from "@/lib/data/attendance";
import { PAYMENT_LABELS, PRIORITY_LABELS, REPORT_PERIOD_LABELS, STATUS_LABELS, TRACK_LABELS } from "@/lib/constants";
import { formatTime, toISODate, todayISO } from "@/lib/format";
import { employeeMetrics, scoreGrade, wasOnTime, type Period } from "@/lib/metrics";
import { round } from "@/lib/utils";
import { activeDuring, balanceOf } from "@/components/reports/scope";
import type { ExportType } from "@/components/reports/exports";
import type { Viewer } from "@/lib/types";

export type Column = { key: string; label: string };
export type Sheet = { columns: Column[]; rows: Record<string, unknown>[] };

/** Calendar date in Lusaka, "YYYY-MM-DD", or blank. */
const day = (iso: string | null | undefined) => (iso ? toISODate(iso) : "");
/** "YYYY-MM-DD HH:MM" in Lusaka, or blank. */
const stamp = (iso: string | null | undefined) => (iso ? `${toISODate(iso)} ${formatTime(iso)}` : "");
const yesNo = (value: boolean | null) => (value === null ? "" : value ? "Yes" : "No");
const pct = (value: number | null) => (value === null ? "" : Math.round(value * 100));
const nameOf = (names: Map<string, string>, uid: string) => names.get(uid) ?? "Former staff member";

/* ------------------------------------------------------------------ assignments (administrator) */

/** Options an export may take; `uid` narrows the administrator's export to one person. */
export type SheetOptions = { uid?: string; allTime?: boolean };

async function assignmentsSheet(viewer: Viewer, period: Period, options: SheetOptions = {}): Promise<Sheet> {
  const [assignments, names] = await Promise.all([listAllAssignments(viewer), userNameMap()]);
  const rows = assignments
    .filter((assignment) => options.allTime || activeDuring(assignment, period))
    .sort((a, b) => a.ref.localeCompare(b.ref))
    .map((a) => ({
      ref: a.ref,
      title: a.title,
      track: TRACK_LABELS[a.track],
      category: a.categoryName,
      level: a.academicLevel ?? "",
      client: a.clientName,
      assignees: a.assigneeIds.map((uid) => nameOf(names, uid)),
      priority: PRIORITY_LABELS[a.priority],
      status: STATUS_LABELS[a.status],
      progress: a.progress,
      opened: day(a.createdAt),
      start: a.startDate ?? "",
      due: a.dueDate ?? "",
      completed: a.status === "completed" ? day(a.completedAt) : "",
      onTime: a.status === "completed" ? yesNo(wasOnTime(a)) : "",
      quality: a.qualityRating ?? "",
      estimated: a.estimatedHours ?? "",
      logged: round(a.loggedHours, 2),
      fee: a.fee ?? "",
      payment: PAYMENT_LABELS[a.paymentStatus],
      paid: a.paymentStatus === "paid" ? (a.fee ?? a.amountPaid) : a.amountPaid,
      balance: balanceOf(a),
    }));
  return {
    rows,
    columns: [
      { key: "ref", label: "Reference" },
      { key: "title", label: "Title" },
      { key: "track", label: "Track" },
      { key: "category", label: "Category" },
      { key: "level", label: "Academic level" },
      { key: "client", label: "Client" },
      { key: "assignees", label: "Assigned to" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
      { key: "progress", label: "Progress (%)" },
      { key: "opened", label: "Opened on" },
      { key: "start", label: "Start date" },
      { key: "due", label: "Due date" },
      { key: "completed", label: "Completed on" },
      { key: "onTime", label: "On time" },
      { key: "quality", label: "Quality rating (1 to 5)" },
      { key: "estimated", label: "Estimated hours" },
      { key: "logged", label: "Logged hours" },
      { key: "fee", label: "Fee (ZMW)" },
      { key: "payment", label: "Payment status" },
      { key: "paid", label: "Amount paid (ZMW)" },
      { key: "balance", label: "Balance owed (ZMW)" },
    ],
  };
}

/* ------------------------------------------------------------------ time logs (everyone; employees get their own) */

async function timeSheet(viewer: Viewer, period: Period, options: SheetOptions = {}): Promise<Sheet> {
  const [logs, names] = await Promise.all([listTimeLogs(viewer, { ...period, uid: options.uid }), userNameMap()]);
  const rows = logs
    .map((log) => ({
      date: log.date,
      person: nameOf(names, log.uid),
      ref: log.assignmentRef,
      assignment: log.assignmentTitle,
      hours: log.hours,
      note: log.note,
      logged: stamp(log.createdAt),
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.person.localeCompare(b.person));
  return {
    rows,
    columns: [
      { key: "date", label: "Date" },
      { key: "person", label: "Staff member" },
      { key: "ref", label: "Assignment reference" },
      { key: "assignment", label: "Assignment" },
      { key: "hours", label: "Hours" },
      { key: "note", label: "Note" },
      { key: "logged", label: "Logged at" },
    ],
  };
}

/* ------------------------------------------------------------------ work reports (everyone; employees get their own) */

async function reportsSheet(viewer: Viewer, period: Period, options: SheetOptions = {}): Promise<Sheet> {
  const [reports, assignments, names] = await Promise.all([listWorkReports(viewer, { uid: options.uid }), listAssignmentsFor(viewer), userNameMap()]);
  const refOf = new Map(assignments.map((assignment) => [assignment.id, assignment.ref]));
  const rows = reports
    // Reports whose period overlaps the export period.
    .filter((report) => report.periodStart <= period.to && report.periodEnd >= period.from)
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart) || a.authorName.localeCompare(b.authorName))
    .map((report) => ({
      type: REPORT_PERIOD_LABELS[report.period],
      from: report.periodStart,
      to: report.periodEnd,
      person: names.get(report.uid) ?? report.authorName,
      status: report.status === "reviewed" ? "Reviewed" : "Submitted",
      summary: report.summary,
      accomplishments: report.accomplishments,
      challenges: report.challenges,
      nextSteps: report.nextSteps,
      hours: report.hours ?? "",
      assignments: report.assignmentIds.map((id) => refOf.get(id)).filter(Boolean),
      rating: report.rating ?? "",
      feedback: report.feedback,
      submitted: day(report.createdAt),
      reviewed: day(report.reviewedAt),
      reviewer: report.reviewedBy ? nameOf(names, report.reviewedBy) : "",
    }));
  return {
    rows,
    columns: [
      { key: "type", label: "Report" },
      { key: "from", label: "Period start" },
      { key: "to", label: "Period end" },
      { key: "person", label: "Staff member" },
      { key: "status", label: "Status" },
      { key: "summary", label: "Summary" },
      { key: "accomplishments", label: "Accomplishments" },
      { key: "challenges", label: "Challenges" },
      { key: "nextSteps", label: "Next steps" },
      { key: "hours", label: "Hours reported" },
      { key: "assignments", label: "Assignments" },
      { key: "rating", label: "Rating (1 to 5)" },
      { key: "feedback", label: "Feedback" },
      { key: "submitted", label: "Submitted on" },
      { key: "reviewed", label: "Reviewed on" },
      { key: "reviewer", label: "Reviewed by" },
    ],
  };
}

/* ------------------------------------------------------------------ attendance (everyone; employees get their own) */

async function attendanceSheet(viewer: Viewer, period: Period, options: SheetOptions = {}): Promise<Sheet> {
  const [records, names] = await Promise.all([
    // The attendance reader is not viewer-scoped, so an employee's own uid is passed explicitly.
    listAttendance(viewer, { ...period, uid: options.uid }),
    userNameMap(),
  ]);
  const rows = records
    .map((record) => {
      const end = record.lastSignOutAt ?? record.lastSeenAt;
      const onSite = record.firstSignInAt && end ? Math.max(new Date(end).getTime() - new Date(record.firstSignInAt).getTime(), 0) / 3_600_000 : null;
      return {
        date: record.date,
        person: nameOf(names, record.uid),
        first: formatTime(record.firstSignInAt),
        last: formatTime(record.lastSeenAt),
        out: formatTime(record.lastSignOutAt),
        onSite: onSite === null ? "" : round(onSite, 1),
        signIns: record.signIns ?? "",
        computer: record.deviceLabel ?? "",
        ip: record.ip ?? "",
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.person.localeCompare(b.person));
  return {
    rows,
    columns: [
      { key: "date", label: "Date" },
      { key: "person", label: "Staff member" },
      { key: "first", label: "First sign-in" },
      { key: "last", label: "Last seen" },
      { key: "out", label: "Signed out" },
      { key: "onSite", label: "Time signed in (hours)" },
      { key: "signIns", label: "Sign-ins" },
      { key: "computer", label: "Computer" },
      { key: "ip", label: "IP address" },
    ],
  };
}

/* ------------------------------------------------------------------ performance (administrator) */

async function performanceSheet(viewer: Viewer, period: Period): Promise<Sheet> {
  const today = todayISO();
  const [employees, assignments, timeLogs, reports, attendance] = await Promise.all([
    listEmployees({ includeSuspended: false }),
    listAllAssignments(viewer),
    listTimeLogs(viewer, period),
    listWorkReports(viewer),
    listAttendance(viewer, period),
  ]);
  const rows = employees.map((user) => {
    const m = employeeMetrics(user, { assignments, timeLogs, reports, attendance }, period, today);
    return {
      person: user.displayName,
      staffNumber: user.staffNumber,
      jobTitle: user.jobTitle,
      from: period.from,
      to: period.to,
      score: m.score ?? "",
      grade: scoreGrade(m.score).label,
      onTimePart: pct(m.parts.onTime),
      qualityPart: pct(m.parts.quality),
      throughputPart: pct(m.parts.throughput),
      reportingPart: pct(m.parts.reporting),
      completed: m.completedInPeriod,
      completedTarget: m.completedTarget,
      onTime: m.completedOnTime,
      late: m.completedLate,
      avgQuality: m.avgQuality ?? "",
      rated: m.ratedCount,
      turnaround: m.avgTurnaroundDays ?? "",
      hours: m.hoursLogged,
      hoursTarget: m.hoursTarget,
      weeksCovered: m.reportWeeksCovered,
      weeksExpected: m.reportWeeksExpected,
      attendanceDays: m.attendanceDays,
      workingDays: m.workingDays,
      open: m.activeCount,
      overdue: m.overdueCount,
      revenue: m.revenue,
    };
  });
  return {
    rows,
    columns: [
      { key: "person", label: "Staff member" },
      { key: "staffNumber", label: "Staff number" },
      { key: "jobTitle", label: "Job title" },
      { key: "from", label: "Period start" },
      { key: "to", label: "Period end" },
      { key: "score", label: "Score (0 to 100)" },
      { key: "grade", label: "Grade" },
      { key: "onTimePart", label: "On-time delivery (%)" },
      { key: "qualityPart", label: "Quality (%)" },
      { key: "throughputPart", label: "Throughput (%)" },
      { key: "reportingPart", label: "Reporting coverage (%)" },
      { key: "completed", label: "Completed" },
      { key: "completedTarget", label: "Completion target" },
      { key: "onTime", label: "Completed on time" },
      { key: "late", label: "Completed late" },
      { key: "avgQuality", label: "Average quality (1 to 5)" },
      { key: "rated", label: "Ratings" },
      { key: "turnaround", label: "Average turnaround (days)" },
      { key: "hours", label: "Hours logged" },
      { key: "hoursTarget", label: "Hours target" },
      { key: "weeksCovered", label: "Weeks with a report" },
      { key: "weeksExpected", label: "Working weeks" },
      { key: "attendanceDays", label: "Days in the office" },
      { key: "workingDays", label: "Working days" },
      { key: "open", label: "Open assignments today" },
      { key: "overdue", label: "Overdue today" },
      { key: "revenue", label: "Fees on completed work (ZMW)" },
    ],
  };
}

export const SHEETS: Record<ExportType, (viewer: Viewer, period: Period, options?: SheetOptions) => Promise<Sheet>> = {
  assignments: assignmentsSheet,
  time: timeSheet,
  reports: reportsSheet,
  attendance: attendanceSheet,
  performance: performanceSheet,
};
