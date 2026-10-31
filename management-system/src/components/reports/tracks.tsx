import { GraduationCap, Scale } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap } from "@/components/ui/misc";
import { seriesColor } from "@/components/charts/scale";
import { PanelHeader, keepTogether, reportCard } from "@/components/reports/panel";
import { SplitBar } from "@/components/reports/split-bar";
import { formatKpi, type KpiFormat } from "@/components/reports/kpi-tile";
import { TRACK_LABELS, TRACK_SERIES, type AcademicLevel, type Track } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { cn, sum } from "@/lib/utils";
import type { DeliverySummary } from "@/components/reports/scope";

export type TrackRow = DeliverySummary & { track: Track; share: number };
export type LevelRow = { level: AcademicLevel | "Not recorded"; active: number; completed: number; revenue: number };

const MEASURES: { key: keyof DeliverySummary; label: string; format: KpiFormat; note?: string }[] = [
  { key: "active", label: "Active in period", format: "count" },
  { key: "created", label: "New assignments", format: "count" },
  { key: "completed", label: "Completed", format: "count" },
  { key: "onTimeRate", label: "On-time rate", format: "percent", note: "Of dated deliveries" },
  { key: "avgQuality", label: "Average quality", format: "rating" },
  { key: "avgTurnaround", label: "Average turnaround", format: "days", note: "Start to completion" },
  { key: "revenue", label: "Revenue", format: "money", note: "Completed in period" },
  { key: "hours", label: "Hours logged", format: "hours", note: "Against assignments" },
  { key: "openNow", label: "Open today", format: "count" },
  { key: "outstanding", label: "Outstanding fees", format: "money", note: "Owed on completed work" },
];

/** Corporate and academic research side by side, then academic work by level of study. */
export function TracksSection({ tracks, levels }: { tracks: TrackRow[]; levels: LevelRow[] }) {
  const revenue = sum(tracks.map((row) => row.revenue));
  return (
    <div className="grid items-start gap-6 xl:grid-cols-5">
      <Card className={cn(reportCard, "xl:col-span-3")}>
        <PanelHeader icon={<Scale aria-hidden="true" />} title="Corporate and academic compared" description="The same measures for each research track." />
        <TableWrap>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Measure</th>
                {tracks.map((row) => (
                  <th key={row.track} scope="col" className="text-right">
                    {row.track === "academic" ? "Academic" : "Corporate"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEASURES.map((measure) => (
                <tr key={measure.key}>
                  <td>
                    <p className="font-semibold text-navy">{measure.label}</p>
                    {measure.note && <p className="text-xs text-slate">{measure.note}</p>}
                  </td>
                  {tracks.map((row) => (
                    <td key={row.track} className="tabular text-right whitespace-nowrap">
                      {measure.format === "money" ? formatMoney(row[measure.key] as number) : formatKpi(row[measure.key], measure.format, "No data")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <CardBody className="border-t border-mist">
          <p className="mb-3 text-xs font-semibold tracking-wide text-slate uppercase">Share of revenue in the period</p>
          {revenue > 0 ? (
            <SplitBar
              title="Revenue by track"
              parts={tracks.map((row) => ({
                label: TRACK_LABELS[row.track],
                value: row.revenue,
                display: `${formatMoney(row.revenue, { compact: true })} (${Math.round(row.share * 100)}%)`,
                color: seriesColor(TRACK_SERIES[row.track]),
              }))}
            />
          ) : (
            <p className="text-sm text-slate">No fees were earned on completed work in this period.</p>
          )}
        </CardBody>
      </Card>

      <Card className={cn(reportCard, keepTogether, "xl:col-span-2")}>
        <PanelHeader
          icon={<GraduationCap aria-hidden="true" />}
          title="Academic work by level"
          description="Active academic assignments in the period, by the client's level of study."
        />
        {levels.length ? (
          <TableWrap>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Level</th>
                  <th scope="col" className="text-right">
                    Active
                  </th>
                  <th scope="col" className="text-right">
                    Done
                  </th>
                  <th scope="col" className="text-right">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {levels.map((row) => (
                  <tr key={row.level}>
                    <td className={cn("font-semibold", row.level === "Not recorded" ? "text-slate" : "text-navy")}>{row.level}</td>
                    <td className="tabular text-right">{row.active}</td>
                    <td className="tabular text-right">{row.completed}</td>
                    <td className="tabular text-right whitespace-nowrap">{formatMoney(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <EmptyState icon={<GraduationCap aria-hidden="true" />} title="No academic work in this period" className="py-10" />
        )}
      </Card>
    </div>
  );
}
