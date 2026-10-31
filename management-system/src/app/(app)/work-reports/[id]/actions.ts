"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import { deleteWorkReport, getWorkReport, reviewWorkReport } from "@/lib/data/work-reports";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import { parseForm, reportReviewSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";
import { reportIdFrom } from "../_lib/report-input";
import { rangeLabel } from "@/components/work-reports/periods";

/** Administrator feedback and an optional 1 to 5 rating. Marks the report reviewed and tells the author. */
export async function reviewReportAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = reportIdFrom(formData.get("id"));
  if (!id) return { ok: false, message: "That report could not be found." };
  const parsed = parseForm(reportReviewSchema, formData);
  if (!parsed.ok) return parsed.result;
  if (!parsed.data.feedback && parsed.data.rating === null) {
    return { ok: false, message: "Add some feedback or a rating.", fieldErrors: { feedback: ["Add some feedback or a rating before saving."] } };
  }
  try {
    await reviewWorkReport(viewer, id, { feedback: parsed.data.feedback, rating: parsed.data.rating });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Review saved. The author has been notified." };
}

/** Deletes a report: the author while it awaits review, or the administrator at any time. */
export async function deleteReportAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = reportIdFrom(formData.get("id"));
  if (!id) return { ok: false, message: "That report could not be found." };
  try {
    const report = await getWorkReport(viewer, id);
    if (!report) return { ok: false, message: "That report has already been deleted." };
    await deleteWorkReport(viewer, id);
    await logActivity(viewer, {
      action: "report.deleted",
      entityType: "report",
      entityId: id,
      summary: `Deleted ${report.uid === viewer.uid ? "their" : `${report.authorName}'s`} ${report.period} report for ${rangeLabel(report.periodStart, report.periodEnd)}`,
    });
  } catch (error) {
    return actionError(error);
  }
  redirect("/work-reports?deleted=1");
}
