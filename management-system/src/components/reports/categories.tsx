import { Banknote, ChartBar, Shapes } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { TrackBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap } from "@/components/ui/misc";
import { HBarList } from "@/components/charts/hbar-list";
import { Legend } from "@/components/charts/legend";
import { seriesColor } from "@/components/charts/scale";
import { PanelHeader, keepTogether, reportCard } from "@/components/reports/panel";
import { TRACK_LABELS, TRACK_SERIES, TRACKS, type Track } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { cn, sum } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  track: Track;
  active: number;
  created: number;
  completed: number;
  openNow: number;
  revenue: number;
};

const TOP = 8;
const money = (value: number) => formatMoney(value, { compact: true });

function TrackLegend() {
  return <Legend className="mb-4" items={TRACKS.map((track) => ({ label: TRACK_LABELS[track], color: seriesColor(TRACK_SERIES[track]) }))} />;
}

/**
 * Work per service category: the busiest lines and the best earners as
 * ranked bars coloured by track, then a table with every figure.
 */
export function CategoriesSection({ rows }: { rows: CategoryRow[] }) {
  if (!rows.length) {
    return (
      <Card className={reportCard}>
        <EmptyState icon={<Shapes aria-hidden="true" />} title="No work in this period" description="Categories appear once assignments are active in the period." />
      </Card>
    );
  }
  const earners = rows.filter((row) => row.revenue > 0).sort((a, b) => b.revenue - a.revenue);
  const totals = {
    active: sum(rows.map((row) => row.active)),
    created: sum(rows.map((row) => row.created)),
    completed: sum(rows.map((row) => row.completed)),
    openNow: sum(rows.map((row) => row.openNow)),
    revenue: sum(rows.map((row) => row.revenue)),
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card className={cn(reportCard, keepTogether)}>
        <PanelHeader icon={<ChartBar aria-hidden="true" />} title="Busiest service lines" description="Assignments active in the period, with how many were completed." />
        <CardBody>
          <TrackLegend />
          <HBarList
            title="Active assignments by service category"
            className="[print-color-adjust:exact]"
            items={rows.slice(0, TOP).map((row) => ({
              label: row.name,
              value: row.active,
              slot: TRACK_SERIES[row.track],
              hint: `${row.completed} done`,
            }))}
          />
          {rows.length > TOP && (
            <p className="mt-4 text-xs text-slate">
              Top {TOP} of {rows.length} categories. The table below lists them all.
            </p>
          )}
        </CardBody>
      </Card>

      <Card className={cn(reportCard, keepTogether)}>
        <PanelHeader icon={<Banknote aria-hidden="true" />} title="Revenue by service line" description="Fees on work completed in the period." />
        <CardBody>
          {earners.length ? (
            <>
              <TrackLegend />
              <HBarList
                title="Revenue from completed work by service category"
                className="[print-color-adjust:exact]"
                valueFormat={money}
                items={earners.slice(0, TOP).map((row) => ({
                  label: row.name,
                  value: row.revenue,
                  slot: TRACK_SERIES[row.track],
                  hint: `${row.completed} done`,
                }))}
              />
            </>
          ) : (
            <EmptyState icon={<Banknote aria-hidden="true" />} title="No fees earned in this period" description="Revenue appears when work with a fee is completed." className="py-8" />
          )}
        </CardBody>
      </Card>

      <Card className={cn(reportCard, "lg:col-span-2")}>
        <PanelHeader
          icon={<Shapes aria-hidden="true" />}
          title="Assignments by category"
          description="Active means the work was open at some point in the period. Revenue is fees on work completed in the period."
        />
        <TableWrap>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col" className="hidden sm:table-cell">
                  Track
                </th>
                <th scope="col" className="text-right">
                  Active
                </th>
                <th scope="col" className="text-right">
                  New
                </th>
                <th scope="col" className="text-right">
                  Completed
                </th>
                <th scope="col" className="text-right">
                  Open now
                </th>
                <th scope="col" className="text-right">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="min-w-[11rem]">
                    <p className="font-semibold text-navy">{row.name}</p>
                    <div className="mt-1 sm:hidden">
                      <TrackBadge track={row.track} short />
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <TrackBadge track={row.track} short />
                  </td>
                  <td className="tabular text-right font-semibold text-navy">{row.active}</td>
                  <td className="tabular text-right">{row.created}</td>
                  <td className="tabular text-right">{row.completed}</td>
                  <td className="tabular text-right">{row.openNow}</td>
                  <td className={cn("tabular text-right whitespace-nowrap", row.revenue ? "text-charcoal" : "text-slate")}>{formatMoney(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-cloud font-semibold text-navy">
                <th scope="row" className="px-4 py-3 text-left text-sm">
                  All categories
                </th>
                <td className="hidden sm:table-cell" />
                <td className="tabular px-4 py-3 text-right">{totals.active}</td>
                <td className="tabular px-4 py-3 text-right">{totals.created}</td>
                <td className="tabular px-4 py-3 text-right">{totals.completed}</td>
                <td className="tabular px-4 py-3 text-right">{totals.openNow}</td>
                <td className="tabular px-4 py-3 text-right whitespace-nowrap">{formatMoney(totals.revenue)}</td>
              </tr>
            </tfoot>
          </table>
        </TableWrap>
      </Card>
    </div>
  );
}
