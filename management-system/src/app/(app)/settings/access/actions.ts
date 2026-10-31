"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { currentDeviceId, ensureDeviceId } from "@/lib/auth/sign-in";
import { getAccessSettings, saveAccessSettings } from "@/lib/data/settings";
import { deleteDevice, getDevice, recordDeviceSeen, updateDevice } from "@/lib/data/devices";
import { endAllSessionsFor, endSessionRecord, listOpenSessions } from "@/lib/data/sessions";
import { listEmployees, listUsers } from "@/lib/data/users";
import { notify } from "@/lib/data/notifications";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import { clientIpFrom } from "@/lib/request";
import { accessSettingsSchema, parseForm } from "@/lib/validation";
import { uniq } from "@/lib/utils";
import { describePolicyChange } from "@/components/settings/policy-text";
import { deviceDetailsFrom } from "./_lib/device-details";
import type { ActionResult, Device } from "@/lib/types";

/*
 * Office access actions. requireAdmin() is the authorisation for all of them.
 * Ids in the form only say which record to act on: each is checked to exist,
 * and employee lists are filtered against the real employee accounts.
 */

type State = ActionResult | null;

const GONE: ActionResult = { ok: false, message: "That computer is no longer on the list. Refresh the page and try again." };

const idField = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/, "Not a valid id.");
const labelField = z.string().trim().min(1, "Give this computer a name, for example Office PC 1.").max(60, "Keep the name under 60 characters.");
const assignedField = z.array(z.string().max(128)).default([]);

/** Keeps only uids that belong to employee accounts, with their names. */
async function employeesFrom(uids: string[]) {
  const wanted = new Set(uids);
  return (await listEmployees()).filter((employee) => wanted.has(employee.uid));
}

function whoMayUse(names: string[]) {
  return names.length ? `for ${names.join(", ")}` : "for any employee";
}

/** Ends open employee sessions on a computer, so a block takes effect at once. */
async function endEmployeeSessionsOn(deviceId: string, reason: string) {
  const open = (await listOpenSessions()).filter((session) => session.deviceId === deviceId && session.role === "employee");
  await Promise.all(open.map((session) => endSessionRecord(session.id, reason)));
  return open.length;
}

/* ------------------------------------------------------------------ policy */

