import { CalendarHeatmap } from "@/components/charts/heatmap";
import type { BarSeries } from "@/components/charts/bar-chart";
import { HoursColumns } from "@/components/timesheet/hours-chart";
import { addDays, dateRange, formatDate, formatDayMonth, startOfWeek } from "@/lib/format";
import { round, sum } from "@/lib/utils";
import type { TimeLog } from "@/lib/types";

/** Hours per calendar date. */
export function hoursByDate(logs: TimeLog[]) {
  const values: Record<string, number> = {};
  for (const log of logs) values[log.date] = round((values[log.date] ?? 0) + log.hours, 2);
  return values;
}

/** The twelve Mondays ending with the given week, oldest first. */
export function twelveWeeks(monday: string) {
  return Array.from({ length: 12 }, (_, i) => addDays(monday, (i - 11) * 7));
}

/**
 * Keeps the heatmap's cells a comfortable size: the SVG scales to its box, so
 * the box is capped in proportion to the number of weeks shown.
 */
export function HeatmapBox({ from, to, children }: { from: string; to: string; children: React.ReactNode }) {
  const weeks = Math.ceil((dateRange(startOfWeek(from), to).length || 1) / 7);
  // `relative overflow-hidden` also contains the chart's screen-reader table, which is
  // absolutely positioned and would otherwise widen the page.
  return (
    <div className="relative overflow-hidden" style={{ maxWidth: `${Math.round((30 + weeks * 16) * 1.45)}px` }}>
      {children}
    </div>
  );
}

/** Twelve weeks of daily hours as a calendar heatmap. */
export function HoursHeatmap({ logs, from, to, title, scale = 1 }: { logs: TimeLog[]; from: string; to: string; title: string; scale?: number }) {
  return (
    <HeatmapBox from={from} to={to}>
      <CalendarHeatmap
        values={hoursByDate(logs)}
        from={from}
        to={to}
        title={title}
        unit="h"
        thresholds={[0.01, 2 * scale, 4 * scale, 6 * scale, 8 * scale]}
      />
    </HeatmapBox>
  );
}

/**
 * Weekly totals for the last twelve weeks: one series for a person, or one
 * per employee for the team (slots follow the employee list).
 */
export function WeeklyHoursChart({
  logs,
  monday,
  series,
  title,
}: {
  logs: TimeLog[];
  monday: string;
  series: (BarSeries & { uid: string | null })[];
  title: string;
}) {
  const rows = twelveWeeks(monday).map((weekStart) => {
    const weekEnd = addDays(weekStart, 6);
    const inWeek = logs.filter((log) => log.date >= weekStart && log.date <= weekEnd);
    const values: Record<string, number> = {};
    for (const s of series) values[s.key] = round(sum(inWeek.filter((log) => s.uid === null || log.uid === s.uid).map((log) => log.hours)), 2);
    return { label: formatDayMonth(weekStart), sublabel: `Week of ${formatDate(weekStart)}`, values };
  });
  return (
    <HoursColumns
      rows={rows}
      series={series.map(({ key, label, slot }) => ({ key, label, slot }))}
      title={title}
      height={200}
      highlightLast
    />
  );
}
