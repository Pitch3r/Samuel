import type { AssignmentStatus, PaymentStatus } from "@/lib/constants";

/** Rounded axis maximum and evenly spaced ticks (0 / 5 / 10 / 15 ...). */
export function niceTicks(max: number, count = 4, { integer = false }: { integer?: boolean } = {}) {
  if (!Number.isFinite(max) || max <= 0) return { max: count, ticks: Array.from({ length: count + 1 }, (_, i) => i) };
  const rough = integer ? Math.max(max / count, 1) : max / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((candidate) => candidate >= rough && (!integer || Number.isInteger(candidate))) ?? 10 * power;
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

/**
 * Series slot for an employee: their position in listEmployees() (suspended
 * staff included, so colours never shift), capped at the five slots.
 */
export function employeeSlot(index: number): SeriesSlot {
  return (Math.min(Math.max(index, 0), 4) + 1) as SeriesSlot;
}

/**
 * Segment fills for status splits. Waiting states (not started, on hold) are
 * greys on purpose; every segment is named in a legend or a labelled list
 * beside it (which carries the status icon). Adjacent pairs pass the colour
 * vision checks.
 */
export const STATUS_FILLS: Record<AssignmentStatus, string> = {
  not_started: "#9aa6b5",
  in_progress: "var(--color-blue)",
  under_review: "var(--color-gold-dark)",
  revision: "var(--color-serious)",
  on_hold: "var(--color-slate)",
  completed: "var(--color-good)",
  cancelled: "#c9d1dc",
};

/** Fills for fees split by payment status, from settled (green) to not yet billed (grey). */
export const PAYMENT_FILLS: Record<PaymentStatus, string> = {
  paid: "var(--color-good)",
  part_paid: "var(--color-teal)",
  invoiced: "var(--color-blue)",
  not_invoiced: "#9aa6b5",
  waived: "#c9d1dc",
};
