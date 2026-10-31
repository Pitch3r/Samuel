import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { DEVICE_COOKIE, SESSION_COOKIE, verifyDeviceToken, verifySessionToken } from "@/lib/auth/tokens";
import { ipAllowed, withinOfficeHours } from "@/lib/access/policy";
import { getAccessSettings } from "@/lib/data/settings";
import { endSessionRecord, getSessionRecord, touchSessionRecord } from "@/lib/data/sessions";
import { getUser, touchLastSeen } from "@/lib/data/users";
import { deviceAllows, getDevice } from "@/lib/data/devices";
import { touchAttendance } from "@/lib/data/attendance";
import { clientIpFrom } from "@/lib/request";
import { isFirebaseConfigured } from "@/lib/env";
import { organisation, type AccessDenial } from "@/lib/constants";
import type { AccessSettings, Viewer } from "@/lib/types";

const HEARTBEAT_MS = 5 * 60 * 1000;

export type ViewerResult = { viewer: Viewer } | { viewer: null; reason: AccessDenial | null };

/**
 * Office rules checked on every request for employees. The administrator is
 * never restricted, so they can manage the system from anywhere.
 */
export async function checkRequestAccess(input: {
  settings: AccessSettings;
  role: "admin" | "employee";
  uid: string;
  ip: string;
  sessionDeviceId: string | null;
  cookieDeviceId: string | null;
  now?: Date;
}): Promise<AccessDenial | null> {
  const { settings } = input;
  if (input.role === "admin" || !settings.enforce) return null;

  if (settings.network.enabled && settings.network.allowed.length && !ipAllowed(input.ip, settings.network.allowed)) {
    return "network";
  }
  if (settings.hours.enabled && !withinOfficeHours(input.now ?? new Date(), settings.hours, organisation.timeZone)) {
    return "hours";
  }
  if (settings.device.enabled) {
    if (!input.cookieDeviceId || input.cookieDeviceId !== input.sessionDeviceId) return "device-mismatch";
    const device = await getDevice(input.cookieDeviceId);
    if (!device) return "device-pending";
    if (device.status === "blocked") return "device-blocked";
    if (!deviceAllows(device, input.uid)) return device.status === "approved" ? "device-other-user" : "device-pending";
  }
  return null;
}

/** Resolves the signed-in person once per request, applying every check. */
export const resolveViewer = cache(async (): Promise<ViewerResult> => {
  // Read the request first, so every page that checks the session is always
  // rendered per request and never pre-built at build time.
  const jar = await cookies();
  if (!isFirebaseConfigured()) return { viewer: null, reason: "not-configured" };
  const claims = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!claims) return { viewer: null, reason: null };

  const session = await getSessionRecord(claims.sid);
  if (!session || session.uid !== claims.uid || session.endedAt || session.expiresAt <= new Date().toISOString()) {
    return { viewer: null, reason: "expired" };
  }

  const profile = await getUser(session.uid);
  if (!profile) return { viewer: null, reason: "no-profile" };
  if (profile.status !== "active") {
    await endSessionRecord(session.id, "suspended");
    return { viewer: null, reason: "suspended" };
  }

  const ip = clientIpFrom(await headers());
  const denial = await checkRequestAccess({
    settings: await getAccessSettings(),
    role: profile.role,
    uid: profile.uid,
    ip,
    sessionDeviceId: session.deviceId,
    cookieDeviceId: await verifyDeviceToken(jar.get(DEVICE_COOKIE)?.value),
  });
  if (denial) {
    await endSessionRecord(session.id, denial);
    return { viewer: null, reason: denial };
  }

  if (Date.now() - new Date(session.lastSeenAt).getTime() > HEARTBEAT_MS) {
    after(async () => {
      await Promise.allSettled([touchSessionRecord(session.id, ip), touchAttendance(profile.uid, ip), touchLastSeen(profile.uid)]);
    });
  }

  return {
    viewer: {
      uid: profile.uid,
      role: profile.role,
      isAdmin: profile.role === "admin",
      name: profile.displayName,
      email: profile.email,
      sessionId: session.id,
      deviceId: session.deviceId,
      profile,
    },
  };
});

function loginUrl(reason: AccessDenial | null) {
  return reason ? `/login?reason=${reason}` : "/login";
}

/** For pages and server actions: the viewer, or a redirect to sign in. */
export async function requireUser(): Promise<Viewer> {
  const result = await resolveViewer();
  if (!result.viewer) redirect(loginUrl(result.reason));
  return result.viewer;
}

/** For administrator-only pages and actions. Employees are sent to their dashboard. */
export async function requireAdmin(): Promise<Viewer> {
  const viewer = await requireUser();
  if (!viewer.isAdmin) redirect("/dashboard?denied=1");
  return viewer;
}

/** For route handlers, which answer with a status code instead of redirecting. */
export async function viewerOrNull(): Promise<Viewer | null> {
  return (await resolveViewer()).viewer;
}
