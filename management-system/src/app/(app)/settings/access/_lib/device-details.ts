import "server-only";
import { deviceDetails } from "@/lib/auth/sign-in";
import type { DeviceDetails } from "@/lib/types";

/** Parses the browser's JSON description (screen, time zone and so on) and builds the stored details. */
export function deviceDetailsFrom(userAgent: string, clientJson: string | undefined): DeviceDetails {
  let client: Record<string, unknown> = {};
  try {
    const parsed: unknown = clientJson ? JSON.parse(clientJson) : {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) client = parsed as Record<string, unknown>;
  } catch {
    client = {};
  }
  return deviceDetails(userAgent, client);
}
