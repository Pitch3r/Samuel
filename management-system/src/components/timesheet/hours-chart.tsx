"use client";

import { BarChart, type BarRow, type BarSeries } from "@/components/charts/bar-chart";
import { formatHours } from "@/lib/format";

/*
 * Server components cannot pass functions to client components, so the bar
 * chart with an hours format is wrapped here.
 */
export function HoursColumns(props: { rows: BarRow[]; series: BarSeries[]; title: string; height?: number; stacked?: boolean; highlightLast?: boolean }) {
  return <BarChart {...props} valueFormat={formatHours} />;
}
