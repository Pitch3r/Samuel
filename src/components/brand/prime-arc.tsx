"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { arcPath } from "@/lib/geometry";
import { cn } from "@/lib/utils";

/**
 * The Prime arc: the brand's single graphic device. A large, faint ring with a
 * gold segment, always cropped by the edge of the layout. It is a background
 * element and content must never sit on the gold.
 */
export function PrimeArc({
  tone = "dark",
  className,
  segmentStart = 18,
  segmentSweep = 58,
  thickness = 15,
  hairline = true,
  scrollRotate = true,
  drawIn = true,
}: {
  tone?: "dark" | "light";
  className?: string;
  /** Degrees clockwise from 12 o'clock. */
  segmentStart?: number;
  /** Set to 0 to show the faint ring alone, where a segment would sit under content. */
  segmentSweep?: number;
  /** Ring thickness in viewBox units (radius is 100). */
  thickness?: number;
  hairline?: boolean;
  scrollRotate?: boolean;
  drawIn?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-14, 26]);

  const ring = tone === "dark" ? "rgb(255 255 255 / 0.07)" : "rgb(11 36 71 / 0.065)";
  const line = tone === "dark" ? "rgb(255 255 255 / 0.10)" : "rgb(11 36 71 / 0.09)";
  const r = 100 - thickness / 2 - 14;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("pointer-events-none absolute select-none", className)}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="h-full w-full overflow-visible"
        style={scrollRotate && !reduce ? { rotate } : undefined}
      >
        {hairline && <circle cx="100" cy="100" r="99.4" fill="none" stroke={line} strokeWidth="0.35" />}
        <circle cx="100" cy="100" r={r} fill="none" stroke={ring} strokeWidth={thickness} />
        {segmentSweep > 0 && (
        <motion.path
          d={arcPath(100, 100, r, segmentStart, segmentStart + segmentSweep)}
          fill="none"
          stroke="#E4AC3F"
          strokeWidth={thickness}
          initial={drawIn && !reduce ? { pathLength: 0 } : false}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
        )}
      </motion.svg>
    </div>
  );
}
