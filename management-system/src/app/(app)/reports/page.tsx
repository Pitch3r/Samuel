import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CircleCheck, ClipboardList, Clock, Hourglass, Star, Timer, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { resolvePeriod, type PeriodPreset } from "@/lib/period";
import { formatDate, formatMoney } from "@/lib/format";
import { organisation } from "@/lib/constants";
import { cn, plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodPicker } from "@/components/ui/period-picker";
import { KpiTile } from "@/components/reports/kpi-tile";
import { PrintButton } from "@/components/reports/print-button";
import { ReportContents, ReportCover, ReportSection } from "@/components/reports/cover";
import { buildHighlights } from "@/components/reports/highlights";
import { DeliverySection } from "@/components/reports/delivery";
import { WorkloadSection } from "@/components/reports/workload";
import { CategoriesSection } from "@/components/reports/categories";
import { TracksSection } from "@/components/reports/tracks";
import { ClientsSection } from "@/components/reports/clients";
import { TeamSection } from "@/components/reports/team";
import { PaymentsSection } from "@/components/reports/payments";
import { ExportPanel } from "@/components/reports/export-panel";
import { loadManagementReport, type TrendMonths } from "./report-data";

export const metadata: Metadata = { title: "Reports and analytics" };

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "delivery", label: "Delivery" },
  { id: "workload", label: "Workload" },
  { id: "categories", label: "Categories" },
  { id: "tracks", label: "Tracks" },
  { id: "clients", label: "Clients" },
  { id: "team", label: "Team" },
  { id: "payments", label: "Payments" },
  { id: "exports", label: "Exports" },
];

/*
 * On paper the report stands alone: the navigation column is hidden, the
 * page uses the full width and chart and bar colours are kept (browsers drop
 * background colours when printing unless asked not to).
 */
const PRINT_CSS = `
@media print {
  aside { display: none !important; }
  div:has(> aside) { display: block !important; }
  #main { max-width: none !important; padding: 0 !important; }
  .report-root, .report-root * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report-root .overflow-x-auto { overflow: visible !important; }
  .report-root .data-table { font-size: 0.6875rem; }
  .report-root .data-table th, .report-root .data-table td { padding: 0.4rem 0.45rem !important; min-width: 0 !important; }
  .report-root .data-table th { white-space: normal !important; }
  .report-root .data-table tr { break-inside: avoid; }
  /* Keep a section heading with what follows: it reserves room below itself, so it moves to the next page rather than sit alone at the foot of one. */
  .report-root .report-section-head { break-inside: avoid; }
  .report-root .report-section-head::after { content: ""; display: block; height: 160px; margin-bottom: -160px; }
}
`;

/** Query string that keeps the chosen period (and anything extra) on links within the report. */
function keepQuery(preset: PeriodPreset, period: { from: string; to: string }, extra: Record<string, string | undefined> = {}) {
  const params = new URLSearchParams(preset === "custom" ? { period: "custom", from: period.from, to: period.to } : { period: preset });
  for (const [key, value] of Object.entries(extra)) if (value) params.set(key, value);
  return params.toString();
}

/**
 * The management report: one period (this month by default) against the
 * period of the same length before it, across delivery, workload,
 * categories, tracks, clients, the team and payments. Administrator only.
 */
