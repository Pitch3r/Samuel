import "server-only";
import { headers } from "next/headers";
import { clientIpSource } from "@/lib/env";

/** Reads the visitor's IP address according to CLIENT_IP_SOURCE (see env.ts). */
export function clientIpFrom(h: Headers): string {
  const source = clientIpSource();
  const forwarded = (h.get("x-forwarded-for") ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const fromRight = (n: number) => forwarded[forwarded.length - n];

  let ip: string | undefined;
  if (source === "auto") {
    ip =
      h.get("x-fah-client-ip") ??
      (process.env.VERCEL ? (h.get("x-real-ip") ?? undefined) : undefined) ??
      fromRight(1) ??
      h.get("x-real-ip") ??
      undefined;
  } else if (source.startsWith("x-forwarded-for")) {
    const n = Number(source.split(":")[1] ?? "1");
    ip = fromRight(Number.isInteger(n) && n > 0 ? n : 1);
  } else {
    ip = h.get(source)?.split(",")[0]?.trim();
  }
  return normaliseIp(ip ?? "") || "unknown";
}

export async function clientIp() {
  return clientIpFrom(await headers());
}

/** Strips IPv6-mapped IPv4 prefixes and ports. */
export function normaliseIp(value: string) {
  let ip = value.trim();
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  // "1.2.3.4:5678"
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) ip = ip.split(":")[0]!;
  // "[2001:db8::1]:443"
  const bracket = ip.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracket) ip = bracket[1]!;
  return ip;
}

/** Forwarding headers shown to the administrator to confirm IP detection works. */
export async function ipDiagnostics() {
  const h = await headers();
  const names = ["x-fah-client-ip", "x-real-ip", "x-forwarded-for", "cf-connecting-ip", "fastly-client-ip"];
  return {
    detected: clientIpFrom(h),
    source: clientIpSource(),
    headers: names.map((name) => ({ name, value: h.get(name) ?? "" })).filter((entry) => entry.value),
  };
}

export async function userAgent() {
  return (await headers()).get("user-agent") ?? "";
}

/** A readable "Chrome on Windows" description of a user agent string. */
export function describeUserAgent(ua: string) {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  const os = /Windows NT/.test(ua)
    ? "Windows"
    : /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /CrOS/.test(ua)
            ? "ChromeOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Unknown system";
  return { browser, os, label: `${browser} on ${os}` };
}
