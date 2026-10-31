import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["card", "lift"],
      radius: ["card", "panel"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function average(values: number[]) {
  return values.length ? sum(values) / values.length : null;
}

export function round(value: number, places = 1) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function groupBy<T, K extends string>(items: T[], key: (item: T) => K) {
  const groups = {} as Record<K, T[]>;
  for (const item of items) {
    const k = key(item);
    (groups[k] ??= []).push(item);
  }
  return groups;
}

export function uniq<T>(values: T[]) {
  return [...new Set(values)];
}

/** Splits "a, b, c" or one-per-line text into a clean list. */
export function splitList(value: string) {
  return uniq(
    value
      .split(/[\n,]/)
      .map((part) => part.trim())
      .filter(Boolean),
  );
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count.toLocaleString("en-GB")} ${count === 1 ? one : many}`;
}

/** Safe redirect target: only same-site paths. */
export function safeNextPath(value: unknown, fallback = "/dashboard") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (value.startsWith("/login") || value.startsWith("/api/")) return fallback;
  return value;
}
