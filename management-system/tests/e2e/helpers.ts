import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const PASSWORD = "Prime2026!demo";
export const ADMIN = "admin@primeresearch.test";
export const CHANDA = "chanda@primeresearch.test";
export const MUTALE = "mutale@primeresearch.test";

export const OFFICE_IP = "41.72.100.10";
export const HOME_IP = "102.145.33.7";

process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";

export function admin() {
  if (!getApps().length) initializeApp({ projectId: "demo-primeresearch" });
  return { db: getFirestore(), auth: getAuth() };
}

type AccessPatch = {
  enforce?: boolean;
  device?: { enabled: boolean; mode: "first-sign-in" | "registered"; maxPerEmployee: number };
  network?: { enabled: boolean; allowed: string[] };
  hours?: { enabled: boolean; days: number[]; start: string; end: string };
  location?: { enabled: boolean; latitude: number | null; longitude: number | null; radiusMeters: number };
};

/** Replaces the office access policy. The app caches it for up to 10 seconds per server. */
export async function setAccess(patch: AccessPatch) {
  const { db } = admin();
  await db
    .collection("settings")
    .doc("access")
    .set({
      enforce: true,
      device: { enabled: false, mode: "first-sign-in", maxPerEmployee: 1 },
      network: { enabled: false, allowed: [] },
      hours: { enabled: false, days: [1, 2, 3, 4, 5], start: "07:00", end: "19:00" },
      location: { enabled: false, latitude: null, longitude: null, radiusMeters: 150 },
      sessionHours: 10,
      ...patch,
    });
  // Let the per-instance settings cache expire.
  await new Promise((resolve) => setTimeout(resolve, 10_500));
}

export async function resetDevicesAndLimits() {
  const { db } = admin();
  for (const name of ["devices", "rateLimits", "sessions"]) {
    const snap = await db.collection(name).get();
    await Promise.all(snap.docs.map((doc) => doc.ref.delete()));
  }
}

export async function uidOf(email: string) {
  return (await admin().auth.getUserByEmail(email)).uid;
}

/** A fresh browser profile, like a separate computer, seen from the given IP address. */
export async function computer(browser: Browser, ip = OFFICE_IP) {
  return browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": ip } });
}

export async function signIn(context: BrowserContext, email: string, password = PASSWORD): Promise<Page> {
  const page = await context.newPage();
  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
  await page.waitForLoadState("networkidle");
  return page;
}

export async function expectSignedIn(page: Page) {
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function expectRefused(page: Page, message: RegExp) {
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText(message)).toBeVisible();
}
