"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getClient, updateClient } from "@/lib/data/clients";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import { clientSchema, parseForm } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/** The client id from the form: non-empty, short and without path separators. */
function idFrom(formData: FormData) {
  const value = formData.get("id");
  return typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/") ? value : null;
}

export async function updateClientAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = idFrom(formData);
  if (!id) return { ok: false, message: "That client could not be found. Refresh the page and try again." };
  const parsed = parseForm(clientSchema, formData);
  if (!parsed.ok) return parsed.result;
  try {
    const before = await getClient(id);
    if (!before) return { ok: false, message: "That client could not be found. It may have been deleted." };
    // Renaming also updates the client name shown on its assignments.
    await updateClient(id, parsed.data);
    await logActivity(viewer, {
      action: "client.updated",
      entityType: "client",
      entityId: id,
      summary: before.name === parsed.data.name ? `Updated the client ${parsed.data.name}` : `Renamed the client ${before.name} to ${parsed.data.name}`,
    });
  } catch (error) {
    return actionError(error);
  }
  redirect(`/clients/${id}?saved=1`);
}
