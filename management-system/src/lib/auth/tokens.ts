import { jwtVerify, SignJWT } from "jose";
import { signingKey } from "@/lib/env";
import type { Role } from "@/lib/constants";

/**
 * Signed cookies. The session cookie only points at a server-side session
 * record (which can be revoked); the device cookie identifies an office computer.
 */

export const SESSION_COOKIE = "prms_session";
export const DEVICE_COOKIE = "prms_device";
/** Browsers cap cookie lifetimes at 400 days. */
export const DEVICE_COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export type SessionClaims = { sid: string; uid: string; role: Role };

export async function signSessionToken(claims: SessionClaims, expiresAt: Date) {
  return new SignJWT({ sid: claims.sid, role: claims.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.uid)
    .setIssuedAt()
    .setAudience("prms-session")
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(signingKey());
}

export async function verifySessionToken(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"], audience: "prms-session" });
    if (typeof payload.sid !== "string" || typeof payload.sub !== "string") return null;
    if (payload.role !== "admin" && payload.role !== "employee") return null;
    return { sid: payload.sid, uid: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function signDeviceToken(deviceId: string) {
  return new SignJWT({ did: deviceId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setAudience("prms-device")
    .sign(signingKey());
}

export async function verifyDeviceToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, signingKey(), { algorithms: ["HS256"], audience: "prms-device" });
    return typeof payload.did === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(payload.did) ? payload.did : null;
  } catch {
    return null;
  }
}
