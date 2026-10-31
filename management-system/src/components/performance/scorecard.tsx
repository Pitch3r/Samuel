import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, CircleAlert, CircleCheck, Minus, PencilLine, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge, TrackBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ProgressBar, ScoreRing } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { seriesColor } from "@/components/charts/scale";
import { ChartFrame } from "@/components/reports/chart-scroller";
import { GradeBadge } from "@/components/performance/grade-badge";
import { Stars } from "@/components/performance/stars";
import { ScorePartsList } from "@/components/performance/score-parts";
import { ScoreTrendChart } from "@/components/performance/charts";
import { formatDate, formatHours, formatNumber, formatPercent } from "@/lib/format";
import { cn, plural } from "@/lib/utils";
import type { Scorecard as ScorecardData, RecentDelivery } from "@/app/(app)/performance/performance-data";

function Kpi({ label, value, sub, tone = "default", children }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "default" | "danger"; children?: ReactNode }) {
  return (
    <div className="min-w-0 bg-white px-5 py-4">
      <dt className="text-[0.7rem] font-semibold tracking-wide text-slate uppercase">{label}</dt>
      <dd className={cn("tabular mt-1.5 font-display text-xl leading-none font-bold", tone === "danger" ? "text-danger" : "text-navy")}>{value}</dd>
      {sub && <dd className="mt-1.5 text-xs text-slate">{sub}</dd>}
      {children && <dd className="mt-2">{children}</dd>}
    </div>
  );
}

/** Change in score against the previous period, in words with an arrow. */
function ScoreChange({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null || previous === null) {
    return <p className="text-xs text-slate">{previous === null ? "No score for the previous period" : "Not enough data to compare"}</p>;
  }
  const diff = current - previous;
  const Icon = diff === 0 ? Minus : diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="text-xs">
      <p className={cn("inline-flex items-center gap-1 font-semibold", diff === 0 ? "text-slate" : diff > 0 ? "text-good" : "text-danger")}>
        <Icon className="size-3.5" aria-hidden="true" />
        {diff === 0 ? "No change" : `${diff > 0 ? "Up" : "Down"} ${plural(Math.abs(diff), "point")}`}
      </p>
      <p className="mt-0.5 text-slate">on the previous period ({previous})</p>
    </div>
  );
}

function OnTimeBadge({ onTime }: { onTime: boolean | null }) {
  if (onTime === null) return <Badge icon={<Minus aria-hidden="true" />}>No due date</Badge>;
  return onTime ? (
    <Badge tone="good" icon={<CircleCheck aria-hidden="true" />}>
      On time
    </Badge>
  ) : (
    <Badge tone="danger" icon={<CircleAlert aria-hidden="true" />}>
      Late
    </Badge>
  );
}

