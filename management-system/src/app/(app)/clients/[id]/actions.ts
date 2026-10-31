"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { deleteClient, getClient } from "@/lib/data/clients";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import type { ActionResult } from "@/lib/types";

/** The client id from the form: non-empty, short and without path separators. */
function idFrom(formData: FormData) {
  const value = formData.get("id");
  return typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/") ? value : null;
}

/** Deletes the client record. Its assignments stay and keep the client's name as text. */
export async function deleteClientAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const id = idFrom(formData);
  if (!id) return { ok: false, message: "That client could not be found. Refresh the page and try again." };
  try {
    const client = await getClient(id);
    if (!client) return { ok: false, message: "That client has already been deleted." };
    await deleteClient(id);
    await logActivity(viewer, { action: "client.deleted", entityType: "client", entityId: id, summary: `Deleted the client ${client.name}` });
  } catch (error) {
    return actionError(error);
  }
  redirect("/clients?deleted=1");
}
