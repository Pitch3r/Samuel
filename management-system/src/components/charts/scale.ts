/** Rounded axis maximum and evenly spaced ticks (0 / 5 / 10 / 15 ...). */
export function niceTicks(max: number, count = 4) {
  if (!Number.isFinite(max) || max <= 0) return { max: count, ticks: Array.from({ length: count + 1 }, (_, i) => i) };
  const rough = max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((candidate) => candidate >= rough) ?? 10 * power;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top + step / 2; value += step) ticks.push(Math.round(value * 1000) / 1000);
  return { max: top, ticks };
}

export function formatTick(value: number) {
  if (Math.abs(value) >= 10_000) return new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 }).format(value);
  return value.toLocaleString("en-GB");
}

/** Categorical series colours, in fixed order. Colour follows the entity, never its rank. */
export const SERIES_COLORS = [
  "var(--color-series-1)",
  "var(--color-series-2)",
  "var(--color-series-3)",
  "var(--color-series-4)",
  "var(--color-series-5)",
] as const;

export type SeriesSlot = 1 | 2 | 3 | 4 | 5;

export function seriesColor(slot: SeriesSlot) {
  return SERIES_COLORS[slot - 1];
}
