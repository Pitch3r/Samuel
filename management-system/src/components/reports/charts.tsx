"use client";

import { BarChart, type BarRow, type BarSeries } from "@/components/charts/bar-chart";
import { LineChart, type LineSeries } from "@/components/charts/line-chart";
import { formatMoney } from "@/lib/format";

/*
 * Server components cannot hand functions to client components, so charts
 * that need a custom value format are wrapped here.
 */

const percent = (value: number) => `${Math.round(value)}%`;
const money = (value: number) => formatMoney(value, { compact: true });

/** Line chart for 0 to 100 percentages, with the axis fixed at 100. */
export function PercentLineChart(props: { labels: string[]; series: LineSeries[]; title: string; height?: number; className?: string }) {
  return <LineChart {...props} valueFormat={percent} maxValue={100} />;
}

/** Column chart for kwacha amounts. */
export function MoneyBarChart(props: { rows: BarRow[]; series: BarSeries[]; title: string; height?: number; stacked?: boolean; className?: string }) {
  return <BarChart {...props} valueFormat={money} />;
}