export default async function ReportsPage(props: PageProps<"/reports">) {
  const viewer = await requireAdmin();
  const params = await props.searchParams;
  const { preset, period, label } = resolvePeriod(params, "this-month");
  const months: TrendMonths = params.months === "12" ? 12 : 6;
  const report = await loadManagementReport(viewer, period, months);
  const { current, before } = report;

  const corporate = report.tracks.find((row) => row.track === "corporate");
  const academic = report.tracks.find((row) => row.track === "academic");
  const highlights = buildHighlights({
    current,
    before,
    newByTrack: { corporate: corporate?.created ?? 0, academic: academic?.created ?? 0 },
    workload: { total: report.workload.total, overdue: report.workload.overdue, underReview: report.workload.statusCounts.under_review },
    outstanding: {
      total: report.outstanding.total,
      count: report.outstanding.count,
      topClient: report.outstandingByClient[0] ? { name: report.outstandingByClient[0].name, balance: report.outstandingByClient[0].balance } : null,
    },
    topCategory: report.categories[0] ? { name: report.categories[0].name, active: report.categories[0].active } : null,
  });

  // Months of the delivery trend that fall inside the report period.
  const periodMonths = report.delivery.table.map((row) => row.month).filter((month) => month >= period.from.slice(0, 7) && month <= period.to.slice(0, 7));

  return (
    <div className="report-root">
      <style>{PRINT_CSS}</style>

      <PageHeader
        className="no-print"
        eyebrow="Management"
        title="Reports and analytics"
        description="A management report for any period, compared with the period of the same length before it. Print it, save it as a PDF or download the figures."
        actions={<PrintButton variant="primary" />}
      />

      <div className="no-print mb-6 flex flex-wrap items-end justify-between gap-4 rounded-card border border-mist bg-white px-4 py-3 shadow-card">
        <div className="flex flex-wrap items-end gap-4">
          <PeriodPicker preset={preset} period={period} keep={{ months: months === 12 ? "12" : undefined }} />
          <div>
            <span className="mb-1 block text-xs font-semibold text-slate" id="trend-label">
              Trend charts
            </span>
            <div className="flex h-10 items-center gap-1 rounded-xl border border-mist bg-cloud p-1" role="group" aria-labelledby="trend-label">
              {([6, 12] as const).map((value) => (
                <Link
                  key={value}
                  href={`/reports?${keepQuery(preset, period, { months: value === 12 ? "12" : undefined })}`}
                  aria-current={months === value ? "true" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[0.8125rem] font-semibold transition-colors",
                    months === value ? "bg-white text-navy shadow-sm" : "text-slate hover:text-navy",
                  )}
                >
                  {value} months
                </Link>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate">
          Compared with {formatDate(report.previous.from)} to {formatDate(report.previous.to)}
        </p>
      </div>

      <ReportCover
        periodLabel={label}
        period={period}
        previous={report.previous}
        generatedAt={new Date().toISOString()}
        preparedBy={viewer.name}
        highlights={highlights}
      />

      <div className="mt-6">
        <ReportContents items={SECTIONS} />
      </div>

      <ReportSection id="summary" title="Summary" description="Headline figures for the period. Changes compare with the previous period of the same length.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:grid-cols-4">
          <KpiTile
            label="New assignments"
            icon={<ClipboardList aria-hidden="true" />}
            value={current.created}
            previous={before.created}
            hint={`${plural(current.active, "assignment")} active in the period`}
          />
          <KpiTile
            label="Completed"
            icon={<CircleCheck aria-hidden="true" />}
            value={current.completed}
            previous={before.completed}
            hint={`${corporate?.completed ?? 0} corporate, ${academic?.completed ?? 0} academic`}
          />
          <KpiTile
            label="On-time rate"
            icon={<Timer aria-hidden="true" />}
            value={current.onTimeRate}
            previous={before.onTimeRate}
            format="percent"
            hint={current.timed ? `${current.onTime} of ${plural(current.timed, "dated delivery", "dated deliveries")}` : "No dated deliveries in the period"}
          />
          <KpiTile
            label="Average quality"
            icon={<Star aria-hidden="true" />}
            value={current.avgQuality}
            previous={before.avgQuality}
            format="rating"
            hint={current.rated ? `From ${plural(current.rated, "rating")} on approval` : "Nothing rated in the period"}
          />
          <KpiTile
            label="Average turnaround"
            icon={<Hourglass aria-hidden="true" />}
            value={current.avgTurnaround}
            previous={before.avgTurnaround}
            format="days"
            upIsGood={false}
            hint="Start date to completion"
          />
          <KpiTile label="Hours logged" icon={<Clock aria-hidden="true" />} value={current.hours} previous={before.hours} format="hours" hint="All staff, all time entries" />
          <KpiTile
            label="Revenue completed"
            icon={<Banknote aria-hidden="true" />}
            value={current.revenue}
            previous={before.revenue}
            format="money"
            hint="Fees on work completed in the period"
          />
          <KpiTile
            label="Outstanding fees"
            icon={<Wallet aria-hidden="true" />}
            value={report.outstanding.total}
            format="money"
            compare={false}
            hint={
              report.outstanding.count
                ? `Today, on ${plural(report.outstanding.count, "completed assignment")}. ${formatMoney(report.outstanding.fromPeriod, { compact: true })} is from work completed in the period.`
                : "Today. All completed work is paid or settled."
            }
          />
        </div>
      </ReportSection>

      <ReportSection id="delivery" title="Delivery" description={`Completed work and punctuality over the last ${months} months to ${formatDate(period.to)}.`}>
        <DeliverySection rows={report.delivery.rows} onTime={report.delivery.onTime} table={report.delivery.table} months={months} periodMonths={periodMonths} />
      </ReportSection>

      <ReportSection id="workload" title="Workload" description={`A snapshot of open work on ${formatDate(report.today)}, whatever period the report covers.`}>
        <WorkloadSection
          total={report.workload.total}
          statuses={report.workload.statuses}
          statusCounts={report.workload.statusCounts}
          priorityCounts={report.workload.priorityCounts}
          openByTrack={report.workload.openByTrack}
          overdue={report.workload.overdue}
          dueSoon={report.workload.dueSoon}
          unassigned={report.workload.unassigned}
        />
      </ReportSection>

      <ReportSection id="categories" title="Service categories" description={`${plural(report.scopeCount, "assignment")} active in the period, by service line.`}>
        <CategoriesSection rows={report.categories} />
      </ReportSection>

      <ReportSection id="tracks" title="Research tracks" description="Corporate research against academic research support.">
        <TracksSection tracks={report.tracks} levels={report.levels} />
      </ReportSection>

      <ReportSection id="clients" title="Clients" description="Who the work was for, and who still owes fees.">
        <ClientsSection top={report.topClients} outstanding={report.outstandingByClient} today={report.today} />
      </ReportSection>

      <ReportSection id="team" title="Team" description="Each employee's figures for the period. Scores use the same rules as the performance page.">
        <TeamSection rows={report.team} hasEmployees={report.hasEmployees} performanceHref={`/performance?${keepQuery(preset, period)}`} />
      </ReportSection>

      <ReportSection id="payments" title="Payments" description="Fees agreed, received and still to collect.">
        <PaymentsSection rows={report.payments} count={report.billableCount} />
      </ReportSection>

      <div className="no-print">
        <ReportSection id="exports" title="Exports" description="The records behind this report, as spreadsheets for the same period.">
          <ExportPanel period={period} />
        </ReportSection>
      </div>

      <p className="mt-10 hidden border-t border-mist pt-3 text-xs text-slate print:block">
        {organisation.name}, {organisation.city}. Confidential management information from the {organisation.system}. Figures as recorded on{" "}
        {formatDate(report.today)}.
      </p>
    </div>
  );
}
