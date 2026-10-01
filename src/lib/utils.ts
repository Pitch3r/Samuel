import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { site } from "@/config/site";

// Teach tailwind-merge the brand's custom tokens so, for example, "text-h1 text-white"
// keeps both the size and the colour instead of treating them as a conflict.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "lead"],
      shadow: ["card", "lift", "glow"],
      radius: ["card", "panel"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path = "/") {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Lusaka",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lusaka",
});

export function formatDate(value: string | number | Date) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | number | Date) {
  return dateTimeFormatter.format(new Date(value));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function readingMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Meta description within the ~160 characters search engines display: whole sentences where possible. */
export function metaDescription(...parts: string[]) {
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  let out = "";
  for (const sentence of sentences) {
    const next = `${out} ${sentence.trim()}`.trim();
    if (next.length > 160) break;
    out = next;
  }
  if (out.length >= 110) return out;
  return `${text.slice(0, 156).replace(/\s+\S*$/, "").replace(/[,;:]$/, "")}...`;
}
