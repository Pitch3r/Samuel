"use client";

import { BarChart, type BarRow, type BarSeries } from "@/components/charts/bar-chart";
import { formatHours } from "@/lib/format";

/*
 * Server components cannot pass functions to client components, so charts
 * that need a custom value format are wrapped here.
 */

export function HoursBarChart(props: {
  rows: BarRow[];
  series: BarSeries[];
  title: string;
  height?: number;
  stacked?: boolean;
  highlightLast?: boolean;
  className?: string;
}) {
  return <BarChart {...props} valueFormat={formatHours} />;
}
