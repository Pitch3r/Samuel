import "server-only";
import { firebaseWebApiKey } from "@/lib/env";

/**
 * Verifies an email and password against Firebase Authentication using the
 * Identity Toolkit REST API, so passwords never pass through browser SDK code
 * and the server can apply the office checks before any session exists.
 */

export type PasswordCheck =
  | { ok: true; uid: string; email: string }
  | { ok: false; reason: "bad-credentials" | "suspended" | "rate-limited" | "not-configured" | "auth-error" };

function endpoint(path: string) {
  const key = firebaseWebApiKey();
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const base = emulator ? `http://${emulator}/identitytoolkit.googleapis.com` : "https://identitytoolkit.googleapis.com";
  return `${base}/v1/${path}?key=${encodeURIComponent(key ?? "")}`;
}

export async function verifyPassword(email: string, password: string): Promise<PasswordCheck> {
  if (!firebaseWebApiKey()) return { ok: false, reason: "not-configured" };
  let response: Response;
  try {
    response = await fetch(endpoint("accounts:signInWithPassword"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return { ok: false, reason: "auth-error" };
  }

  const body = (await response.json().catch(() => ({}))) as {
    localId?: string;
    email?: string;
    error?: { message?: string };
  };

  if (response.ok && body.localId) return { ok: true, uid: body.localId, email: body.email ?? email };

  const code = body.error?.message ?? "";
  if (code.startsWith("USER_DISABLED")) return { ok: false, reason: "suspended" };
  if (code.startsWith("TOO_MANY_ATTEMPTS")) return { ok: false, reason: "rate-limited" };
  if (
    code.startsWith("INVALID_LOGIN_CREDENTIALS") ||
    code.startsWith("INVALID_PASSWORD") ||
    code.startsWith("EMAIL_NOT_FOUND") ||
    code.startsWith("INVALID_EMAIL") ||
    code.startsWith("MISSING_PASSWORD")
  ) {
    return { ok: false, reason: "bad-credentials" };
  }
  if (code.includes("API_KEY") || code.includes("CONFIGURATION_NOT_FOUND")) return { ok: false, reason: "not-configured" };
  return { ok: false, reason: "auth-error" };
}
