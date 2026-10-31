"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wrapper for the shared charts, which draw on a fixed 640-unit canvas.
 * Below `minWidth` the chart scrolls sideways inside its card rather than
 * shrinking its labels to an unreadable size on a phone. With
 * `align="end"` a narrow screen starts scrolled to the latest month, which
 * matters most. The charts' screen-reader tables are anchored to the right
 * edge so their (invisible) width can never widen the page.
 */
export function ChartFrame({
  children,
  className,
  minWidth = "32rem",
  align = "start",
}: {
  children: ReactNode;
  className?: string;
  minWidth?: string;
  align?: "start" | "end";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (align !== "end" || !el) return;
    // Streamed content can be laid out after this effect runs, so keep the
    // chart at its end whenever its size settles, until the person scrolls it.
    let touched = false;
    const toEnd = () => {
      if (!touched && el.scrollWidth > el.clientWidth) el.scrollLeft = el.scrollWidth;
    };
    const stop = () => {
      touched = true;
    };
    toEnd();
    const observer = new ResizeObserver(toEnd);
    observer.observe(el);
    el.addEventListener("pointerdown", stop);
    el.addEventListener("wheel", stop, { passive: true });
    el.addEventListener("touchstart", stop, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
      el.removeEventListener("touchstart", stop);
    };
  }, [align]);
  return (
    <div ref={ref} className={cn(
        "-mx-1 min-w-0 overflow-x-auto px-1 pb-1 print:overflow-visible [&_table.sr-only]:right-0",
        // Keep a chart's own legend in view while the chart is scrolled sideways.
        "[&_figure>ul:first-child]:sticky [&_figure>ul:first-child]:left-0 [&_figure>ul:first-child]:w-max",
        className,
      )}>
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}
