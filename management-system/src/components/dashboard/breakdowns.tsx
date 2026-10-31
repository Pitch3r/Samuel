import { SegmentedBar } from "@/components/charts/segmented-bar";
import { HBarList } from "@/components/charts/hbar-list";
import { Legend } from "@/components/charts/legend";
import { seriesColor } from "@/components/charts/scale";
import { StatusBadge, TrackBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { STATUS_FILLS } from "@/components/charts/scale";
import { OPEN_STATUSES, STATUS_DESCRIPTIONS, STATUS_LABELS, TRACK_LABELS, TRACK_SERIES, TRACKS, type AssignmentStatus, type Track } from "@/lib/constants";
import { plural } from "@/lib/utils";

/**
 * Open work split by status: one segmented bar, then each status with its
 * badge (icon and label), what it means and how many assignments sit there.
 */
export function StatusBreakdown({ counts, byTrack }: { counts: Record<AssignmentStatus, number>; byTrack: Record<Track, number> }) {
  const total = OPEN_STATUSES.reduce((sum, status) => sum + counts[status], 0);
  return (
    <div>
      <p className="flex items-baseline gap-2">
        <span className="tabular font-display text-3xl leading-none font-bold text-navy">{total}</span>
        <span className="text-sm text-slate">{total === 1 ? "open assignment" : "open assignments"}</span>
      </p>
      <div className="mt-4">
        <SegmentedBar
          title="Open assignments by status"
          height={14}
          parts={OPEN_STATUSES.map((status) => ({ label: STATUS_LABELS[status], value: counts[status], color: STATUS_FILLS[status] }))}
        />
      </div>
      <ul className="mt-4 divide-y divide-mist border-t border-mist">
        {OPEN_STATUSES.map((status) => (
          <li key={status} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <StatusBadge status={status} />
              <p className="mt-1 truncate text-xs text-slate">{STATUS_DESCRIPTIONS[status]}</p>
            </div>
            <span className="tabular shrink-0 text-base font-bold text-navy">{counts[status]}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-mist pt-3 text-sm">
        {TRACKS.map((track) => (
          <span key={track} className="inline-flex items-center gap-2">
            <TrackBadge track={track} short />
            <span className="tabular font-semibold text-navy">{byTrack[track]}</span>
            <span className="sr-only">open in {TRACK_LABELS[track]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export type CategoryRow = { id: string; name: string; track: Track; open: number; completed: number };

/** Busiest service categories (open plus completed), coloured by track. */
export function CategoryBreakdown({ rows }: { rows: CategoryRow[] }) {
  if (!rows.length) {
    return <EmptyState title="No assignments yet" description="Categories fill in as work is assigned." className="py-8" />;
  }
  return (
    <div>
      <Legend className="mb-4" items={TRACKS.map((track) => ({ label: TRACK_LABELS[track], color: seriesColor(TRACK_SERIES[track]) }))} />
      <HBarList
        title="Open and completed assignments by service category"
        items={rows.map((row) => ({
          label: row.name,
          value: row.open + row.completed,
          slot: TRACK_SERIES[row.track],
          hint: `${row.open} open, ${row.completed} done`,
        }))}
      />
      <p className="mt-4 text-xs text-slate">Totals count open and completed assignments; {plural(rows.length, "category", "categories")} shown.</p>
    </div>
  );
}
