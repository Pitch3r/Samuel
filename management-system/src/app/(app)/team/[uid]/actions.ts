"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { changeEmail, countAdmins, deleteAccount, requireUserRecord, setPassword, setUserStatus, updateProfile } from "@/lib/data/users";
import { endAllSessionsFor } from "@/lib/data/sessions";
import { unbindEmployee } from "@/lib/data/devices";
import { logActivity } from "@/lib/data/activity";
import { bucket } from "@/lib/firebase/admin";
import { actionError } from "@/lib/actions";
import { USER_STATUSES } from "@/lib/constants";
import { adminSetPasswordSchema, emailField, parseForm, staffProfileSchema } from "@/lib/validation";
import { plural } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

/*
 * Administrator actions on a staff profile. requireAdmin() is the
 * authorisation; the uid in the form only says which person to act on, and
 * is checked to exist. Actions that would lock the administrator out (on
 * their own account) are refused here as well as hidden in the page.
 */

type State = ActionResult | null;

const MISSING: ActionResult = { ok: false, message: "That member of staff could not be found. Refresh the page and try again." };
const OWN_ACCOUNT: ActionResult = { ok: false, message: "You cannot do that to your own account here. Use My profile instead." };

/** The target uid from the form: non-empty, short and without path separators. */
function uidFrom(formData: FormData) {
  const value = formData.get("uid");
  return typeof value === "string" && value.length > 0 && value.length <= 128 && !value.includes("/") ? value : null;
}

const emailSchema = z.object({ email: emailField });
const statusSchema = z.object({ status: z.enum(USER_STATUSES) });

export async function updateStaffProfileAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const uid = uidFrom(formData);
  if (!uid) return MISSING;
  const parsed = parseForm(staffProfileSchema, formData);
  if (!parsed.ok) return parsed.result;
  const input = parsed.data;
  try {
    const before = await requireUserRecord(uid);
    await updateProfile(uid, {
      displayName: input.displayName,
      jobTitle: input.jobTitle,
      department: input.department,
      staffNumber: input.staffNumber,
      employmentType: input.employmentType,
      startDate: input.startDate,
      phone: input.phone,
      location: input.location,
      bio: input.bio,
      specialisations: input.specialisations,
      qualifications: input.qualifications,
      emergencyContact: { name: input.emergencyName, phone: input.emergencyPhone, relationship: input.emergencyRelationship },
      targets: { monthlyAssignments: input.monthlyAssignments, weeklyHours: input.weeklyHours },
    });
    await logActivity(viewer, {
      action: "user.updated",
      entityType: "user",
      entityId: uid,
      summary: uid === viewer.uid ? "Updated their own staff profile" : `Updated the staff profile of ${before.displayName}`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Profile saved." };
}

export async function changeEmailAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const uid = uidFrom(formData);
  if (!uid) return MISSING;
  const parsed = parseForm(emailSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { email } = parsed.data;
  try {
    const user = await requireUserRecord(uid);
    if (user.email === email) return { ok: true, message: "That is already the sign-in email." };
    await changeEmail(uid, email);
    await logActivity(viewer, {
      action: "user.email-changed",
      entityType: "user",
      entityId: uid,
      summary: `Changed the sign-in email of ${user.displayName} from ${user.email} to ${email}`,
    });
  } catch (error) {
    const result = actionError(error);
    return !result.ok && result.message.includes("email") ? { ...result, fieldErrors: { email: [result.message] } } : result;
  }
  refresh();
  return { ok: true, message: `Sign-in email changed to ${email}.` };
}

export async function resetPasswordAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const uid = uidFrom(formData);
  if (!uid) return MISSING;
  if (uid === viewer.uid) return OWN_ACCOUNT;
  const parsed = parseForm(adminSetPasswordSchema, formData);
  if (!parsed.ok) return parsed.result;
  let name: string;
  try {
    const user = await requireUserRecord(uid);
    name = user.displayName;
    await setPassword(uid, parsed.data.password);
    await endAllSessionsFor(uid, "password-reset");
    await logActivity(viewer, { action: "user.password-reset", entityType: "user", entityId: uid, summary: `Set a new password for ${name}` });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: `New password set. ${name} has been signed out everywhere; hand the new password over in person.` };
}

export async function setStatusAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const uid = uidFrom(formData);
  if (!uid) return MISSING;
  if (uid === viewer.uid) return OWN_ACCOUNT;
  const parsed = parseForm(statusSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { status } = parsed.data;
  let name: string;
  try {
    const user = await requireUserRecord(uid);
    name = user.displayName;
    await setUserStatus(uid, status);
    if (status === "suspended") await endAllSessionsFor(uid, "suspended");
    await logActivity(viewer, {
      action: status === "suspended" ? "user.suspended" : "user.reactivated",
      entityType: "user",
      entityId: uid,
      summary: status === "suspended" ? `Suspended the account of ${name}` : `Reactivated the account of ${name}`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return {
    ok: true,
    message: status === "suspended" ? `${name} has been suspended and signed out.` : `${name} can sign in again.`,
  };
}

export async function endSessionsAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const uid = uidFrom(formData);
  if (!uid) return MISSING;
  if (uid === viewer.uid) return OWN_ACCOUNT;
  let ended: number;
  let name: string;
  try {
    const user = await requireUserRecord(uid);
    name = user.displayName;
    ended = await endAllSessionsFor(uid, "ended-by-admin");
    await logActivity(viewer, {
      action: "user.sessions-ended",
      entityType: "user",
      entityId: uid,
      summary: `Signed ${name} out everywhere (${plural(ended, "session")})`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: ended ? `${name} has been signed out of ${plural(ended, "session")}.` : `${name} had no open sessions.` };
}

export async function unbindDevicesAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const uid = uidFrom(formData);
  if (!uid) return MISSING;
  let name: string;
  try {
    const user = await requireUserRecord(uid);
    if (user.role === "admin") return { ok: false, message: "The administrator is never tied to an office computer." };
    name = user.displayName;
    await unbindEmployee(uid);
    await logActivity(viewer, { action: "user.devices-unbound", entityType: "user", entityId: uid, summary: `Unlocked the office computer binding of ${name}` });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: `${name} is no longer tied to an office computer.` };
}

export async function deleteAccountAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const uid = uidFrom(formData);
  if (!uid) return MISSING;
  if (uid === viewer.uid) return { ok: false, message: "You cannot delete your own account." };
  try {
    const user = await requireUserRecord(uid);
    if (user.role === "admin" && (await countAdmins()) <= 1) {
      return { ok: false, message: "This is the last administrator account, so it cannot be deleted." };
    }
    await endAllSessionsFor(uid, "account-deleted");
    // Free any office computer they were bound to, so it can be registered to someone else.
    await unbindEmployee(uid);
    await deleteAccount(uid);
    await bucket()
      .deleteFiles({ prefix: `profiles/${uid}/` })
      .catch((error: unknown) => console.error("Could not delete profile photos", error));
    await logActivity(viewer, {
      action: "user.deleted",
      entityType: "user",
      entityId: uid,
      summary: `Deleted the account of ${user.displayName} (${user.email})`,
    });
  } catch (error) {
    return actionError(error);
  }
  redirect("/team?deleted=1");
}
