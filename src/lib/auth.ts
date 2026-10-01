import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_HOURS, sessionKey, signSession, verifySessionToken } from "@/lib/session-token";

const DEV_EMAIL = "admin@primeresearch.local";
const DEV_PASSWORD = "change-me-now";

type Credentials = { email: string; password: string; isDevDefault: boolean };

/**
 * Admin credentials come from ADMIN_EMAIL and ADMIN_PASSWORD. In development a
 * clearly marked default is used so the dashboard can be explored; production
 * refuses to log anyone in until real values are configured.
 */
export function adminCredentials(): Credentials | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) return { email, password, isDevDefault: false };
  if (process.env.NODE_ENV !== "production") return { email: DEV_EMAIL, password: DEV_PASSWORD, isDevDefault: true };
  return null;
}

export function authConfigProblem(): string | null {
  if (!adminCredentials()) return "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server.";
  if (!sessionKey()) return "Admin login is not configured. Set SESSION_SECRET to a random value of at least 32 characters.";
  if (process.env.NODE_ENV === "production" && (process.env.ADMIN_PASSWORD?.length ?? 0) < 12) {
    return "ADMIN_PASSWORD must be at least 12 characters long.";
  }
  return null;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/** Constant-time comparison of both fields, so timing reveals nothing. */
export function checkCredentials(email: string, password: string) {
  const expected = adminCredentials();
  if (!expected) return false;
  const emailOk = timingSafeEqual(digest(email.trim().toLowerCase()), digest(expected.email));
  const passwordOk = timingSafeEqual(digest(password), digest(expected.password));
  return emailOk && passwordOk;
}

export async function createSession() {
  const token = await signSession();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { httpOnly: true, path: "/admin", maxAge: 0 });
}

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Data access guard: call at the top of every admin page, action and route. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function usingDevCredentials() {
  return adminCredentials()?.isDevDefault ?? false;
}
