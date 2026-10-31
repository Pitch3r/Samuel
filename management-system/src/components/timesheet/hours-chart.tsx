"use client";

import { BarChart, type BarRow, type BarSeries } from "@/components/charts/bar-chart";
import { formatHours } from "@/lib/format";

/*
 * Server components cannot pass functions to client components, so the bar
 * chart with an hours format is wrapped here.
 *
 * The chart's screen-reader table is absolutely positioned and wider than a
 * phone screen; anchoring it to the right edge stops it widening the page
 * (overflow to the left never scrolls) while keeping it readable to assistive tech.
 */
export function HoursColumns(props: { rows: BarRow[]; series: BarSeries[]; title: string; height?: number; stacked?: boolean; highlightLast?: boolean }) {
  return (
    <div className="[&_table.sr-only]:right-0">
      <BarChart {...props} valueFormat={formatHours} />
    </div>
  );
}
