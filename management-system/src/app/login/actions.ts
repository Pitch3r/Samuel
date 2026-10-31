"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth/sign-in";
import { loginSchema } from "@/lib/validation";
import { safeNextPath } from "@/lib/utils";
import { ACCESS_DENIALS, type AccessDenial } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";

export type LoginState = (ActionResult<never> & { reason?: AccessDenial }) | null;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Enter your email address and password." };
  const { email, password, next, latitude, longitude, accuracy, client } = parsed.data;

  let details: Record<string, unknown> = {};
  try {
    details = client ? (JSON.parse(client) as Record<string, unknown>) : {};
  } catch {
    details = {};
  }

  let result;
  try {
    result = await signIn({
      email,
      password,
      location:
        latitude != null && longitude != null ? { lat: latitude, lng: longitude, accuracy: accuracy ?? 1000 } : null,
      client: details,
    });
  } catch (error) {
    console.error("Sign-in failed", error);
    return { ok: false, message: ACCESS_DENIALS["auth-error"], reason: "auth-error" };
  }

  if (!result.ok) return { ok: false, message: ACCESS_DENIALS[result.reason], reason: result.reason };
  redirect(safeNextPath(next));
}
