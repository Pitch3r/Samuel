import { ChartColumn } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { BarChart, type BarRow, type BarSeries } from "@/components/charts/bar-chart";
import { TRACK_LABELS, TRACK_SERIES } from "@/lib/constants";
import { formatMonthShort } from "@/lib/format";
import { monthlySeries } from "@/lib/metrics";
import { sum } from "@/lib/utils";
import type { Assignment } from "@/lib/types";

const SERIES: BarSeries[] = [
  { key: "corporate", label: TRACK_LABELS.corporate, slot: TRACK_SERIES.corporate },
  { key: "academic", label: TRACK_LABELS.academic, slot: TRACK_SERIES.academic },
];

/**
 * Completed assignments per month for the last six months, stacked by
 * research track. The chart draws on a fixed canvas, so on phones it scrolls
 * sideways inside the card rather than shrinking its labels.
 */
export function DeliveryChart({ assignments, title = "Completed work" }: { assignments: Assignment[]; title?: string }) {
  const months = monthlySeries(assignments, 6);
  const rows: BarRow[] = months.map((row) => ({
    label: formatMonthShort(row.month),
    values: { corporate: row.corporate, academic: row.academic },
  }));
  const total = sum(months.map((row) => row.completed));
  return (
    <Card>
      <CardHeader
        icon={<ChartColumn aria-hidden="true" />}
        title={title}
        description={`Assignments completed in each of the last six months, by research track. ${total} in total.`}
      />
      <CardBody>
        <div className="-mx-1 min-w-0 overflow-x-auto px-1 pb-1 [&_table.sr-only]:right-0">
          <div className="min-w-[28rem]">
            <BarChart rows={rows} series={SERIES} stacked height={200} title={`${title} per month by research track`} highlightLast />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
