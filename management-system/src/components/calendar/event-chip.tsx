import Link from "next/link";
import { Flag } from "lucide-react";
import { seriesColor } from "@/components/charts/scale";
import { STATUS_ICON, statusSurface, TONE_SURFACE } from "@/components/calendar/status-style";
import { STATUS_LABELS, TRACK_LABELS, TRACK_SERIES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/components/calendar/model";

/** What a milestone looks like: ticked, late or still to do. */
export function milestoneSurface(event: Pick<CalendarEvent, "done" | "overdue" | "closed">) {
  if (event.done) return TONE_SURFACE.good;
  if (event.overdue) return TONE_SURFACE.danger;
  if (event.closed) return TONE_SURFACE.neutral;
  return { surface: "bg-white ring-mist", icon: "text-navy" };
}

export function milestoneStateLabel(event: Pick<CalendarEvent, "done" | "overdue" | "closed">) {
  if (event.done) return "Milestone done";
  if (event.overdue) return "Milestone overdue";
  if (event.closed) return "Milestone closed";
  return "Milestone";
}

/** Plain-text description used for tooltips and screen readers. */
export function describeEvent(event: CalendarEvent) {
  const what =
    event.kind === "milestone"
      ? `${milestoneStateLabel(event)}: ${event.title} (${event.ref} ${event.assignmentTitle})`
      : `${event.ref} ${event.title}, ${STATUS_LABELS[event.status]}`;
  return `${what}. ${TRACK_LABELS[event.track]}. Due ${formatDate(event.date)}${event.overdue ? ", overdue" : ""}.`;
}

/**
 * Compact calendar chip. The left edge carries the track colour (teal for
 * academic, blue for corporate, as in the charts) and the icon carries the
 * status, so meaning never rests on colour alone.
 */
export function EventChip({ event, muted = false }: { event: CalendarEvent; muted?: boolean }) {
  const isMilestone = event.kind === "milestone";
  const style = isMilestone ? milestoneSurface(event) : statusSurface(event.status);
  const Icon = isMilestone ? Flag : STATUS_ICON[event.status];
  return (
    <Link
      href={`/assignments/${event.assignmentId}`}
      title={describeEvent(event)}
      className={cn(
        "relative flex min-w-0 items-center gap-1 overflow-hidden rounded-md py-[3px] pr-1.5 pl-2 text-[0.71875rem] leading-tight font-semibold text-navy ring-1 ring-inset transition-shadow hover:shadow-card",
        style.surface,
        event.overdue && "ring-danger/55",
        (event.closed || muted) && "opacity-75",
      )}
    >
      <span className="absolute inset-y-0 left-0 w-[3px]" style={{ background: seriesColor(TRACK_SERIES[event.track]) }} aria-hidden="true" />
      <Icon className={cn("size-3 shrink-0", style.icon)} aria-hidden="true" />
      <span className="truncate">{event.title}</span>
      <span className="sr-only">. {describeEvent(event)}</span>
    </Link>
  );
}
