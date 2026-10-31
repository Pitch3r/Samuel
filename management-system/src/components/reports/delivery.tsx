import { ChartColumn, Table2, Timer } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { TableWrap } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart, type BarRow } from "@/components/charts/bar-chart";
import { ChartFrame } from "@/components/reports/chart-scroller";
import { PercentLineChart } from "@/components/reports/charts";
import { Figure, PanelHeader, keepTogether, reportCard } from "@/components/reports/panel";
import { TRACK_LABELS, TRACK_SERIES } from "@/lib/constants";
import { formatMoney, formatPercent } from "@/lib/format";
import { cn, plural, sum } from "@/lib/utils";

export type DeliveryMonth = {
  month: string;
  label: string;
  created: number;
  corporate: number;
  academic: number;
  completed: number;
  onTimeRate: number | null;
  onTime: number;
  timed: number;
  revenue: number;
};

/**
 * Month by month delivery: completed work by track (stacked columns),
 * on-time rate (line), and the same figures as a table.
 */
export function DeliverySection({
  rows,
  onTime,
  table,
  months,
  periodMonths,
}: {
  rows: BarRow[];
  onTime: { label: string; value: number }[];
  table: DeliveryMonth[];
  months: number;
  /** "YYYY-MM" months that fall inside the report period, highlighted in the table. */
  periodMonths: string[];
}) {
  const completed = sum(table.map((row) => row.completed));
  const timed = sum(table.map((row) => row.timed));
  const onTimeOverall = timed ? sum(table.map((row) => row.onTime)) / timed : null;
  const revenue = sum(table.map((row) => row.revenue));
  const created = sum(table.map((row) => row.created));
  return (
    <div className="grid items-start gap-6 xl:grid-cols-5">
      <Card className={cn(reportCard, keepTogether, "xl:col-span-3")}>
        <PanelHeader
          icon={<ChartColumn aria-hidden="true" />}
          title="Assignments completed per month"
          description={`By track, over the last ${months} months to the end of the period.`}
        />
        <CardBody className="pt-5">
          <ChartFrame align="end">
            <BarChart
              title={`Assignments completed per month by track, last ${months} months`}
              rows={rows}
              series={[
                { key: "academic", label: TRACK_LABELS.academic, slot: TRACK_SERIES.academic },
                { key: "corporate", label: TRACK_LABELS.corporate, slot: TRACK_SERIES.corporate },
              ]}
              stacked
              height={240}
            />
          </ChartFrame>
        </CardBody>
        <dl className="grid grid-cols-2 gap-px border-t border-mist bg-mist sm:grid-cols-4">
          <Figure label="Completed" value={completed} sub={`Last ${months} months`} />
          <Figure label="New work" value={created} sub="Assignments opened" />
          <Figure label="On time" value={formatPercent(onTimeOverall, "N/A")} sub={`Of ${plural(timed, "dated delivery", "dated deliveries")}`} />
          <Figure label="Value delivered" value={formatMoney(revenue, { compact: true })} sub="Fees on completed work" />
        </dl>
      </Card>

      <Card className={cn(reportCard, keepTogether, "xl:col-span-2")}>
        <PanelHeader icon={<Timer aria-hidden="true" />} title="On-time delivery by month" description="Share of dated assignments completed by their due date." />
        <CardBody className="pt-5">
          {onTime.length >= 2 ? (
            <ChartFrame minWidth="22rem">
              <PercentLineChart
                title={`On-time delivery rate by month, last ${months} months`}
                labels={onTime.map((point) => point.label)}
                series={[{ key: "onTime", label: "On time", slot: 2, values: onTime.map((point) => point.value) }]}
                height={240}
              />
            </ChartFrame>
          ) : (
            <EmptyState
              icon={<Timer aria-hidden="true" />}
              title="Not enough deliveries to chart"
              description="The trend appears once dated work has been completed in at least two months."
              className="py-10"
            />
          )}
          <p className="mt-3 text-xs text-slate">Months with no dated deliveries are left out rather than shown as zero.</p>
        </CardBody>
      </Card>

      <Card className={cn(reportCard, "xl:col-span-5")}>
        <PanelHeader icon={<Table2 aria-hidden="true" />} title="Monthly figures" description="The numbers behind both charts. Months inside the report period are marked." />
        <TableWrap>
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="text-right">
                  New
                </th>
                <th scope="col" className="text-right">
                  Corporate done
                </th>
                <th scope="col" className="text-right">
                  Academic done
                </th>
                <th scope="col" className="text-right">
                  Total done
                </th>
                <th scope="col" className="text-right">
                  On time
                </th>
                <th scope="col" className="text-right">
                  Fees delivered
                </th>
              </tr>
            </thead>
            <tbody>
              {[...table].reverse().map((row) => {
                const inPeriod = periodMonths.includes(row.month);
                return (
                  <tr key={row.month}>
                    <th scope="row" className={cn("bg-transparent text-sm font-semibold tracking-normal normal-case", inPeriod ? "text-navy" : "text-charcoal")}>
                      {row.label}
                      {inPeriod && <span className="ml-2 rounded-full bg-blue-tint px-2 py-px text-[0.7rem] font-semibold text-blue-dark">In period</span>}
                    </th>
                    <td className="tabular text-right">{row.created}</td>
                    <td className="tabular text-right">{row.corporate}</td>
                    <td className="tabular text-right">{row.academic}</td>
                    <td className="tabular text-right font-semibold text-navy">{row.completed}</td>
                    <td className="tabular text-right">{formatPercent(row.onTimeRate, "None dated")}</td>
                    <td className="tabular text-right">{formatMoney(row.revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </div>
  );
}
