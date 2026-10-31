"use client";

import { LineChart } from "@/components/charts/line-chart";
import type { SeriesSlot } from "@/components/charts/scale";

/** One person's score by month on a fixed 0 to 100 axis, in their own chart colour. */
export function ScoreTrendChart({ labels, values, slot, name, height = 200 }: { labels: string[]; values: number[]; slot: SeriesSlot; name: string; height?: number }) {
  return (
    <LineChart
      title={`${name}, performance score by month`}
      labels={labels}
      series={[{ key: "score", label: "Score", slot, values }]}
      maxValue={100}
      height={height}
    />
  );
}
