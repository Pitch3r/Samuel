"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAssignment } from "@/lib/data/assignments";
import { actionError } from "@/lib/actions";
import { assignmentSchema, parseForm } from "@/lib/validation";
import { buildAssignmentInput } from "../_lib/assignment-input";
import type { ActionResult } from "@/lib/types";

export async function createAssignmentAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(assignmentSchema, formData, ["assigneeIds"]);
  if (!parsed.ok) return parsed.result;

  let id: string;
  try {
    const built = await buildAssignmentInput(parsed.data);
    if (!built.ok) return built.result;
    ({ id } = await createAssignment(viewer, built.input));
  } catch (error) {
    return actionError(error);
  }
  redirect(`/assignments/${id}?created=1`);
}
