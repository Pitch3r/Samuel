import type { Metadata } from "next";
import { ChartColumn, CircleCheck, Clock, Download, Gauge, Timer, UserPlus, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { resolvePeriod, type PeriodPreset } from "@/lib/period";
import { daysBetween, formatDate, formatHours } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodPicker } from "@/components/ui/period-picker";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TabLinks } from "@/components/ui/misc";
import { KpiTile } from "@/components/reports/kpi-tile";
import { ExportPanel } from "@/components/reports/export-panel";
import { exportFilename, exportHref } from "@/components/reports/exports";
import { Scorecard } from "@/components/performance/scorecard";
import { ComparisonTable } from "@/components/performance/comparison";
import { HowScoreWorks } from "@/components/performance/how-it-works";
import { TargetsCard } from "@/components/performance/targets";
import { loadPerformance } from "./performance-data";

export async function generateMetadata(): Promise<Metadata> {
  const viewer = await requireUser();
  return { title: viewer.isAdmin ? "Performance" : "My performance" };
}

/** Query string for links that keep the chosen period, optionally focused on one person. */
function query(preset: PeriodPreset, period: { from: string; to: string }, uid?: string) {
  const params = new URLSearchParams(preset === "custom" ? { period: "custom", from: period.from, to: period.to } : { period: preset });
  if (uid) params.set("uid", uid);
  return `?${params.toString()}`;
}

/**
 * Performance scorecards. The administrator sees every active employee (or
 * one, with ?uid=) and how they compare; an employee sees only their own
 * scorecard, loaded through viewer-scoped data functions.
 */
export default async function PerformancePage(props: PageProps<"/performance">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const { preset, period, label } = resolvePeriod(params, "this-month");
  const data = await loadPerformance(viewer, period);
  const range = `${formatDate(period.from)} to ${formatDate(period.to)}`;
  // "this month (1 Oct 2026 to 31 Oct 2026)", or just the dates for a custom range.
  const when = preset === "custom" ? range : `${label.toLowerCase()} (${range})`;

  /* ---------------------------------------------------------------- employee */
  if (data.mode === "self") {
    const card = data.cards[0]!;
    return (
      <>
        <PageHeader
          eyebrow="Tracking"
          title="My performance"
          description={`How your work is scored for ${when}, what the score is made of and how it has moved over the last six months.`}
        />
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <PeriodPicker preset={preset} period={period} />
          <p className="text-xs text-slate">Only you and the administrator can see your scorecard.</p>
        </div>
        <Scorecard card={card} periodLabel={label} viewerIsAdmin={false} />
        <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
          <HowScoreWorks viewerIsAdmin={false} />
          <ExportPanel period={period} types={["time", "reports", "attendance"]} title="Download my records" layout="list" />
        </div>
      </>
    );
  }

  /* ---------------------------------------------------------------- administrator */
  const requested = typeof params.uid === "string" ? params.uid : "";
  const focus = data.cards.find((card) => card.person.uid === requested) ?? null;
  const { current, previous } = data.team;

  const header = (
    <PageHeader
      eyebrow="Tracking"
      title="Performance"
      description={`Scorecards for ${when}. Each score weighs on-time delivery, quality, throughput against target and reporting.`}
      actions={
        <>
          <a href={exportHref("performance", period)} download={exportFilename("performance", period)} className={buttonClasses({ variant: "secondary" })}>
            <Download aria-hidden="true" />
            Download CSV
          </a>
          <ButtonLink href={`/reports${query(preset, period)}`} variant="secondary">
            <ChartColumn aria-hidden="true" />
            Management report
          </ButtonLink>
        </>
      }
    />
  );

  if (!data.cards.length) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon={<Users aria-hidden="true" />}
            title={data.hasEmployees ? "No active employees" : "No employees yet"}
            description="Scorecards appear here for each active employee once they are added to the team."
            action={
              <ButtonLink href="/team/new" size="sm">
                <UserPlus aria-hidden="true" />
                Add employee
              </ButtonLink>
            }
          />
        </Card>
        <div className="mt-6 max-w-3xl">
          <HowScoreWorks viewerIsAdmin />
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <PeriodPicker preset={preset} period={period} keep={{ uid: focus?.person.uid }} />
        <p className="text-xs text-slate">Changes compare with the previous {plural(daysBetween(period.from, period.to) + 1, "day")}.</p>
      </div>

      <TabLinks
        className="mt-4"
        items={[
          { href: `/performance${query(preset, period)}`, label: "Whole team", active: !focus, count: data.cards.length },
          ...data.cards.map((card) => ({
            href: `/performance${query(preset, period, card.person.uid)}`,
            label: card.person.name,
            active: focus?.person.uid === card.person.uid,
          })),
        ]}
      />

      {focus ? (
        <div className="grid items-start gap-6">
          <Scorecard card={focus} periodLabel={label} viewerIsAdmin />
          <div className="grid items-start gap-6 xl:grid-cols-2">
            <HowScoreWorks viewerIsAdmin />
            <TargetsCard cards={[focus]} />
          </div>
        </div>
      ) : (
        <>
          <section aria-label="Team figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile
              label="Average team score"
              icon={<Gauge aria-hidden="true" />}
              value={current.score}
              previous={previous.score}
              hint={`Across ${plural(data.cards.length, "active employee")}`}
            />
            <KpiTile label="Completed by the team" icon={<CircleCheck aria-hidden="true" />} value={current.completed} previous={previous.completed} />
            <KpiTile label="On-time rate" icon={<Timer aria-hidden="true" />} value={current.onTimeRate} previous={previous.onTimeRate} format="percent" />
            <KpiTile
              label="Hours logged"
              icon={<Clock aria-hidden="true" />}
              value={current.hours}
              previous={previous.hours}
              format="hours"
              hint={`Team target ${formatHours(current.hoursTarget)}`}
            />
          </section>

          <div className="mt-6">
            <ComparisonTable cards={data.cards} focusHref={(uid) => `/performance${query(preset, period, uid)}`} />
          </div>

          <h2 className="mt-10 mb-4 text-lg font-bold">Scorecards</h2>
          <div className="grid items-start gap-6">
            {data.cards.map((card) => (
              <Scorecard key={card.person.uid} card={card} periodLabel={label} viewerIsAdmin headingLevel="h3" />
            ))}
          </div>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
            <HowScoreWorks viewerIsAdmin />
            <TargetsCard cards={data.cards} />
          </div>
        </>
      )}
    </>
  );
}
