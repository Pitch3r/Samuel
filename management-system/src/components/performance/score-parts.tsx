import { ProgressBar } from "@/components/ui/progress";
import { SCORE_WEIGHTS } from "@/lib/constants";
import { formatPercent } from "@/lib/format";
import { plural } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { EmployeeMetrics, ScoreParts } from "@/lib/metrics";

export type PartKey = keyof ScoreParts;

export const PART_ORDER: PartKey[] = ["onTime", "quality", "throughput", "reporting"];

export const PART_INFO: Record<PartKey, { label: string; short: string; explains: string }> = {
  onTime: {
    label: "On-time delivery",
    short: "On time",
    explains: "Share of completed work with a due date that was delivered on or before it.",
  },
  quality: {
    label: "Quality",
    short: "Quality",
    explains: "Average quality rating (1 to 5) given by the administrator when work is approved, as a share of 5.",
  },
  throughput: {
    label: "Throughput",
    short: "Throughput",
    explains: "Assignments completed against the person's monthly target, scaled to the length of the period and capped at 100%.",
  },
  reporting: {
    label: "Reporting",
    short: "Reporting",
    explains: "Share of working weeks in the period covered by at least one work report.",
  },
};

/** What each part is made of, in a sentence, or why it was left out. */
function partDetail(key: PartKey, m: EmployeeMetrics) {
  switch (key) {
    case "onTime":
      return m.parts.onTime === null
        ? "Left out: no work with a due date was completed in the period."
        : `${m.completedOnTime} of ${plural(m.completedOnTime + m.completedLate, "dated delivery", "dated deliveries")} on time.`;
    case "quality":
      return m.parts.quality === null
        ? "Left out: no completed work was rated in the period."
        : `Average ${m.avgQuality?.toFixed(1)} out of 5 from ${plural(m.ratedCount, "rating")}.`;
    case "throughput":
      return m.parts.throughput === null
        ? "Left out: no assignments yet."
        : `${m.completedInPeriod} completed against a target of ${m.completedTarget} for the period.`;
    case "reporting":
      return m.parts.reporting === null
        ? "Left out: the period has no working weeks."
        : `${m.reportWeeksCovered} of ${plural(m.reportWeeksExpected, "week")} covered by a work report.`;
  }
}

/** The weight each part really carries once parts with no data are left out. */
export function effectiveWeights(parts: ScoreParts) {
  const counted = PART_ORDER.filter((key) => parts[key] !== null);
  const total = counted.reduce((acc, key) => acc + SCORE_WEIGHTS[key], 0);
  return Object.fromEntries(PART_ORDER.map((key) => [key, parts[key] === null || !total ? 0 : (SCORE_WEIGHTS[key] / total) * 100])) as Record<PartKey, number>;
}

/**
 * The four parts of the score, each with its value, its weight (and the
 * re-weighted share when another part is left out) and a meter.
 */
export function ScorePartsList({ metrics, name }: { metrics: EmployeeMetrics; name: string }) {
  const weights = effectiveWeights(metrics.parts);
  const reweighted = PART_ORDER.some((key) => metrics.parts[key] === null) && PART_ORDER.some((key) => metrics.parts[key] !== null);
  return (
    <div>
      <ul className="divide-y divide-mist">
        {PART_ORDER.map((key) => {
          const value = metrics.parts[key];
          const missing = value === null;
          return (
            <li key={key} className="py-3.5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <p className={cn("font-semibold", missing ? "text-slate" : "text-navy")}>{PART_INFO[key].label}</p>
                <p className="flex items-baseline gap-2 text-xs text-slate">
                  <span>
                    Weight {SCORE_WEIGHTS[key]}%
                    {reweighted && !missing && <span> (counts {Math.round(weights[key])}%)</span>}
                  </span>
                  <span className={cn("tabular font-display text-base font-bold", missing ? "text-slate" : "text-navy")}>{missing ? "Left out" : formatPercent(value)}</span>
                </p>
              </div>
              <ProgressBar
                value={missing ? 0 : value * 100}
                tone="blue"
                className="mt-2"
                label={`${name}, ${PART_INFO[key].label.toLowerCase()}: ${missing ? "left out" : formatPercent(value)}`}
              />
              <p className="mt-1.5 text-xs text-slate">{partDetail(key, metrics)}</p>
            </li>
          );
        })}
      </ul>
      {reweighted && (
        <p className="mt-4 rounded-lg bg-cloud px-3 py-2 text-xs text-slate">Parts with no data are left out and the others are re-weighted so they still add up to 100.</p>
      )}
    </div>
  );
}
