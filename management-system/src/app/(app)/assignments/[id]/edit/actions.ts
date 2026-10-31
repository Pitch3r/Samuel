"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAssignmentFor, updateAssignment } from "@/lib/data/assignments";
import { actionError } from "@/lib/actions";
import { assignmentSchema, parseForm } from "@/lib/validation";
import { buildAssignmentInput } from "../../_lib/assignment-input";
import type { ActionResult } from "@/lib/types";

export async function updateAssignmentAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = String(formData.get("assignmentId") ?? "").slice(0, 128);
  const parsed = parseForm(assignmentSchema, formData, ["assigneeIds"]);
  if (!parsed.ok) return parsed.result;

  try {
    const existing = await getAssignmentFor(viewer, id);
    if (!existing) return { ok: false, message: "That assignment could not be found. It may have been deleted." };
    const built = await buildAssignmentInput(parsed.data, existing);
    if (!built.ok) return built.result;
    // Milestones are managed on the assignment page once it exists.
    const input = { ...built.input };
    delete input.milestones;
    await updateAssignment(viewer, id, input);
  } catch (error) {
    return actionError(error);
  }
  redirect(`/assignments/${id}?saved=1`);
}