function RecentList({ items }: { items: RecentDelivery[] }) {
  if (!items.length) {
    return <EmptyState title="Nothing completed yet" description="Approved assignments appear here with their rating." className="py-8" />;
  }
  return (
    <ul className="divide-y divide-mist">
      {items.map((item) => (
        <li key={item.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate">
            <span className="tabular font-semibold">{item.ref}</span>
            <TrackBadge track={item.track} short />
            {!item.inPeriod && <span className="rounded-full bg-cloud px-2 py-px font-semibold">Before this period</span>}
          </div>
          <Link href={`/assignments/${item.id}`} className="mt-1 block truncate font-semibold text-navy hover:text-blue hover:underline">
            {item.title}
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate">
              Completed {formatDate(item.completedOn)}
              {item.dueDate ? `, due ${formatDate(item.dueDate)}` : ""}
            </span>
            <span className="flex items-center gap-2">
              <OnTimeBadge onTime={item.onTime} />
              <Stars value={item.rating} />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * One person's performance for the period: the score and its grade, the four
 * weighted parts, the figures behind them, a six-month trend and their most
 * recent completed work.
 */
export function Scorecard({
  card,
  periodLabel,
  viewerIsAdmin,
  headingLevel = "h2",
}: {
  card: ScorecardData;
  periodLabel: string;
  viewerIsAdmin: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const { person, metrics } = card;
  const Heading = headingLevel;
  const Sub = headingLevel === "h2" ? "h3" : "h4";
  const scored = card.trend.filter((point): point is typeof point & { score: number } => point.score !== null);
  const attendance = metrics.workingDays ? metrics.attendanceDays / metrics.workingDays : null;
  const profileHref = viewerIsAdmin ? `/team/${encodeURIComponent(person.uid)}` : "/profile";

  return (
    <Card as="article" className="min-w-0 overflow-hidden print:shadow-none">
      <div id={`person-${person.uid}`} className="scroll-mt-24 flex flex-wrap items-center justify-between gap-4 border-b border-mist px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="relative shrink-0">
            <Avatar name={person.name} uid={person.uid} photoVersion={person.photoVersion} size="lg" />
            <span className="absolute right-0 bottom-0 size-3.5 rounded-full ring-2 ring-white" style={{ background: seriesColor(person.slot) }} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <Heading className="truncate text-lg font-bold">{person.name}</Heading>
            <p className="truncate text-sm text-slate">{person.jobTitle || "Employee"}</p>
            <p className="mt-0.5 text-xs text-slate">
              Targets: {plural(person.targets.monthlyAssignments, "assignment")} a month, {formatHours(person.targets.weeklyHours)} a week
            </p>
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {viewerIsAdmin ? (
            <>
              <ButtonLink href={`${profileHref}?tab=edit`} variant="secondary" size="sm">
                <PencilLine aria-hidden="true" />
                Adjust targets
              </ButtonLink>
              <ButtonLink href={profileHref} variant="ghost" size="sm">
                <UserRound aria-hidden="true" />
                Profile
              </ButtonLink>
            </>
          ) : (
            <ButtonLink href={profileHref} variant="secondary" size="sm">
              <UserRound aria-hidden="true" />
              My profile
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col items-center justify-center rounded-xl bg-cloud px-5 py-6 text-center">
          <ScoreRing value={metrics.score} size={148} stroke={12} label={`${person.name}, performance score for ${periodLabel}`} sublabel="Score" />
          <GradeBadge score={metrics.score} className="mt-4" />
          <div className="mt-3">
            <ScoreChange current={metrics.score} previous={card.previous.score} />
          </div>
          <p className="mt-3 text-xs text-slate">{periodLabel}</p>
        </div>
        <div className="min-w-0">
          <Sub className="mb-3 text-sm font-bold">What makes up the score</Sub>
          <ScorePartsList metrics={metrics} name={person.name} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px border-y border-mist bg-mist lg:grid-cols-4">
        <Kpi label="Completed" value={metrics.completedInPeriod} sub={`Target ${formatNumber(metrics.completedTarget)} for the period`} />
        <Kpi
          label="On time"
          value={formatPercent(metrics.onTimeRate, "N/A")}
          sub={`${metrics.completedOnTime} on time, ${metrics.completedLate} late`}
        />
        <Kpi label="Average quality" value={<Stars value={metrics.avgQuality} showValue />} sub={metrics.ratedCount ? `From ${plural(metrics.ratedCount, "rating")}` : "Nothing rated yet"} />
        <Kpi
          label="Average turnaround"
          value={metrics.avgTurnaroundDays === null ? "N/A" : `${formatNumber(metrics.avgTurnaroundDays)} days`}
          sub="Start date to completion"
        />
        <Kpi label="Hours logged" value={formatHours(metrics.hoursLogged)} sub={`Of ${formatHours(metrics.hoursTarget)} target (${formatPercent(metrics.hoursRate, "N/A")})`}>
          <ProgressBar value={(metrics.hoursRate ?? 0) * 100} size="sm" tone="blue" label={`${person.name}, hours against target`} />
        </Kpi>
        <Kpi
          label="Attendance"
          value={`${metrics.attendanceDays} of ${metrics.workingDays}`}
          sub={`Working days with an office sign-in (${formatPercent(attendance, "N/A")})`}
        />
        <Kpi label="Overdue now" value={metrics.overdueCount} tone={metrics.overdueCount ? "danger" : "default"} sub={metrics.overdueCount ? "Open and past the due date" : "Nothing past its due date"} />
        <Kpi label="Under review now" value={metrics.underReviewCount} sub={`Of ${plural(metrics.activeCount, "open assignment")}`} />
      </dl>

      <div className="grid lg:grid-cols-2">
        <section className="min-w-0 p-5 sm:p-6" aria-label={`${person.name}, score trend`}>
          <Sub className="text-sm font-bold">Score trend</Sub>
          <p className="mt-0.5 text-xs text-slate">Score for each calendar month, last six months.</p>
          <div className="mt-4">
            {scored.length >= 2 ? (
              <ChartFrame minWidth="24rem" align="end">
                <ScoreTrendChart labels={scored.map((point) => point.label)} values={scored.map((point) => point.score)} slot={person.slot} name={person.name} />
              </ChartFrame>
            ) : (
              <EmptyState title="Not enough history yet" description="The trend appears once there is a score for at least two months." className="py-8" />
            )}
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Score by month">
            {card.trend.map((point) => (
              <li key={point.month} className="rounded-lg bg-cloud px-2 py-1 text-xs">
                <span className="text-slate">{point.label}</span> <span className="tabular font-semibold text-navy">{point.score ?? "No data"}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="min-w-0 border-t border-mist p-5 sm:p-6 lg:border-t-0 lg:border-l" aria-label={`${person.name}, recent completed work`}>
          <Sub className="text-sm font-bold">Recent completed work</Sub>
          <p className="mb-4 mt-0.5 text-xs text-slate">The latest approved assignments up to the end of the period, with their rating.</p>
          <RecentList items={card.recent} />
        </section>
      </div>
    </Card>
  );
}
