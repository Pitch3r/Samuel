import "server-only";
import { unstable_rethrow } from "next/navigation";
import { NotAllowedError, NotFoundError } from "@/lib/data/core";
import type { ActionResult } from "@/lib/types";

const FIREBASE_MESSAGES: Record<string, string> = {
  "auth/email-already-exists": "Another account already uses that email address.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/invalid-password": "Use a password of at least 10 characters.",
  "auth/user-not-found": "That account no longer exists.",
};

/**
 * Converts an error thrown inside a server action into a message for the form.
 * Redirects and other Next.js control flow are re-thrown untouched.
 */
export function actionError(error: unknown): ActionResult<never> {
  unstable_rethrow(error);
  if (error instanceof NotAllowedError || error instanceof NotFoundError) return { ok: false, message: error.message };
  const code = (error as { code?: string; errorInfo?: { code?: string } })?.errorInfo?.code ?? (error as { code?: string })?.code;
  if (code && FIREBASE_MESSAGES[code]) return { ok: false, message: FIREBASE_MESSAGES[code] };
  console.error(error);
  return { ok: false, message: "Something went wrong. Please try again." };
}
