"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/data/clients";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import { clientSchema, parseForm } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export async function createClientAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(clientSchema, formData);
  if (!parsed.ok) return parsed.result;
  let id: string;
  try {
    id = await createClient(parsed.data, viewer.uid);
    await logActivity(viewer, { action: "client.created", entityType: "client", entityId: id, summary: `Added the client ${parsed.data.name}` });
  } catch (error) {
    return actionError(error);
  }
  redirect(`/clients/${id}?created=1`);
}
