/**
 * Pure office-access rules: IP allow lists, the office geofence and office
 * hours. No I/O here, so every rule is unit tested (tests/unit/policy.test.ts).
 */

import type { AccessSettings } from "@/lib/types";

export const DEFAULT_ACCESS_SETTINGS: AccessSettings = {
  enforce: true,
  device: { enabled: true, mode: "first-sign-in", maxPerEmployee: 1 },
  network: { enabled: false, allowed: [] },
  location: { enabled: false, latitude: null, longitude: null, radiusMeters: 150 },
  hours: { enabled: false, days: [1, 2, 3, 4, 5], start: "07:00", end: "19:00" },
  sessionHours: 10,
  updatedAt: null,
  updatedBy: null,
};

/** Fills in any setting missing from a stored document with its default. */
export function withAccessDefaults(stored: Partial<AccessSettings> | undefined): AccessSettings {
  const d = DEFAULT_ACCESS_SETTINGS;
  return {
    enforce: stored?.enforce ?? d.enforce,
    device: { ...d.device, ...stored?.device },
    network: { ...d.network, ...stored?.network, allowed: stored?.network?.allowed ?? [] },
    location: { ...d.location, ...stored?.location },
    hours: { ...d.hours, ...stored?.hours, days: stored?.hours?.days ?? d.hours.days },
    sessionHours: stored?.sessionHours ?? d.sessionHours,
    updatedAt: stored?.updatedAt ?? null,
    updatedBy: stored?.updatedBy ?? null,
  };
}

/* ------------------------------------------------------------------ IP addresses */

function parseIPv4(ip: string): bigint | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = BigInt(0);
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n > 255) return null;
    value = (value << BigInt(8)) + BigInt(n);
  }
  return value;
}

function parseIPv6(ip: string): bigint | null {
  let address = ip.toLowerCase();
  if (address.includes("%")) address = address.split("%")[0]!;
  // Embedded IPv4 tail, e.g. ::ffff:192.0.2.1
  const v4Tail = address.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (v4Tail) {
    const v4 = parseIPv4(v4Tail[1]!);
    if (v4 === null) return null;
    const hex = v4.toString(16).padStart(8, "0");
    address = address.replace(v4Tail[1]!, `${hex.slice(0, 4)}:${hex.slice(4)}`);
  }
  const halves = address.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 && head.length !== 8) return null;
  if (halves.length === 2 && missing < 1) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  let value = BigInt(0);
  for (const group of groups) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
    value = (value << BigInt(16)) + BigInt(parseInt(group, 16));
  }
  return value;
}

type ParsedIp = { version: 4 | 6; value: bigint };

export function parseIp(ip: string): ParsedIp | null {
  const trimmed = ip.trim();
  const v4 = parseIPv4(trimmed);
  if (v4 !== null) return { version: 4, value: v4 };
  const v6 = parseIPv6(trimmed);
  if (v6 === null) return null;
  // Treat IPv4-mapped IPv6 (::ffff:a.b.c.d) as IPv4.
  if (v6 >> BigInt(32) === BigInt(0xffff)) return { version: 4, value: v6 & BigInt(0xffffffff) };
  return { version: 6, value: v6 };
}

/** True for a single address ("41.72.100.10") or a CIDR range ("41.72.100.0/24", "2c0f:fe38::/32"). */
export function isValidIpRule(rule: string) {
  const [address, prefix, extra] = rule.trim().split("/");
  if (extra !== undefined || !address) return false;
  const parsed = parseIp(address);
  if (!parsed) return false;
  if (prefix === undefined) return true;
  if (!/^\d{1,3}$/.test(prefix)) return false;
  const bits = Number(prefix);
  return bits >= 0 && bits <= (parsed.version === 4 ? 32 : 128);
}

export function ipMatchesRule(ip: string, rule: string) {
  const candidate = parseIp(ip);
  if (!candidate || !isValidIpRule(rule)) return false;
  const [address, prefix] = rule.trim().split("/");
  const network = parseIp(address!)!;
  if (network.version !== candidate.version) return false;
  const width = candidate.version === 4 ? 32 : 128;
  const bits = prefix === undefined ? width : Number(prefix);
  if (bits === 0) return true;
  const shift = BigInt(width - bits);
  return candidate.value >> shift === network.value >> shift;
}

export function ipAllowed(ip: string, rules: string[]) {
  return rules.some((rule) => ipMatchesRule(ip, rule));
}

/* ------------------------------------------------------------------ geofence */

/** Great-circle distance in metres (haversine). */
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * The reading counts as inside when its uncertainty circle overlaps the office
 * circle, with accuracy capped so a vague reading cannot stretch the fence.
 */
export function withinGeofence(
  reading: { lat: number; lng: number; accuracy: number },
  office: { latitude: number; longitude: number; radiusMeters: number },
) {
  if (![reading.lat, reading.lng, reading.accuracy].every(Number.isFinite)) return false;
  const distance = distanceMeters(reading, { lat: office.latitude, lng: office.longitude });
  const tolerance = Math.min(Math.max(reading.accuracy, 0), 100);
  return distance - tolerance <= office.radiusMeters;
}

/* ------------------------------------------------------------------ office hours */

/** Day of week (0 = Sunday) and minutes past midnight in the given time zone. */
export function localClock(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { day: days.indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function parseClock(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function withinOfficeHours(
  date: Date,
  hours: { days: number[]; start: string; end: string },
  timeZone: string,
) {
  const { day, minutes } = localClock(date, timeZone);
  if (!hours.days.includes(day)) return false;
  const start = parseClock(hours.start);
  const end = parseClock(hours.end);
  if (start === null || end === null) return true;
  return minutes >= start && minutes < end;
}
