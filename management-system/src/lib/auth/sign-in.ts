import "server-only";
import { cookies, headers } from "next/headers";
import {
  DEVICE_COOKIE,
  DEVICE_COOKIE_MAX_AGE,
  SESSION_COOKIE,
  signDeviceToken,
  signSessionToken,
  verifyDeviceToken,
  verifySessionToken,
} from "@/lib/auth/tokens";
import { verifyPassword } from "@/lib/firebase/password-auth";
import { ipAllowed, withinGeofence, withinOfficeHours } from "@/lib/access/policy";
import { getAccessSettings } from "@/lib/data/settings";
import { clearRateLimit, consumeRateLimit } from "@/lib/data/rate-limit";
import { getUser, recordLogin } from "@/lib/data/users";
import { bindDeviceOnFirstSignIn, deviceAllows, getDevice, recordDeviceSeen } from "@/lib/data/devices";
import { createSessionRecord, endSessionRecord, recordLoginEvent } from "@/lib/data/sessions";
import { recordSignIn, recordSignOut } from "@/lib/data/attendance";
import { notifyAdmins } from "@/lib/data/notifications";
import { logActivity } from "@/lib/data/activity";
import { clientIpFrom, describeUserAgent } from "@/lib/request";
import { isFirebaseConfigured, isProduction } from "@/lib/env";
import { newId } from "@/lib/ids";
import { organisation, type AccessDenial, type Role } from "@/lib/constants";
import type { AccessSettings, DeviceDetails } from "@/lib/types";

export type SignInInput = {
  email: string;
  password: string;
  location: { lat: number; lng: number; accuracy: number } | null;
  client: Partial<Pick<DeviceDetails, "platform" | "screen" | "timeZone" | "language" | "cores" | "memory">>;
};

export type SignInResult = { ok: true; role: Role } | { ok: false; reason: AccessDenial };

const ADMIN_SESSION_HOURS = 12;

function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

/** Reads this browser's office-computer id, creating one on first contact. */
export async function ensureDeviceId() {
  const jar = await cookies();
  const existing = await verifyDeviceToken(jar.get(DEVICE_COOKIE)?.value);
  if (existing) return existing;
  const id = newId(18);
  jar.set(DEVICE_COOKIE, await signDeviceToken(id), cookieOptions(DEVICE_COOKIE_MAX_AGE));
  return id;
}

export async function currentDeviceId() {
  return verifyDeviceToken((await cookies()).get(DEVICE_COOKIE)?.value);
}

function deviceDetails(userAgentString: string, client: SignInInput["client"]): DeviceDetails {
  const ua = describeUserAgent(userAgentString);
  const text = (value: unknown, max = 80) => (typeof value === "string" ? value.slice(0, max) : "");
  const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);
  return {
    userAgent: userAgentString.slice(0, 400),
    browser: ua.browser,
    os: ua.os,
    platform: text(client.platform),
    screen: text(client.screen, 20),
    timeZone: text(client.timeZone, 60),
    language: text(client.language, 20),
    cores: num(client.cores),
    memory: num(client.memory),
  };
}

/** Sign-in-time office checks for employees. Returns the reason to refuse, or null. */
async function checkSignInAccess(input: {
  settings: AccessSettings;
  uid: string;
  name: string;
  ip: string;
  deviceId: string;
  details: DeviceDetails;
  location: SignInInput["location"];
}): Promise<AccessDenial | null> {
  const { settings } = input;
  if (!settings.enforce) return null;

  if (settings.network.enabled && settings.network.allowed.length && !ipAllowed(input.ip, settings.network.allowed)) {
    return "network";
  }
  if (settings.hours.enabled && !withinOfficeHours(new Date(), settings.hours, organisation.timeZone)) return "hours";

  const { location } = settings;
  if (location.enabled && location.latitude !== null && location.longitude !== null) {
    if (!input.location) return "location-missing";
    if (!withinGeofence(input.location, { latitude: location.latitude, longitude: location.longitude, radiusMeters: location.radiusMeters })) {
      return "location";
    }
  }

  if (!settings.device.enabled) return null;
  const existing = await getDevice(input.deviceId);
  const device = await recordDeviceSeen(input.deviceId, { ip: input.ip, uid: input.uid, userName: input.name, details: input.details });
  if (device.status === "blocked") return "device-blocked";
  if (deviceAllows(device, input.uid)) return null;
  if (device.status === "approved" && device.assignedUids.length) return "device-other-user";

  if (settings.device.mode === "first-sign-in") {
    const bound = await bindDeviceOnFirstSignIn(input.deviceId, input.uid, input.name, Math.max(1, settings.device.maxPerEmployee));
    if (bound.ok) {
      await logActivity(
        { uid: input.uid, name: input.name },
        { action: "device.bound", entityType: "device", entityId: input.deviceId, summary: `${input.name}'s account was locked to this office computer on first sign-in` },
      );
      return null;
    }
    if (bound.reason === "device-limit") await requestApproval(existing === null, input);
    return bound.reason;
  }

  await requestApproval(existing === null || existing.requestedBy !== input.uid, input);
  return "device-pending";
}

