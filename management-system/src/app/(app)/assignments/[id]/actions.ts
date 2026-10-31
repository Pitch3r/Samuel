"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth/session";
import {
  addComment,
  addMilestone,
  changeStatus,
  deleteAssignment,
  deleteFile,
  removeMilestone,
  reviewAssignment,
  setProgress,
  toggleMilestone,
  updatePayment,
} from "@/lib/data/assignments";
import { actionError } from "@/lib/actions";
import { STATUS_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import {
  commentSchema,
  milestoneSchema,
  parseForm,
  paymentSchema,
  progressSchema,
  reviewSchema,
  statusChangeSchema,
} from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/*
 * Actions for the assignment page. The ids come from hidden form fields; they
 * are only used to look records up. Every permission check happens in the
 * data layer against the signed-in viewer.
 */

type State = ActionResult | null;

const MISSING: ActionResult = { ok: false, message: "That record could not be found. Refresh the page and try again." };

/** A record id from the form: non-empty, short and without path separators. */
function idFrom(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/") ? value : null;
}

export async function updateProgressAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = idFrom(formData, "assignmentId");
  if (!id) return MISSING;
  const parsed = parseForm(progressSchema, formData);
  if (!parsed.ok) return parsed.result;
  try {
    await setProgress(viewer, id, parsed.data.progress, parsed.data.note);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: `Progress saved at ${parsed.data.progress}%.` };
}

export async function changeStatusAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = idFrom(formData, "assignmentId");
  if (!id) return MISSING;
  const parsed = parseForm(statusChangeSchema, formData);
  if (!parsed.ok) return parsed.result;
  try {
    await changeStatus(viewer, id, parsed.data.status, parsed.data.note);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  const to = parsed.data.status;
  return {
    ok: true,
    message:
      to === "under_review" && !viewer.isAdmin
        ? "Submitted for review. The administrator has been notified."
        : `Status changed to ${STATUS_LABELS[to].toLowerCase()}.`,
  };
}

export async function addCommentAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = idFrom(formData, "assignmentId");
  if (!id) return MISSING;
  const parsed = parseForm(commentSchema, formData);
  if (!parsed.ok) return parsed.result;
  try {
    await addComment(viewer, id, parsed.data.text);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Comment posted." };
}

export async function addMilestoneAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = idFrom(formData, "assignmentId");
  if (!id) return MISSING;
  const parsed = parseForm(milestoneSchema, formData);
  if (!parsed.ok) return parsed.result;
  try {
    await addMilestone(viewer, id, parsed.data.title, parsed.data.dueDate);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Milestone added." };
}

export async function toggleMilestoneAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = idFrom(formData, "assignmentId");
  const milestoneId = idFrom(formData, "milestoneId");
  if (!id || !milestoneId) return MISSING;
  try {
    await toggleMilestone(viewer, id, milestoneId);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true };
}

export async function removeMilestoneAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = idFrom(formData, "assignmentId");
  const milestoneId = idFrom(formData, "milestoneId");
  if (!id || !milestoneId) return MISSING;
  try {
    await removeMilestone(viewer, id, milestoneId);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Milestone removed." };
}

export async function reviewAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = idFrom(formData, "assignmentId");
  if (!id) return MISSING;
  // No star chosen means no "rating" field at all; the schema expects text, so treat it as blank.
  if (!formData.has("rating")) formData.set("rating", "");
  const parsed = parseForm(reviewSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { decision, rating, note } = parsed.data;
  // A rating feeds the quality part of the performance score; a revision needs to say what to change.
  if (decision === "approve" && rating === null) {
    return { ok: false, message: "Give the work a quality rating before approving it.", fieldErrors: { rating: ["Choose a rating from 1 to 5."] } };
  }
  if (decision === "revise" && !note) {
    return { ok: false, message: "Say what needs to change before returning the work.", fieldErrors: { note: ["Explain what needs to change."] } };
  }
  try {
    await reviewAssignment(viewer, id, { decision, rating, note });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return {
    ok: true,
    message: decision === "approve" ? "Approved and marked as completed. The team has been notified." : "Returned for revision. The team has been notified.",
  };
}

export async function updatePaymentAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = idFrom(formData, "assignmentId");
  if (!id) return MISSING;
  const parsed = parseForm(paymentSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { fee, paymentStatus, amountPaid } = parsed.data;
  if (fee !== null && amountPaid > fee) {
    return { ok: false, message: "The amount paid is more than the fee.", fieldErrors: { amountPaid: [`Enter no more than ${formatMoney(fee)}.`] } };
  }
  try {
    await updatePayment(viewer, id, { fee, paymentStatus, amountPaid });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Payment details saved." };
}

export async function deleteFileAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const id = idFrom(formData, "assignmentId");
  const fileId = idFrom(formData, "fileId");
  if (!id || !fileId) return MISSING;
  try {
    await deleteFile(viewer, id, fileId);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "File removed." };
}

export async function deleteAssignmentAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = idFrom(formData, "assignmentId");
  if (!id) return MISSING;
  try {
    await deleteAssignment(viewer, id);
  } catch (error) {
    return actionError(error);
  }
  redirect("/assignments?deleted=1");
}
