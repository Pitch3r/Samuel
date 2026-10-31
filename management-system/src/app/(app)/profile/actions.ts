"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/sign-in";
import { setPassword, updateProfile } from "@/lib/data/users";
import { endAllSessionsFor } from "@/lib/data/sessions";
import { logActivity } from "@/lib/data/activity";
import { consumeRateLimit } from "@/lib/data/rate-limit";
import { verifyPassword } from "@/lib/firebase/password-auth";
import { actionError } from "@/lib/actions";
import { changePasswordSchema, parseForm, selfProfileSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/*
 * Actions on your own profile. They only ever act on the signed-in person
 * (viewer.uid); nothing in the form says whose profile it is.
 */

type State = ActionResult | null;

export async function updateMyProfileAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const parsed = parseForm(selfProfileSchema, formData);
  if (!parsed.ok) return parsed.result;
  const input = parsed.data;
  try {
    // Only the fields a person may change about themselves.
    await updateProfile(viewer.uid, {
      phone: input.phone,
      location: input.location,
      bio: input.bio,
      specialisations: input.specialisations,
      qualifications: input.qualifications,
      emergencyContact: { name: input.emergencyName, phone: input.emergencyPhone, relationship: input.emergencyRelationship },
    });
    await logActivity(viewer, { action: "user.profile-updated", entityType: "user", entityId: viewer.uid, summary: "Updated their profile" });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Your profile has been saved." };
}

const ATTEMPTS = { limit: 5, windowMs: 15 * 60 * 1000 };

/**
 * Checks the current password, sets the new one, then ends every session
 * (this one included) so any other computer signed in as this person is
 * signed out too. The person signs in again with the new password.
 */
export async function changePasswordAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireUser();
  const parsed = parseForm(changePasswordSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { currentPassword, newPassword } = parsed.data;
  if (currentPassword === newPassword) {
    return { ok: false, message: "Choose a password you have not used here before.", fieldErrors: { newPassword: ["Use a different password from your current one."] } };
  }

  try {
    if (!(await consumeRateLimit(`password-change:${viewer.uid}`, ATTEMPTS))) {
      return { ok: false, message: "Too many attempts. Wait 15 minutes, then try again." };
    }
    const check = await verifyPassword(viewer.email, currentPassword);
    if (!check.ok || check.uid !== viewer.uid) {
      if (check.ok || check.reason === "bad-credentials") {
        return { ok: false, message: "Your current password is not correct.", fieldErrors: { currentPassword: ["That is not your current password."] } };
      }
      if (check.reason === "rate-limited") return { ok: false, message: "Too many attempts. Wait a few minutes, then try again." };
      return { ok: false, message: "Your password could not be checked right now. Please try again shortly." };
    }
    await setPassword(viewer.uid, newPassword);
    await logActivity(viewer, { action: "user.password-changed", entityType: "user", entityId: viewer.uid, summary: "Changed their password" });
    await endAllSessionsFor(viewer.uid, "password-changed");
    await signOut("password-changed");
  } catch (error) {
    return actionError(error);
  }
  redirect("/login?reason=password-changed");
}
