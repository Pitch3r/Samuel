"use server";

import { redirect } from "next/navigation";
import { timingSafeEqual } from "node:crypto";
import { countAdmins, createAccount } from "@/lib/data/users";
import { consumeRateLimit } from "@/lib/data/rate-limit";
import { logActivity } from "@/lib/data/activity";
import { clientIp } from "@/lib/request";
import { parseForm, setupSchema } from "@/lib/validation";
import { actionError } from "@/lib/actions";
import type { ActionResult } from "@/lib/types";

function keyMatches(given: string) {
  const expected = process.env.SETUP_KEY?.trim() ?? "";
  if (expected.length < 12) return false;
  const a = Buffer.from(given.trim());
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Creates the first administrator account. Works only while no administrator exists. */
export async function setupAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = parseForm(setupSchema, formData);
  if (!parsed.ok) return parsed.result;
  try {
    if (!(await consumeRateLimit(`setup:${await clientIp()}`, { limit: 10, windowMs: 15 * 60_000 }))) {
      return { ok: false, message: "Too many attempts. Wait a few minutes, then try again." };
    }
    if ((await countAdmins()) > 0) return { ok: false, message: "Setup has already been completed. Sign in instead." };
    if (!keyMatches(parsed.data.setupKey)) return { ok: false, message: "The setup key is not correct.", fieldErrors: { setupKey: ["The setup key is not correct."] } };
    const uid = await createAccount({
      email: parsed.data.email,
      password: parsed.data.password,
      role: "admin",
      displayName: parsed.data.displayName,
      jobTitle: "Managing Consultant",
      department: "Management",
    });
    await logActivity({ uid, name: parsed.data.displayName }, { action: "user.created", entityType: "user", entityId: uid, summary: "Created the administrator account during setup" });
  } catch (error) {
    return actionError(error);
  }
  redirect("/login?setup=done");
}
