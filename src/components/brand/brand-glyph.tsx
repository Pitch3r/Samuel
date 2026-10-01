"use client";

import { motion, useReducedMotion } from "motion/react";
import { arcPath } from "@/lib/geometry";

/**
 * The three ideas behind the mark, from the brand guidelines:
 * the lens (focus), the segment (the part that matters) and the precision
 * (slits and whole numbers, nothing decorative).
 */
export function BrandGlyph({ kind, tone = "light" }: { kind: "lens" | "segment" | "precision"; tone?: "light" | "dark" }) {
  const reduce = useReducedMotion();
  const primary = tone === "dark" ? "#FFFFFF" : "#0B2447";
  const track = tone === "dark" ? "rgb(255 255 255 / 0.16)" : "#D5DCE6";
  const draw = (delay = 0) => ({
    initial: reduce ? false : { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 1.3, ease: [0.16, 1, 0.3, 1] as const, delay },
  });

  return (
    <svg viewBox="0 0 100 100" className="size-24" aria-hidden="true">
      {kind === "lens" && (
        <motion.circle cx="50" cy="50" r="36" fill="none" stroke={primary} strokeWidth="13" {...draw()} />
      )}
      {kind === "segment" && (
        <>
          <circle cx="50" cy="50" r="36" fill="none" stroke={track} strokeWidth="13" />
          <motion.path d={arcPath(50, 50, 36, 10, 70)} fill="none" stroke="#E4AC3F" strokeWidth="13" {...draw(0.15)} />
        </>
      )}
      {kind === "precision" && (
        <>
          <motion.path d={arcPath(50, 50, 36, 74, 352)} fill="none" stroke={primary} strokeWidth="13" {...draw()} />
          <motion.path d={arcPath(50, 50, 36, 6, 62)} fill="none" stroke={primary} strokeWidth="13" {...draw(0.25)} />
        </>
      )}
    </svg>
  );
}
