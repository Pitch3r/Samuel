"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Stat ring from the brand's graphic language: a faint track with a gold
 * segment that marks the share that matters.
 */
export function StatRing({
  value,
  size = 168,
  stroke = 12,
  tone = "light",
  suffix = "%",
  label,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: "light" | "dark";
  suffix?: string;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState(0);
  const display = reduce ? value : animated;
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setAnimated(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <div ref={ref} className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone === "dark" ? "rgb(255 255 255 / 0.12)" : "#E3E8EF"}
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E4AC3F"
          strokeWidth={stroke}
          initial={{ pathLength: reduce ? clamped / 100 : 0 }}
          animate={{ pathLength: inView ? clamped / 100 : reduce ? clamped / 100 : 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <span
            className={cn(
              "font-display font-bold tracking-tight",
              tone === "dark" ? "text-white" : "text-navy",
            )}
            style={{ fontSize: size * 0.24 }}
          >
            {display}
            {suffix}
          </span>
          {label && (
            <span className={cn("mt-1 block text-xs font-medium", tone === "dark" ? "text-white/70" : "text-slate")}>
              {label}
            </span>
          )}
        </div>
      </div>
      <span className="sr-only">
        {value}
        {suffix} {label}
      </span>
    </div>
  );
}
