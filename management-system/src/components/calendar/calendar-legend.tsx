import { Flag } from "lucide-react";
import { seriesColor } from "@/components/charts/scale";
import { STATUS_ICON, statusSurface } from "@/components/calendar/status-style";
import { ASSIGNMENT_STATUSES, STATUS_LABELS, TRACK_LABELS, TRACK_SERIES, TRACKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Key for the calendar: track edge colours, status icons and the milestone marker. */
export function CalendarLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 text-xs text-slate", className)}>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Tracks">
        {TRACKS.map((track) => (
          <li key={track} className="inline-flex items-center gap-1.5">
            <span className="h-3 w-[3px] rounded-full" style={{ background: seriesColor(TRACK_SERIES[track]) }} aria-hidden="true" />
            <span className="text-charcoal">{TRACK_LABELS[track]}</span>
          </li>
        ))}
        <li className="inline-flex items-center gap-1.5">
          <Flag className="size-3.5 text-navy" aria-hidden="true" />
          <span className="text-charcoal">Milestone</span>
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-4 rounded-[4px] ring-1 ring-danger/60 ring-inset" aria-hidden="true" />
          <span className="text-charcoal">Overdue</span>
        </li>
      </ul>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5" aria-label="Statuses">
        {ASSIGNMENT_STATUSES.map((status) => {
          const Icon = STATUS_ICON[status];
          return (
            <li key={status} className="inline-flex items-center gap-1">
              <Icon className={cn("size-3.5", statusSurface(status).icon)} aria-hidden="true" />
              <span>{STATUS_LABELS[status]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
