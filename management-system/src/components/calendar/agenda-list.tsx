import Link from "next/link";
import { CalendarCheck2, Flag } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AssigneeStack, type PersonLite } from "@/components/assignments/assignment-list";
import { seriesColor } from "@/components/charts/scale";
import { STATUS_ICON, statusSurface } from "@/components/calendar/status-style";
import { milestoneStateLabel, milestoneSurface } from "@/components/calendar/event-chip";
import { dayHeading, groupByDate, type CalendarEvent } from "@/components/calendar/model";
import { TRACK_SERIES } from "@/lib/constants";
import { describeDue, formatDayMonth, formatWeekdayShort, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

/** One agenda row: an assignment deadline or a milestone, linking to the assignment. */
export function AgendaItem({ event, people }: { event: CalendarEvent; people?: Map<string, PersonLite> }) {
  const isMilestone = event.kind === "milestone";
  const style = isMilestone ? milestoneSurface(event) : statusSurface(event.status);
  const Icon = isMilestone ? Flag : STATUS_ICON[event.status];
  const due = describeDue(event.date);
  return (
    <li>
      <Link href={`/assignments/${event.assignmentId}`} className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-cloud/70 sm:px-5">
        <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset", style.surface)}>
          <Icon className={cn("size-4", style.icon)} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("line-clamp-2 text-sm leading-snug font-semibold text-navy group-hover:text-blue", event.closed && "text-slate")}>{event.title}</span>
          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate">
            <span className="size-2 shrink-0 rounded-full" style={{ background: seriesColor(TRACK_SERIES[event.track]) }} aria-hidden="true" />
            <span className="tabular shrink-0 font-semibold">{event.ref}</span>
            <span className="truncate">{isMilestone ? `Milestone of ${event.assignmentTitle}` : event.categoryName}</span>
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {isMilestone ? (
              <Badge tone={event.done ? "good" : event.overdue ? "danger" : "neutral"} icon={<Flag aria-hidden="true" />}>
                {milestoneStateLabel(event)}
              </Badge>
            ) : (
              <StatusBadge status={event.status} />
            )}
            {!event.closed && (
              <span className={cn("text-xs font-semibold", due.tone === "danger" ? "text-danger" : due.tone === "warning" ? "text-warning" : "text-slate")}>
                {due.label}
              </span>
            )}
          </span>
        </span>
        {people && <AssigneeStack ids={event.assigneeIds} people={people} />}
      </Link>
    </li>
  );
}

/**
 * Events grouped under day headings. Used for the "Next 14 days" panel, the
 * month view on small screens and the employee dashboard.
 */
export function AgendaList({
  events,
  people,
  empty = "Nothing due in this period.",
  emptyDescription,
  overdueFirst = false,
}: {
  events: CalendarEvent[];
  people?: Map<string, PersonLite>;
  empty?: string;
  emptyDescription?: string;
  /** Collect late items under one "Overdue" heading at the top. */
  overdueFirst?: boolean;
}) {
  const today = todayISO();
  if (!events.length) {
    return <EmptyState icon={<CalendarCheck2 aria-hidden="true" />} title={empty} description={emptyDescription} className="py-10" />;
  }
  const late = overdueFirst ? events.filter((event) => event.overdue) : [];
  const rest = overdueFirst ? events.filter((event) => !event.overdue) : events;
  const groups = [...groupByDate(rest).entries()];
  return (
    <div className="divide-y divide-mist">
      {late.length > 0 && (
        <section aria-label="Overdue">
          <h3 className="flex items-center justify-between gap-2 bg-danger-tint/60 px-4 py-2 text-xs font-bold tracking-wide text-danger uppercase sm:px-5">
            Overdue
            <span className="tabular rounded-full bg-white px-2 py-px text-[0.7rem] text-danger ring-1 ring-danger/20">{late.length}</span>
          </h3>
          <ul className="divide-y divide-mist">
            {late.map((event) => (
              <AgendaItem key={event.key} event={event} people={people} />
            ))}
          </ul>
        </section>
      )}
      {groups.map(([date, items]) => {
        // "Today", "Tomorrow" and "Yesterday" also get the short date beside them.
        const { label, relative } = dayHeading(date, today);
        return (
        <section key={date} aria-label={label}>
          <h3 className={cn("flex items-baseline justify-between gap-2 bg-cloud/80 px-4 py-2 text-xs font-bold text-navy sm:px-5", date === today && "bg-blue-tint")}>
            <span>{label}</span>
            {relative && (
              <span className="font-semibold text-slate">
                {formatWeekdayShort(date)} {formatDayMonth(date)}
              </span>
            )}
          </h3>
          <ul className="divide-y divide-mist">
            {items.map((event) => (
              <AgendaItem key={event.key} event={event} people={people} />
            ))}
          </ul>
        </section>
        );
      })}
    </div>
  );
}
