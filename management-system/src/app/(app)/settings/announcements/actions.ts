"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createAnnouncement, deleteAnnouncement, listAnnouncements, updateAnnouncement } from "@/lib/data/announcements";
import { listEmployees } from "@/lib/data/users";
import { notify } from "@/lib/data/notifications";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import { announcementSchema, parseForm } from "@/lib/validation";
import { todayISO } from "@/lib/format";
import type { ActionResult } from "@/lib/types";

/*
 * Announcement actions, administrator only. Employees read current
 * announcements on their dashboard; the optional notification points there.
 */

type State = ActionResult | null;

const GONE: ActionResult = { ok: false, message: "That announcement could not be found. Refresh the page and try again." };

const idField = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/, "Not a valid id.");

const PAST_EXPIRY: ActionResult = {
  ok: false,
  message: "Please check the highlighted fields.",
  fieldErrors: { expiresAt: ["Choose today or a later date, or leave it empty to keep the announcement up."] },
};

async function findAnnouncement(id: string) {
  return (await listAnnouncements({ includeExpired: true })).find((item) => item.id === id) ?? null;
}

function excerpt(text: string, max = 140) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 3).trimEnd()}...` : flat;
}

export async function createAnnouncementAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(announcementSchema, formData);
  if (!parsed.ok) return parsed.result;
  const input = parsed.data;
  if (input.expiresAt && input.expiresAt < todayISO()) return PAST_EXPIRY;
  const tellStaff = formData.get("notify") === "on";
  let notified = 0;
  try {
    const id = await createAnnouncement(input, { uid: viewer.uid, name: viewer.name });
    if (tellStaff) {
      const staff = (await listEmployees({ includeSuspended: false })).map((employee) => employee.uid);
      await notify(staff, { title: `Announcement: ${input.title}`, body: excerpt(input.body), href: "/dashboard" });
      notified = staff.length;
    }
    await logActivity(viewer, {
      action: "announcement.created",
      entityType: "announcement",
      entityId: id,
      summary: `Posted the announcement "${input.title}"${input.pinned ? " (pinned)" : ""}`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return {
    ok: true,
    message: notified ? `Announcement posted and ${notified === 1 ? "one employee" : `${notified} employees`} notified.` : "Announcement posted.",
  };
}

const editSchema = announcementSchema.extend({ id: idField });

export async function updateAnnouncementAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(editSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { id, ...input } = parsed.data;
  try {
    const existing = await findAnnouncement(id);
    if (!existing) return GONE;
    // An expiry in the past is only accepted when it is unchanged, so old notices can still be edited.
    if (input.expiresAt && input.expiresAt < todayISO() && input.expiresAt !== existing.expiresAt) return PAST_EXPIRY;
    await updateAnnouncement(id, input);
    await logActivity(viewer, {
      action: "announcement.updated",
      entityType: "announcement",
      entityId: id,
      summary: `Edited the announcement "${input.title}"`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Announcement saved." };
}

const pinSchema = z.object({ id: idField, pinned: z.enum(["true", "false"]).transform((value) => value === "true") });

export async function setAnnouncementPinnedAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(pinSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { id, pinned } = parsed.data;
  try {
    const existing = await findAnnouncement(id);
    if (!existing) return GONE;
    await updateAnnouncement(id, { pinned });
    await logActivity(viewer, {
      action: pinned ? "announcement.pinned" : "announcement.unpinned",
      entityType: "announcement",
      entityId: id,
      summary: `${pinned ? "Pinned" : "Unpinned"} the announcement "${existing.title}"`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: pinned ? "Pinned to the top of employee dashboards." : "Unpinned." };
}

const deleteSchema = z.object({ id: idField });

export async function deleteAnnouncementAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(deleteSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { id } = parsed.data;
  try {
    const existing = await findAnnouncement(id);
    if (!existing) return GONE;
    await deleteAnnouncement(id);
    await logActivity(viewer, {
      action: "announcement.deleted",
      entityType: "announcement",
      entityId: id,
      summary: `Deleted the announcement "${existing.title}"`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Announcement deleted." };
}