export async function saveAccessPolicyAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(accessSettingsSchema, formData, ["days"]);
  if (!parsed.ok) return parsed.result;
  const input = parsed.data;
  const policy = {
    enforce: input.enforce,
    device: { enabled: input.deviceEnabled, mode: input.deviceMode, maxPerEmployee: input.maxPerEmployee },
    network: { enabled: input.networkEnabled, allowed: input.allowed },
    location: { enabled: input.locationEnabled, latitude: input.latitude, longitude: input.longitude, radiusMeters: input.radiusMeters },
    hours: { enabled: input.hoursEnabled, days: uniq(input.days).sort((a, b) => a - b), start: input.start, end: input.end },
    sessionHours: input.sessionHours,
  };
  try {
    const before = await getAccessSettings({ fresh: true });
    await saveAccessSettings(policy, viewer.uid);
    await logActivity(viewer, {
      action: "settings.access-updated",
      entityType: "settings",
      entityId: "access",
      summary: describePolicyChange(before, policy),
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return {
    ok: true,
    message: policy.enforce
      ? "Office access policy saved. It applies to employees from their next click."
      : "Saved. Office restrictions are switched off.",
  };
}

/* ------------------------------------------------------------------ computers */

const registerSchema = z.object({
  label: labelField,
  assignedUids: assignedField,
  client: z.string().max(2000).optional(),
});

/** Registers the computer the administrator is using as an approved office computer. */
export async function registerThisComputerAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(registerSchema, formData, ["assignedUids"]);
  if (!parsed.ok) return parsed.result;
  const { label, client } = parsed.data;
  try {
    const deviceId = (await currentDeviceId()) ?? (await ensureDeviceId());
    const employees = await employeesFrom(parsed.data.assignedUids);
    if (!(await getDevice(deviceId))) {
      const h = await headers();
      await recordDeviceSeen(
        deviceId,
        { ip: clientIpFrom(h), uid: viewer.uid, userName: viewer.name, details: deviceDetailsFrom(h.get("user-agent") ?? "", client) },
        { registeredVia: "admin", requestedBy: null, requestedByName: "" },
      );
    }
    await updateDevice(deviceId, {
      status: "approved",
      label,
      assignedUids: employees.map((employee) => employee.uid),
      approvedBy: viewer.uid,
      approvedAt: new Date().toISOString(),
      registeredVia: "admin",
    });
    await logActivity(viewer, {
      action: "device.registered",
      entityType: "device",
      entityId: deviceId,
      summary: `Registered "${label}" as an office computer ${whoMayUse(employees.map((employee) => employee.displayName))}`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: `${label} is now an approved office computer.` };
}

const deviceSchema = z.object({ deviceId: idField, label: labelField, assignedUids: assignedField });

export async function approveDeviceAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(deviceSchema, formData, ["assignedUids"]);
  if (!parsed.ok) return parsed.result;
  const { deviceId, label } = parsed.data;
  try {
    const device = await getDevice(deviceId);
    if (!device) return GONE;
    const employees = await employeesFrom(parsed.data.assignedUids);
    const assignedUids = employees.map((employee) => employee.uid);
    await updateDevice(deviceId, {
      status: "approved",
      label,
      assignedUids,
      approvedBy: viewer.uid,
      approvedAt: new Date().toISOString(),
      registeredVia: device.requestedBy ? "request" : "admin",
    });
    // Let the employee who asked know they can now sign in, if they may use it.
    if (device.requestedBy && (assignedUids.length === 0 || assignedUids.includes(device.requestedBy))) {
      await notify([device.requestedBy], {
        title: "Your office computer has been approved",
        body: `You can now sign in on ${label}.`,
        href: "/dashboard",
      });
    }
    await logActivity(viewer, {
      action: "device.approved",
      entityType: "device",
      entityId: deviceId,
      summary: `Approved "${label}" as an office computer ${whoMayUse(employees.map((employee) => employee.displayName))}`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: `${label} is approved.` };
}

export async function updateDeviceAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(deviceSchema, formData, ["assignedUids"]);
  if (!parsed.ok) return parsed.result;
  const { deviceId, label } = parsed.data;
  try {
    const device = await getDevice(deviceId);
    if (!device) return GONE;
    const employees = await employeesFrom(parsed.data.assignedUids);
    await updateDevice(deviceId, { label, assignedUids: employees.map((employee) => employee.uid) });
    const renamed = device.label !== label ? `Renamed "${device.label}" to "${label}"` : `Updated "${label}"`;
    await logActivity(viewer, {
      action: "device.updated",
      entityType: "device",
      entityId: deviceId,
      summary: `${renamed}, ${whoMayUse(employees.map((employee) => employee.displayName))}`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Computer updated." };
}

const statusSchema = z.object({ deviceId: idField, intent: z.enum(["block", "unblock"]) });

export async function setDeviceBlockedAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(statusSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { deviceId, intent } = parsed.data;
  let message: string;
  try {
    const device = await getDevice(deviceId);
    if (!device) return GONE;
    if (intent === "block") {
      await updateDevice(deviceId, { status: "blocked" });
      const ended = await endEmployeeSessionsOn(deviceId, "device-blocked");
      message = ended
        ? `${device.label} is blocked and ${ended === 1 ? "one employee was" : `${ended} employees were`} signed out.`
        : `${device.label} is blocked.`;
    } else {
      // A computer that was approved before the block goes back to approved; otherwise it waits for approval again.
      const status: Device["status"] = device.approvedAt ? "approved" : "pending";
      await updateDevice(deviceId, { status });
      message = status === "approved" ? `${device.label} is unblocked and approved again.` : `${device.label} is unblocked and waiting for approval.`;
    }
    await logActivity(viewer, {
      action: intent === "block" ? "device.blocked" : "device.unblocked",
      entityType: "device",
      entityId: deviceId,
      summary: `${intent === "block" ? "Blocked" : "Unblocked"} the computer "${device.label}"`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message };
}

const removeSchema = z.object({ deviceId: idField });

export async function removeDeviceAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(removeSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { deviceId } = parsed.data;
  try {
    const device = await getDevice(deviceId);
    if (!device) return GONE;
    await deleteDevice(deviceId);
    await logActivity(viewer, {
      action: "device.deleted",
      entityType: "device",
      entityId: deviceId,
      summary: `Removed the computer "${device.label}" from the office computer list`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Computer removed." };
}

/* ------------------------------------------------------------------ sessions */

const sessionSchema = z.object({ sessionId: idField });

export async function endSessionAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(sessionSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { sessionId } = parsed.data;
  if (sessionId === viewer.sessionId) return { ok: false, message: "This is your own session. Use Sign out instead." };
  try {
    const session = (await listOpenSessions()).find((item) => item.id === sessionId);
    if (!session) return { ok: false, message: "That session has already ended." };
    await endSessionRecord(session.id, "ended-by-admin");
    const person = (await listUsers()).find((user) => user.uid === session.uid);
    const name = person?.displayName ?? "a member of staff";
    await logActivity(viewer, {
      action: "session.ended",
      entityType: "session",
      entityId: session.id,
      summary: session.uid === viewer.uid ? "Ended one of their own sessions on another computer" : `Ended ${name}'s session and signed them out`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Session ended. They will be signed out on their next click." };
}

const personSchema = z.object({ uid: idField });

/** Signs one person out of every computer at once, for example at the end of the day or when a device is lost. */
export async function endPersonSessionsAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(personSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { uid } = parsed.data;
  if (uid === viewer.uid) return { ok: false, message: "This would sign you out too. End your other sessions one at a time instead." };
  let ended = 0;
  let name = "";
  try {
    const person = (await listUsers()).find((user) => user.uid === uid);
    if (!person) return { ok: false, message: "That member of staff could not be found." };
    name = person.displayName;
    ended = await endAllSessionsFor(uid, "ended-by-admin");
    await logActivity(viewer, {
      action: "session.ended-all",
      entityType: "user",
      entityId: uid,
      summary: `Signed ${name} out on every computer (${ended} ${ended === 1 ? "session" : "sessions"})`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: ended ? `${name} is signed out everywhere.` : `${name} had no open sessions.` };
}
