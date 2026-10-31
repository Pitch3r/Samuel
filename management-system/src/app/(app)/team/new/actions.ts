"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { createAccount, updateProfile } from "@/lib/data/users";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import { newEmployeeSchema, parseForm } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/**
 * Creates an employee's login and full profile. The administrator chooses the
 * initial password and hands it over in person.
 */
export async function createEmployeeAction(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(newEmployeeSchema, formData);
  if (!parsed.ok) return parsed.result;
  const input = parsed.data;

  let uid: string;
  try {
    uid = await createAccount({
      email: input.email,
      password: input.password,
      role: "employee",
      displayName: input.displayName,
      jobTitle: input.jobTitle,
      department: input.department,
      staffNumber: input.staffNumber,
      phone: input.phone,
      employmentType: input.employmentType,
      startDate: input.startDate,
    });
  } catch (error) {
    const result = actionError(error);
    // Point the message at the field it is about.
    return !result.ok && result.message.includes("email") ? { ...result, fieldErrors: { email: [result.message] } } : result;
  }

  try {
    await updateProfile(uid, {
      location: input.location,
      bio: input.bio,
      specialisations: input.specialisations,
      qualifications: input.qualifications,
      emergencyContact: { name: input.emergencyName, phone: input.emergencyPhone, relationship: input.emergencyRelationship },
      targets: { monthlyAssignments: input.monthlyAssignments, weeklyHours: input.weeklyHours },
    });
  } catch (error) {
    // The login exists; say so rather than inviting a second attempt that would clash on the email.
    console.error(error);
    await logActivity(viewer, { action: "user.created", entityType: "user", entityId: uid, summary: `Created an employee account for ${input.displayName}` });
    redirect(`/team/${uid}?tab=edit&partial=1`);
  }

  await logActivity(viewer, { action: "user.created", entityType: "user", entityId: uid, summary: `Created an employee account for ${input.displayName}` });
  redirect(`/team/${uid}?created=1`);
}
