/**
 * Plain-language descriptions of the office access policy. Pure functions, so
 * the Office access page, its form and the audit log all describe the rules
 * in the same words.
 */

import { ipMatchesRule } from "@/lib/access/policy";
import { WEEKDAYS, type DeviceMode } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import type { AccessSettings, Device } from "@/lib/types";

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Monday-first order used wherever days are listed. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export function shortDay(day: number) {
  return SHORT_DAYS[day] ?? "";
}

export function longDay(day: number) {
  return WEEKDAYS[day] ?? "";
}

function joinWithAnd(parts: string[]) {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`;
}

/** "Mon to Fri", "Mon, Wed and Fri", "Every day". */
export function describeDays(days: number[]) {
  const set = new Set(days);
  const ordered = WEEK_ORDER.filter((day) => set.has(day));
  if (ordered.length === 0) return "No days";
  if (ordered.length === 7) return "Every day";
  const positions = ordered.map((day) => WEEK_ORDER.indexOf(day));
  const runs = positions.every((position, i) => i === 0 || position === positions[i - 1]! + 1);
  if (runs && ordered.length >= 3) return `${shortDay(ordered[0]!)} to ${shortDay(ordered.at(-1)!)}`;
  return joinWithAnd(ordered.map(shortDay));
}

export function describeHours(hours: AccessSettings["hours"]) {
  return `${describeDays(hours.days)}, ${hours.start} to ${hours.end}`;
}

export const DEVICE_MODE_SHORT: Record<DeviceMode, string> = {
  "first-sign-in": "locked to the first computer each employee signs in on",
  registered: "approved office computers only",
};

/** What each mode means in practice, shown under the mode choice. */
export const DEVICE_MODE_HELP: Record<DeviceMode, string> = {
  "first-sign-in":
    "The first computer an employee signs in on becomes theirs, and every other computer is refused. Do that first sign-in together with the employee, at the office, on the computer they will use.",
  registered:
    "Employees can only sign in on computers you have approved here. Register each office computer from that computer, or approve requests as they arrive.",
};

export type RuleKey = "device" | "network" | "location" | "hours";

export type RuleSummary = { key: RuleKey; label: string; on: boolean; detail: string };

/** One line per rule, describing what is switched on and how it is set. */
export function ruleSummaries(settings: AccessSettings): RuleSummary[] {
  const { device, network, location, hours } = settings;
  const locationSet = location.latitude !== null && location.longitude !== null;
  return [
    {
      key: "device",
      label: "Computer lock",
      on: device.enabled,
      detail: device.enabled
        ? `Employees are ${DEVICE_MODE_SHORT[device.mode]}${device.mode === "first-sign-in" ? `, up to ${device.maxPerEmployee} each` : ""}.`
        : "Employees can sign in on any computer.",
    },
    {
      key: "network",
      label: "Office network",
      on: network.enabled && network.allowed.length > 0,
      detail:
        network.enabled && network.allowed.length
          ? `Only from ${network.allowed.length === 1 ? network.allowed[0] : `${network.allowed.length} office addresses`}.`
          : "Any internet connection is accepted.",
    },
    {
      key: "location",
      label: "Office location",
      on: location.enabled && locationSet,
      detail:
        location.enabled && locationSet
          ? `Within ${formatNumber(location.radiusMeters)} m of the office, checked at sign-in.`
          : "The computer's location is not checked.",
    },
    {
      key: "hours",
      label: "Office hours",
      on: hours.enabled,
      detail: hours.enabled ? `${describeHours(hours)}, Lusaka time.` : "Sign-in is allowed at any time.",
    },
  ];
}

type PolicyInput = Omit<AccessSettings, "updatedAt" | "updatedBy">;

const sameList = <T>(a: T[], b: T[]) => a.length === b.length && a.every((value, i) => value === b[i]);
const onOff = (on: boolean) => (on ? "on" : "off");

/** A one-line audit summary of what changed between two versions of the policy. */
export function describePolicyChange(before: PolicyInput, after: PolicyInput) {
  const parts: string[] = [];
  if (before.enforce !== after.enforce) parts.push(`switched office restrictions ${onOff(after.enforce)}`);

  if (before.device.enabled !== after.device.enabled) parts.push(`switched the computer lock ${onOff(after.device.enabled)}`);
  if (before.device.mode !== after.device.mode) parts.push(`set computers to ${DEVICE_MODE_SHORT[after.device.mode]}`);
  if (before.device.maxPerEmployee !== after.device.maxPerEmployee) {
    parts.push(`allowed ${after.device.maxPerEmployee} ${after.device.maxPerEmployee === 1 ? "computer" : "computers"} per employee`);
  }

  if (before.network.enabled !== after.network.enabled) parts.push(`switched the office network check ${onOff(after.network.enabled)}`);
  if (!sameList(before.network.allowed, after.network.allowed)) {
    parts.push(`updated the office network list (${after.network.allowed.length} ${after.network.allowed.length === 1 ? "entry" : "entries"})`);
  }

  if (before.location.enabled !== after.location.enabled) parts.push(`switched the location check ${onOff(after.location.enabled)}`);
  if (before.location.latitude !== after.location.latitude || before.location.longitude !== after.location.longitude) {
    parts.push("moved the office location");
  }
  if (before.location.radiusMeters !== after.location.radiusMeters) parts.push(`set the office radius to ${after.location.radiusMeters} m`);

  if (before.hours.enabled !== after.hours.enabled) parts.push(`switched office hours ${onOff(after.hours.enabled)}`);
  if (!sameList(before.hours.days, after.hours.days) || before.hours.start !== after.hours.start || before.hours.end !== after.hours.end) {
    parts.push(`set office hours to ${describeHours(after.hours)}`);
  }

  if (before.sessionHours !== after.sessionHours) parts.push(`set employee sessions to ${after.sessionHours} hours`);

  return parts.length ? `Updated office access: ${parts.join(", ")}` : "Saved the office access policy without changes";
}

/* ------------------------------------------------------------------ computers */

export const DEVICE_VIA_LABELS: Record<Device["registeredVia"], string> = {
  admin: "Registered by the administrator",
  "first-sign-in": "Locked on first sign-in",
  request: "Approved on request",
};

export function deviceSystem(device: Pick<Device, "details">) {
  const { browser, os } = device.details;
  return browser || os ? `${browser || "Browser"} on ${os || "unknown system"}` : "Unknown browser";
}

/* ------------------------------------------------------------------ addresses */

const LOCAL_RANGES = ["127.0.0.0/8", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "169.254.0.0/16", "::1/128", "fc00::/7", "fe80::/10"];

/**
 * True for loopback and private addresses. Seeing one means the system is
 * running on this computer, or a proxy is hiding the real public address.
 */
export function isLocalAddress(ip: string) {
  return LOCAL_RANGES.some((range) => ipMatchesRule(ip, range));
}
