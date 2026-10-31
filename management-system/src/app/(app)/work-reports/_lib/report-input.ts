import "server-only";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listWorkReports, type WorkReportInput } from "@/lib/data/work-reports";
import { parseForm, workReportSchema } from "@/lib/validation";
import { REPORT_PERIOD_LABELS } from "@/lib/constants";
import { daysBetween, formatDate, todayISO } from "@/lib/format";
import { uniq } from "@/lib/utils";
import { MAX_SPAN_DAYS } from "@/components/work-reports/periods";
import type { ActionResult, Viewer } from "@/lib/types";

type Result = { ok: true; data: WorkReportInput } | { ok: false; result: ActionResult };

function invalid(field: string, message: string): Result {
  return { ok: false, result: { ok: false, message, fieldErrors: { [field]: [message] } } };
}

/** Report ids are Firestore document ids: short, no path separators. */
export function reportIdFrom(value: unknown) {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value) ? value : null;
}

/**
 * Validates a work report form for the viewer: the schema, a sensible span for
 * the kind of report, no duplicate for the same period, and only assignments
 * the viewer can see (ids from the form are never trusted as they are).
 */
export async function reportInputFrom(viewer: Viewer, formData: FormData, excludeId?: string): Promise<Result> {
  const parsed = parseForm(workReportSchema, formData, ["assignmentIds"]);
  if (!parsed.ok) return { ok: false, result: parsed.result };
  const input = parsed.data;

  if (input.periodStart > todayISO()) return invalid("periodStart", "The period cannot start in the future.");
  const span = daysBetween(input.periodStart, input.periodEnd) + 1;
  if (span > MAX_SPAN_DAYS[input.period]) {
    const message =
      input.period === "daily"
        ? "A daily report covers a single day. Choose the same start and end date."
        : `A ${input.period} report covers at most ${MAX_SPAN_DAYS[input.period]} days.`;
    return invalid("periodEnd", message);
  }

  const [assignments, mine] = await Promise.all([listAssignmentsFor(viewer), listWorkReports(viewer, { uid: viewer.uid })]);
  const duplicate = mine.find(
    (report) => report.uid === viewer.uid && report.id !== excludeId && report.period === input.period && report.periodStart === input.periodStart,
  );
  if (duplicate) {
    return invalid(
      "periodStart",
      `You already have a ${REPORT_PERIOD_LABELS[input.period].toLowerCase()} starting ${formatDate(input.periodStart)}. Edit that one instead.`,
    );
  }

  const visible = new Set(assignments.map((assignment) => assignment.id));
  const assignmentIds = uniq(input.assignmentIds.filter((id) => visible.has(id))).slice(0, 50);

  return {
    ok: true,
    data: {
      period: input.period,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      summary: input.summary,
      accomplishments: input.accomplishments,
      challenges: input.challenges,
      nextSteps: input.nextSteps,
      hours: input.hours,
      assignmentIds,
    },
  };
}
