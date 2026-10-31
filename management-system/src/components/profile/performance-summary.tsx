import type { ReactNode } from "react";
import { Gauge } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar, ScoreRing } from "@/components/ui/progress";
import { GradeBadge } from "@/components/profile/grade-badge";
import { SCORE_WEIGHTS } from "@/lib/constants";
import { formatHours, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EmployeeMetrics, ScoreParts } from "@/lib/metrics";

const PART_LABELS: Record<keyof ScoreParts, { label: string; help: string }> = {
  onTime: { label: "On-time delivery", help: "Completed work delivered by its due date" },
  quality: { label: "Quality", help: "Average rating given on approval" },
  throughput: { label: "Throughput", help: "Completed against the monthly target" },
  reporting: { label: "Reporting", help: "Weeks covered by a work report" },
};

function Kpi({ label, value, sub, tone = "default" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "default" | "danger" | "good" }) {
  return (
    <div className="min-w-0 rounded-xl border border-mist bg-white px-4 py-3">
      <dt className="truncate text-[0.7rem] font-semibold tracking-wide text-slate uppercase">{label}</dt>
      <dd className={cn("tabular mt-1 font-display text-xl leading-none font-bold", tone === "danger" ? "text-danger" : tone === "good" ? "text-good" : "text-navy")}>
        {value}
      </dd>
      {sub && <dd className="mt-1 text-xs leading-snug text-slate">{sub}</dd>}
    </div>
  );
}

function ScoreBlock({ label, metrics, name }: { label: string; metrics: EmployeeMetrics; name: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-cloud px-4 py-3">
      <ScoreRing value={metrics.score} size={84} stroke={8} label={`${name}, performance score ${label.toLowerCase()}`} sublabel="Score" />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy">{label}</p>
        <GradeBadge score={metrics.score} className="mt-1.5" />
        <p className="mt-1.5 text-xs text-slate">
          {metrics.completedInPeriod} completed, {metrics.ratedCount} rated
        </p>
      </div>
    </div>
  );
}

/**
 * Score rings for this month and this quarter, the figures behind them and
 * the weighted parts of the monthly score.
 */
export function PerformanceSummary({
  name,
  month,
  quarter,
  monthLabel,
  quarterLabel,
  action,
}: {
  name: string;
  month: EmployeeMetrics;
  quarter: EmployeeMetrics;
  monthLabel: string;
  quarterLabel: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        icon={<Gauge aria-hidden="true" />}
        title="Performance"
        description={`Weighted: on time ${SCORE_WEIGHTS.onTime}%, quality ${SCORE_WEIGHTS.quality}%, throughput ${SCORE_WEIGHTS.throughput}%, reporting ${SCORE_WEIGHTS.reporting}%.`}
        action={action}
      />
      <CardBody className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <ScoreBlock label={monthLabel} metrics={month} name={name} />
          <ScoreBlock label={quarterLabel} metrics={quarter} name={name} />
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Active" value={month.activeCount} sub={`${month.dueSoonCount} due in 7 days`} />
          <Kpi
            label="Overdue"
            value={month.overdueCount}
            tone={month.overdueCount > 0 ? "danger" : "default"}
            sub={month.overdueCount ? "Needs follow-up" : "On schedule"}
          />
          <Kpi label="Completed" value={month.completedInPeriod} sub={`Target ${Math.max(Math.round(month.completedTarget), 1)} this month`} />
          <Kpi label="Under review" value={month.underReviewCount} sub="Waiting for approval" />
          <Kpi label="On time" value={formatPercent(quarter.onTimeRate, "N/A")} sub={`${quarter.completedOnTime} of ${quarter.completedOnTime + quarter.completedLate} this quarter`} />
          <Kpi label="Quality" value={quarter.avgQuality !== null ? `${quarter.avgQuality}/5` : "N/A"} sub={`${quarter.ratedCount} rated this quarter`} />
          <Kpi label="Hours" value={formatHours(month.hoursLogged)} sub={`Of ${formatHours(month.hoursTarget)} this month`} />
          <Kpi
            label="Reports"
            value={`${month.reportWeeksCovered}/${month.reportWeeksExpected}`}
            sub="Weeks covered"
          />
        </dl>

        <div>
          <h3 className="text-sm font-semibold text-navy">What makes up the score this month</h3>
          <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {(Object.keys(PART_LABELS) as (keyof ScoreParts)[]).map((key) => {
              const value = month.parts[key];
              return (
                <li key={key}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-charcoal">
                      {PART_LABELS[key].label} <span className="text-xs text-slate">({SCORE_WEIGHTS[key]}%)</span>
                    </span>
                    <span className="tabular shrink-0 font-semibold text-navy">{formatPercent(value, "No data")}</span>
                  </div>
                  <ProgressBar value={(value ?? 0) * 100} tone="teal" size="sm" className="mt-1.5" label={`${PART_LABELS[key].label} this month`} />
                  <p className="mt-1 text-xs text-slate">{PART_LABELS[key].help}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
