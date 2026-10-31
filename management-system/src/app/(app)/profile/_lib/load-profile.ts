import "server-only";
import { listAssignmentsForUser } from "@/lib/data/assignments";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listWorkReports } from "@/lib/data/work-reports";
import { listAttendance } from "@/lib/data/attendance";
import { getDevice } from "@/lib/data/devices";
import { isOpenStatus, PRIORITY_RANK } from "@/lib/constants";
import { startOfMonth, startOfQuarter, todayISO } from "@/lib/format";
import { employeeMetrics } from "@/lib/metrics";
import type { Assignment, SessionRecord, UserProfile, Viewer } from "@/lib/types";

/** Open work first by due date (undated last), then by priority. */
function byDue(a: Assignment, b: Assignment) {
  const dueA = a.dueDate ?? "9999-12-31";
  const dueB = b.dueDate ?? "9999-12-31";
  return dueA.localeCompare(dueB) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
}

/**
 * Everything a profile page shows about a person's work: their assignments,
 * reports, and performance this month and this quarter. The data functions
 * scope by the viewer, so an employee only ever loads their own records; the
 * administrator may load anyone's.
 */
export async function loadWorkProfile(viewer: Viewer, user: UserProfile) {
  const today = todayISO();
  const month = { from: startOfMonth(today), to: today };
  const quarter = { from: startOfQuarter(today), to: today };
  const [assignments, timeLogs, reports, attendance] = await Promise.all([
    listAssignmentsForUser(viewer, user.uid),
    listTimeLogs(viewer, { uid: user.uid, from: quarter.from, to: today }),
    listWorkReports(viewer, { uid: user.uid }),
    listAttendance(viewer, { uid: user.uid, from: quarter.from, to: today }),
  ]);
  const data = { assignments, timeLogs, reports, attendance };
  return {
    assignments,
    open: assignments.filter((assignment) => isOpenStatus(assignment.status)).sort(byDue),
    reports,
    month: employeeMetrics(user, data, month, today),
    quarter: employeeMetrics(user, data, quarter, today),
  };
}

/** Friendly names for the computers in a list of sessions. */
export async function deviceLabelsFor(sessions: SessionRecord[]) {
  const ids = [...new Set(sessions.map((session) => session.deviceId).filter((id): id is string => Boolean(id)))].slice(0, 20);
  const devices = await Promise.all(ids.map((id) => getDevice(id).catch(() => null)));
  return new Map(devices.filter((device) => device !== null).map((device) => [device.id, device.label]));
}
