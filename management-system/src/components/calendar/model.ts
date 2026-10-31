import { isOpenStatus, PRIORITY_RANK, type AssignmentStatus, type Priority, type Track } from "@/lib/constants";
import { addDays, addMonths, endOfMonth, formatDateLong, startOfWeek, todayISO } from "@/lib/format";
import type { Assignment, ISODate } from "@/lib/types";

/*
 * Calendar events are derived from assignments: one for the assignment's due
 * date and one for each milestone with a due date. Pure functions, so the
 * calendar page and the dashboards share the same rules.
 */

export type CalendarEvent = {
  /** Unique key: `a-<assignmentId>` or `m-<assignmentId>-<milestoneId>`. */
  key: string;
  kind: "assignment" | "milestone";
  date: ISODate;
  assignmentId: string;
  ref: string;
  /** The assignment title, or the milestone title for milestones. */
  title: string;
  assignmentTitle: string;
  categoryName: string;
  track: Track;
  /** The assignment's status (a ticked milestone counts as completed). */
  status: AssignmentStatus;
  priority: Priority;
  assigneeIds: string[];
  /** Finished: a completed assignment or a ticked milestone. */
  done: boolean;
  /** Nothing left to do: done, or the assignment is closed. */
  closed: boolean;
  overdue: boolean;
};

export function eventsFor(assignments: Assignment[], today = todayISO()): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const assignment of assignments) {
    const open = isOpenStatus(assignment.status);
    const base = {
      assignmentId: assignment.id,
      ref: assignment.ref,
      assignmentTitle: assignment.title,
      categoryName: assignment.categoryName,
      track: assignment.track,
      priority: assignment.priority,
      assigneeIds: assignment.assigneeIds,
    };
    if (assignment.dueDate) {
      events.push({
        ...base,
        key: `a-${assignment.id}`,
        kind: "assignment",
        date: assignment.dueDate,
        title: assignment.title,
        status: assignment.status,
        done: assignment.status === "completed",
        closed: !open,
        overdue: open && assignment.dueDate < today,
      });
    }
    for (const milestone of assignment.milestones) {
      if (!milestone.dueDate) continue;
      const closed = milestone.done || !open;
      events.push({
        ...base,
        key: `m-${assignment.id}-${milestone.id}`,
        kind: "milestone",
        date: milestone.dueDate,
        title: milestone.title,
        status: milestone.done ? "completed" : assignment.status,
        done: milestone.done,
        closed,
        overdue: !closed && milestone.dueDate < today,
      });
    }
  }
  return events.sort(compareEvents);
}

/** Date, then open before closed, assignments before milestones, then priority and title. */
export function compareEvents(a: CalendarEvent, b: CalendarEvent) {
  return (
    a.date.localeCompare(b.date) ||
    Number(a.closed) - Number(b.closed) ||
    (a.kind === b.kind ? 0 : a.kind === "assignment" ? -1 : 1) ||
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
    a.title.localeCompare(b.title)
  );
}

export function groupByDate(events: CalendarEvent[]) {
  const map = new Map<ISODate, CalendarEvent[]>();
  for (const event of events) {
    const list = map.get(event.date);
    if (list) list.push(event);
    else map.set(event.date, [event]);
  }
  return map;
}

/* ------------------------------------------------------------------ months */

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** "YYYY-MM" from the query string, or the current month. */
export function parseMonth(value: unknown, today = todayISO()) {
  return typeof value === "string" && MONTH_PATTERN.test(value) ? value : today.slice(0, 7);
}

export function shiftMonth(month: string, by: number) {
  return addMonths(`${month}-01`, by).slice(0, 7);
}

const fmtMonthLong = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

/** "October 2026". */
export function monthLabel(month: string) {
  return fmtMonthLong.format(new Date(`${month}-01T12:00:00Z`));
}

/** Weeks (Monday first) covering the whole month, as lists of seven dates. */
export function monthWeeks(month: string) {
  const first = `${month}-01`;
  const last = endOfMonth(first);
  const weeks: ISODate[][] = [];
  for (let week = startOfWeek(first); week <= last; week = addDays(week, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(week, i)));
  }
  return weeks;
}

/** "Today", "Tomorrow", "Yesterday" (relative: true) or the long date. */
export function dayHeading(date: ISODate, today = todayISO()) {
  if (date === today) return { label: "Today", relative: true };
  if (date === addDays(today, 1)) return { label: "Tomorrow", relative: true };
  if (date === addDays(today, -1)) return { label: "Yesterday", relative: true };
  return { label: formatDateLong(date), relative: false };
}
