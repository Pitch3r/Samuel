"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createTimeLog, deleteTimeLog, listTimeLogs } from "@/lib/data/time-logs";
import { getUser } from "@/lib/data/users";
import { actionError } from "@/lib/actions";
import { parseForm, timeLogSchema } from "@/lib/validation";
import { formatDate, formatHours, todayISO } from "@/lib/format";
import { sum } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

/** Most a person can log on one calendar day, across all entries. */
const MAX_HOURS_PER_DAY = 24;

const idSchema = z.object({ id: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/, "That entry could not be found.") });

function fieldError(field: string, message: string): ActionResult {
  return { ok: false, message, fieldErrors: { [field]: [message] } };
}

/**
 * Logs hours for the viewer, or (administrator only) for a member of staff.
 * The data layer decides whose time it is and whether the assignment may be used.
 */
export async function logTimeAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const parsed = parseForm(timeLogSchema, formData);
  if (!parsed.ok) return parsed.result;
  const input = parsed.data;

  if (input.date > todayISO()) return fieldError("date", "You cannot log time for a date in the future.");
  if (Math.abs(input.hours * 4 - Math.round(input.hours * 4)) > 1e-9) return fieldError("hours", "Use steps of a quarter hour, such as 1.25 or 2.5.");

  // Employees always log their own time; the uid field only counts for the administrator.
  const uid = viewer.isAdmin && input.uid ? input.uid : viewer.uid;
  let name = viewer.name;
  try {
    if (uid !== viewer.uid) {
      const person = await getUser(uid);
      if (!person) return fieldError("uid", "That member of staff could not be found.");
      name = person.displayName;
    }
    const sameDay = await listTimeLogs(viewer, { uid, from: input.date, to: input.date });
    const already = sum(sameDay.map((log) => log.hours));
    if (already + input.hours > MAX_HOURS_PER_DAY) {
      return fieldError("hours", `${formatHours(already)} is already logged on ${formatDate(input.date)}. A day cannot exceed ${MAX_HOURS_PER_DAY} hours.`);
    }
    await createTimeLog(viewer, { assignmentId: input.assignmentId, date: input.date, hours: input.hours, note: input.note, uid });
  } catch (error) {
    return actionError(error);
  }

  refresh();
  const forWhom = uid === viewer.uid ? "" : ` for ${name}`;
  return { ok: true, message: `Logged ${formatHours(input.hours)}${forWhom} on ${formatDate(input.date)}.` };
}

/** Removes a time entry. Employees can only remove their own; the data layer checks. */
export async function deleteTimeLogAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const parsed = parseForm(idSchema, formData);
  if (!parsed.ok) return { ok: false, message: "That entry could not be found. Refresh the page and try again." };
  try {
    await deleteTimeLog(viewer, parsed.data.id);
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Time entry deleted." };
}
