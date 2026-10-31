import { describe, expect, it } from "vitest";
import {
  distanceMeters,
  ipAllowed,
  ipMatchesRule,
  isValidIpRule,
  parseClock,
  withAccessDefaults,
  withinGeofence,
  withinOfficeHours,
} from "@/lib/access/policy";

describe("IP rules", () => {
  it("accepts single addresses and CIDR ranges", () => {
    expect(isValidIpRule("41.72.100.10")).toBe(true);
    expect(isValidIpRule("41.72.100.0/24")).toBe(true);
    expect(isValidIpRule("2c0f:fe38::/32")).toBe(true);
    expect(isValidIpRule("::1")).toBe(true);
  });

  it("rejects malformed rules", () => {
    for (const bad of ["", "41.72.100", "41.72.100.256", "41.72.100.0/33", "10.0.0.0/8/1", "office", "2c0f::/129", "1.2.3.4/-1"]) {
      expect(isValidIpRule(bad)).toBe(false);
    }
  });

  it("matches exact IPv4 addresses", () => {
    expect(ipMatchesRule("41.72.100.10", "41.72.100.10")).toBe(true);
    expect(ipMatchesRule("41.72.100.11", "41.72.100.10")).toBe(false);
  });

  it("matches IPv4 ranges on the prefix only", () => {
    expect(ipMatchesRule("41.72.100.200", "41.72.100.0/24")).toBe(true);
    expect(ipMatchesRule("41.72.101.1", "41.72.100.0/24")).toBe(false);
    expect(ipMatchesRule("41.72.101.1", "41.72.96.0/20")).toBe(true);
    expect(ipMatchesRule("8.8.8.8", "0.0.0.0/0")).toBe(true);
  });

  it("treats IPv4-mapped IPv6 as IPv4", () => {
    expect(ipMatchesRule("::ffff:41.72.100.10", "41.72.100.0/24")).toBe(true);
  });

  it("matches IPv6 ranges", () => {
    expect(ipMatchesRule("2c0f:fe38:2001::5", "2c0f:fe38::/32")).toBe(true);
    expect(ipMatchesRule("2c0f:fe39::5", "2c0f:fe38::/32")).toBe(false);
    expect(ipMatchesRule("2001:db8::1", "2001:db8::1")).toBe(true);
  });

  it("never matches across IP versions or with garbage input", () => {
    expect(ipMatchesRule("41.72.100.10", "2c0f:fe38::/32")).toBe(false);
    expect(ipMatchesRule("unknown", "0.0.0.0/0")).toBe(false);
    expect(ipMatchesRule("", "41.72.100.10")).toBe(false);
  });

  it("allows when any rule matches", () => {
    expect(ipAllowed("10.1.2.3", ["41.72.100.10", "10.0.0.0/8"])).toBe(true);
    expect(ipAllowed("10.1.2.3", [])).toBe(false);
  });
});

describe("geofence", () => {
  const office = { latitude: -15.3875, longitude: 28.3228, radiusMeters: 150 };

  it("measures distance with the haversine formula", () => {
    // Lusaka to Kitwe is roughly 290 km in a straight line.
    const d = distanceMeters({ lat: -15.3875, lng: 28.3228 }, { lat: -12.8024, lng: 28.2132 });
    expect(d).toBeGreaterThan(280_000);
    expect(d).toBeLessThan(300_000);
  });

  it("accepts readings inside the office radius", () => {
    expect(withinGeofence({ lat: -15.3875, lng: 28.3228, accuracy: 20 }, office)).toBe(true);
    expect(withinGeofence({ lat: -15.3884, lng: 28.3228, accuracy: 10 }, office)).toBe(true); // about 100 m south
  });

  it("refuses readings far away even with poor accuracy", () => {
    expect(withinGeofence({ lat: -15.42, lng: 28.3228, accuracy: 5000 }, office)).toBe(false); // about 3.6 km, accuracy capped
  });

  it("refuses invalid readings", () => {
    expect(withinGeofence({ lat: Number.NaN, lng: 28.3, accuracy: 10 }, office)).toBe(false);
  });
});

describe("office hours", () => {
  const hours = { days: [1, 2, 3, 4, 5], start: "07:30", end: "18:00" };

  it("parses clock times", () => {
    expect(parseClock("07:30")).toBe(450);
    expect(parseClock("24:00")).toBeNull();
    expect(parseClock("7:30")).toBeNull();
  });

  it("uses Lusaka time (UTC+2)", () => {
    // Monday 2026-11-02 06:00 UTC is 08:00 in Lusaka.
    expect(withinOfficeHours(new Date("2026-11-02T06:00:00Z"), hours, "Africa/Lusaka")).toBe(true);
    // Monday 05:00 UTC is 07:00 in Lusaka, before opening.
    expect(withinOfficeHours(new Date("2026-11-02T05:00:00Z"), hours, "Africa/Lusaka")).toBe(false);
    // 16:00 UTC is 18:00 in Lusaka, the end is exclusive.
    expect(withinOfficeHours(new Date("2026-11-02T16:00:00Z"), hours, "Africa/Lusaka")).toBe(false);
  });

  it("refuses closed days", () => {
    // Saturday 2026-10-31 10:00 Lusaka.
    expect(withinOfficeHours(new Date("2026-10-31T08:00:00Z"), hours, "Africa/Lusaka")).toBe(false);
  });
});

describe("access settings defaults", () => {
  it("fills missing values and keeps stored ones", () => {
    const settings = withAccessDefaults({ enforce: false, network: { enabled: true, allowed: ["41.72.100.10"] } } as never);
    expect(settings.enforce).toBe(false);
    expect(settings.network).toEqual({ enabled: true, allowed: ["41.72.100.10"] });
    expect(settings.device.enabled).toBe(true);
    expect(settings.device.mode).toBe("first-sign-in");
    expect(settings.hours.days).toEqual([1, 2, 3, 4, 5]);
  });

  it("defaults to restricting employees with the computer lock on", () => {
    const settings = withAccessDefaults(undefined);
    expect(settings.enforce).toBe(true);
    expect(settings.device).toEqual({ enabled: true, mode: "first-sign-in", maxPerEmployee: 1 });
  });
});