async function requestApproval(firstRequest: boolean, input: { uid: string; name: string; deviceId: string; details: DeviceDetails }) {
  if (!firstRequest) return;
  await notifyAdmins({
    title: `${input.name} asked to use a new computer`,
    body: `${input.details.browser} on ${input.details.os}. Approve or block it under Office access.`,
    href: "/settings/access",
  });
}

export async function signIn(input: SignInInput): Promise<SignInResult> {
  if (!isFirebaseConfigured()) return { ok: false, reason: "not-configured" };
  const h = await headers();
  const ip = clientIpFrom(h);
  const ua = h.get("user-agent") ?? "";
  const email = input.email.trim().toLowerCase();
  const deviceId = await ensureDeviceId();
  const details = deviceDetails(ua, input.client);
  const event = { email, ip, deviceId, userAgent: ua };

  const ipOk = await consumeRateLimit(`login:ip:${ip}`, { limit: 30, windowMs: 15 * 60_000 });
  const emailOk = await consumeRateLimit(`login:email:${email}`, { limit: 8, windowMs: 15 * 60_000 });
  if (!ipOk || !emailOk) {
    await recordLoginEvent({ ...event, uid: null, name: "", success: false, reason: "rate-limited" });
    return { ok: false, reason: "rate-limited" };
  }

  const check = await verifyPassword(email, input.password);
  if (!check.ok) {
    await recordLoginEvent({ ...event, uid: null, name: "", success: false, reason: check.reason });
    return { ok: false, reason: check.reason };
  }

  const user = await getUser(check.uid);
  if (!user) {
    await recordLoginEvent({ ...event, uid: check.uid, name: "", success: false, reason: "no-profile" });
    return { ok: false, reason: "no-profile" };
  }
  if (user.status !== "active") {
    await recordLoginEvent({ ...event, uid: user.uid, name: user.displayName, success: false, reason: "suspended" });
    return { ok: false, reason: "suspended" };
  }

  const settings = await getAccessSettings({ fresh: true });
  if (user.role === "employee") {
    const denial = await checkSignInAccess({ settings, uid: user.uid, name: user.displayName, ip, deviceId, details, location: input.location });
    if (denial) {
      await recordLoginEvent({ ...event, uid: user.uid, name: user.displayName, success: false, reason: denial });
      return { ok: false, reason: denial };
    }
  } else if (await getDevice(deviceId)) {
    // Keep what we know about an administrator's registered computer current.
    await recordDeviceSeen(deviceId, { ip, uid: user.uid, userName: user.displayName, details });
  }

  await clearRateLimit(`login:email:${email}`);

  const hours = user.role === "admin" ? ADMIN_SESSION_HOURS : Math.min(Math.max(settings.sessionHours, 1), 24);
  const expiresAt = new Date(Date.now() + hours * 3_600_000);
  const session = await createSessionRecord({ uid: user.uid, role: user.role, deviceId, ip, userAgent: ua, expiresAt });
  const token = await signSessionToken({ sid: session.id, uid: user.uid, role: user.role }, expiresAt);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(hours * 3600));

  const device = await getDevice(deviceId);
  await Promise.allSettled([
    recordLogin(user.uid),
    recordSignIn(user.uid, ip, device?.label ?? `${details.browser} on ${details.os}`),
    recordLoginEvent({ ...event, uid: user.uid, name: user.displayName, success: true, reason: "signed-in" }),
  ]);
  return { ok: true, role: user.role };
}

/** Ends the current session (if any) and clears the session cookie. The device cookie stays. */
export async function signOut(reason = "signed-out") {
  const jar = await cookies();
  const claims = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (claims) {
    await endSessionRecord(claims.sid, reason);
    await recordSignOut(claims.uid);
  }
  jar.delete(SESSION_COOKIE);
}
