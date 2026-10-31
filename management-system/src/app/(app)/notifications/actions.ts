"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/data/notifications";
import { actionError } from "@/lib/actions";
import { parseForm } from "@/lib/validation";
import { safeNextPath } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

const notificationSchema = z.object({
  id: z.string().trim().min(1).max(128),
  intent: z.enum(["open", "read"]).default("open"),
});

/**
 * Marks one of the viewer's notifications as read, then (for "open") follows
 * its link. The link comes from the stored notification, never from the form.
 */
export async function openNotificationAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const parsed = parseForm(notificationSchema, formData);
  if (!parsed.ok) return parsed.result;

  let href = "";
  try {
    const notification = (await listNotifications(viewer.uid, 1000)).find((item) => item.id === parsed.data.id);
    if (!notification) return { ok: false, message: "That notification could not be found." };
    if (!notification.read) await markNotificationRead(viewer.uid, notification.id);
    href = notification.href;
  } catch (error) {
    return actionError(error);
  }

  if (parsed.data.intent === "open" && href) redirect(safeNextPath(href, "/notifications"));
  refresh();
  return { ok: true };
}

export async function markAllReadAction(): Promise<ActionResult> {
  const viewer = await requireUser();
  try {
    await markAllNotificationsRead(viewer.uid);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "All notifications are marked as read." };
}
