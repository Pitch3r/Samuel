"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { createWorkReport } from "@/lib/data/work-reports";
import { actionError } from "@/lib/actions";
import type { ActionResult } from "@/lib/types";
import { reportInputFrom } from "../_lib/report-input";

/** Submits a new report for the viewer, then opens it. */
export async function createReportAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  let id: string;
  try {
    const input = await reportInputFrom(viewer, formData);
    if (!input.ok) return input.result;
    id = await createWorkReport(viewer, input.data);
  } catch (error) {
    return actionError(error);
  }
  redirect(`/work-reports/${id}?submitted=1`);
}
