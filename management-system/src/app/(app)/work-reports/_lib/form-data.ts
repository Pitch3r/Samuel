import "server-only";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listTimeLogs } from "@/lib/data/time-logs";
import { STATUS_LABELS, isOpenStatus } from "@/lib/constants";
import { addDays, todayISO } from "@/lib/format";
import type { Viewer } from "@/lib/types";
import type { ReportFormAssignment, ReportFormLog } from "@/components/work-reports/report-form";

/**
 * What the report form needs: the viewer's assignments (open ones, plus any
 * already linked or closed in the last three months) and their own time
 * entries, so hours can be suggested for whatever dates are chosen.
 */
export async function loadReportFormData(viewer: Viewer, { from, linked = [] }: { from?: string; linked?: string[] } = {}) {
  const today = todayISO();
  const since = addDays(today, -100);
  const start = from && from < since ? from : since;
  const [assignments, logs] = await Promise.all([listAssignmentsFor(viewer), listTimeLogs(viewer, { uid: viewer.uid, from: start, to: today })]);

  const recent = addDays(today, -90);
  const mineOnly = viewer.isAdmin ? assignments.filter((assignment) => assignment.assigneeIds.includes(viewer.uid) || isOpenStatus(assignment.status)) : assignments;
  const options: ReportFormAssignment[] = mineOnly
    .filter(
      (assignment) =>
        isOpenStatus(assignment.status) || linked.includes(assignment.id) || (assignment.completedAt ?? assignment.updatedAt).slice(0, 10) >= recent,
    )
    .map((assignment) => ({
      id: assignment.id,
      ref: assignment.ref,
      title: assignment.title,
      status: STATUS_LABELS[assignment.status],
      open: isOpenStatus(assignment.status),
    }));
  const formLogs: ReportFormLog[] = logs.map((log) => ({ date: log.date, assignmentId: log.assignmentId, hours: log.hours }));
  return { today, assignments: options, logs: formLogs };
}
