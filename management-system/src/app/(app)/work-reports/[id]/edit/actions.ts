"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { updateWorkReport } from "@/lib/data/work-reports";
import { actionError } from "@/lib/actions";
import type { ActionResult } from "@/lib/types";
import { reportIdFrom, reportInputFrom } from "../../_lib/report-input";

/**
 * Saves changes to a report. The id is bound by the page; the data layer
 * still checks that the viewer wrote it and that it has not been reviewed.
 */
export async function updateReportAction(reportId: string, _state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = reportIdFrom(reportId);
  if (!id) return { ok: false, message: "That report could not be found." };
  try {
    const input = await reportInputFrom(viewer, formData, id);
    if (!input.ok) return input.result;
    await updateWorkReport(viewer, id, input.data);
  } catch (error) {
    return actionError(error);
  }
  redirect(`/work-reports/${id}?updated=1`);
}
