"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth/sign-in";
import { logActivity } from "@/lib/data/activity";
import { resolveViewer } from "@/lib/auth/session";

export async function signOutAction() {
  const result = await resolveViewer();
  if (result.viewer) {
    await logActivity(result.viewer, { action: "session.signed-out", entityType: "session", entityId: result.viewer.sessionId, summary: "Signed out" });
  }
  await signOut("signed-out");
  redirect("/login?reason=signed-out");
}
