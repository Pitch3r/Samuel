import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "prc_session";
export const SESSION_HOURS = 8;

const DEV_SECRET = "development-only-session-secret-do-not-use-in-production";

/** Returns the signing key, or null when production is missing a strong secret. */
export function sessionKey(): Uint8Array | null {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return new TextEncoder().encode(secret);
  if (process.env.NODE_ENV !== "production") return new TextEncoder().encode(DEV_SECRET);
  return null;
}

export async function signSession() {
  const key = sessionKey();
  if (!key) throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key);
}

export async function verifySessionToken(token: string | undefined) {
  const key = sessionKey();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload.role === "admin" ? { role: "admin" as const, expiresAt: payload.exp } : null;
  } catch {
    return null;
  }
}
