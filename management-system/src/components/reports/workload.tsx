import { Flag, Layers } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { PriorityBadge, StatusBadge, TrackBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { SegmentedBar } from "@/components/charts/segmented-bar";
import { Figure, PanelHeader, keepTogether, reportCard } from "@/components/reports/panel";
import { cn } from "@/lib/utils";
import { STATUS_FILLS } from "@/components/charts/scale";
import { PRIORITIES, STATUS_DESCRIPTIONS, STATUS_LABELS, TRACKS, type AssignmentStatus, type Priority, type Track } from "@/lib/constants";
import { formatPercent } from "@/lib/format";

/**
 * Open work today: split by status (bar plus a labelled list with the
 * status icons) and by priority, with the figures that need attention.
 */
export function WorkloadSection({
  total,
  statuses,
  statusCounts,
  priorityCounts,
  openByTrack,
  overdue,
  dueSoon,
  unassigned,
}: {
  total: number;
  statuses: AssignmentStatus[];
  statusCounts: Record<AssignmentStatus, number>;
  priorityCounts: Record<Priority, number>;
  openByTrack: Record<Track, number>;
  overdue: number;
  dueSoon: number;
  unassigned: number;
}) {
  const priorities = [...PRIORITIES].reverse();
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card className={cn(reportCard, keepTogether)}>
        <PanelHeader icon={<Layers aria-hidden="true" />} title="Open work by status" description="Every assignment that is not completed or cancelled." />
        <CardBody>
          <p className="flex items-baseline gap-2">
            <span className="tabular font-display text-3xl leading-none font-bold text-navy">{total}</span>
            <span className="text-sm text-slate">{total === 1 ? "open assignment" : "open assignments"}</span>
          </p>
          <div className="mt-4 [print-color-adjust:exact]">
            <SegmentedBar
              title="Open assignments by status"
              parts={statuses.map((status) => ({ label: STATUS_LABELS[status], value: statusCounts[status], color: STATUS_FILLS[status] }))}
            />
          </div>
          <ul className="mt-4 divide-y divide-mist border-t border-mist">
            {statuses.map((status) => (
              <li key={status} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <StatusBadge status={status} />
                  <p className="mt-1 truncate text-xs text-slate">{STATUS_DESCRIPTIONS[status]}</p>
                </div>
                <span className="tabular shrink-0 text-base font-bold text-navy">{statusCounts[status]}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card className={cn(reportCard, keepTogether)}>
        <PanelHeader icon={<Flag aria-hidden="true" />} title="Open work by priority" description="How urgent the open work is, and what needs attention." />
        <CardBody>
          <ul className="space-y-4">
            {priorities.map((priority) => {
              const count = priorityCounts[priority];
              return (
                <li key={priority} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3">
                  <PriorityBadge priority={priority} />
                  <ProgressBar
                    value={total ? (count / total) * 100 : 0}
                    tone={priority === "urgent" ? "danger" : priority === "high" ? "warning" : "navy"}
                    label={`${count} ${priority} priority, ${formatPercent(total ? count / total : 0)} of open work`}
                    className="[print-color-adjust:exact]"
                  />
                  <span className="tabular text-right text-sm font-bold text-navy">{count}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-mist pt-4 text-sm">
            {TRACKS.map((track) => (
              <span key={track} className="inline-flex items-center gap-2">
                <TrackBadge track={track} short />
                <span className="tabular font-semibold text-navy">{openByTrack[track]}</span>
                <span className="text-slate">open</span>
              </span>
            ))}
          </div>
        </CardBody>
        <dl className="grid grid-cols-3 gap-px border-t border-mist bg-mist">
          <Figure label="Overdue" value={overdue} tone={overdue ? "danger" : "default"} sub="Past due date" />
          <Figure label="Due in 7 days" value={dueSoon} sub="Including today" />
          <Figure label="Unassigned" value={unassigned} tone={unassigned ? "danger" : "default"} sub={unassigned ? "Needs an owner" : "All have an owner"} />
        </dl>
      </Card>
    </div>
  );
}
