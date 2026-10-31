import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { StatusBadge, TrackBadge, PriorityBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { describeDue } from "@/lib/format";
import { isOpenStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/lib/types";

export type PersonLite = { uid: string; name: string; photoVersion?: string | null };

/** Stacked avatars for the people on an assignment. */
export function AssigneeStack({ ids, people, size = "xs" }: { ids: string[]; people: Map<string, PersonLite>; size?: "xs" | "sm" }) {
  return (
    <span className="flex -space-x-1.5">
      {ids.slice(0, 4).map((uid) => {
        const person = people.get(uid);
        return (
          <span key={uid} title={person?.name ?? "Former staff member"}>
            <Avatar name={person?.name ?? "?"} uid={uid} photoVersion={person?.photoVersion} size={size} />
          </span>
        );
      })}
    </span>
  );
}

export function DueLabel({ assignment, className }: { assignment: Pick<Assignment, "dueDate" | "status">; className?: string }) {
  if (!isOpenStatus(assignment.status)) return null;
  const due = describeDue(assignment.dueDate);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        due.tone === "danger" ? "text-danger" : due.tone === "warning" ? "text-warning" : "text-slate",
        className,
      )}
    >
      <CalendarClock className="size-3.5" aria-hidden="true" />
      {due.label}
    </span>
  );
}

/**
 * Compact assignment rows for dashboards, profiles and client pages.
 * For the full, filterable table use the Assignments page.
 */
export function AssignmentList({
  assignments,
  people,
  showAssignees = true,
  showClient = true,
  empty = "No assignments here.",
  compact = false,
}: {
  assignments: Assignment[];
  people: Map<string, PersonLite>;
  showAssignees?: boolean;
  showClient?: boolean;
  empty?: string;
  compact?: boolean;
}) {
  if (!assignments.length) return <EmptyState title={empty} className="py-8" />;
  return (
    <ul className="divide-y divide-mist">
      {assignments.map((assignment) => (
        <li key={assignment.id}>
          <Link href={`/assignments/${assignment.id}`} className="group flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-cloud/70 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="tabular text-xs font-semibold text-slate">{assignment.ref}</span>
                {!compact && <TrackBadge track={assignment.track} short />}
                {assignment.priority === "urgent" || assignment.priority === "high" ? <PriorityBadge priority={assignment.priority} /> : null}
              </div>
              <p className="mt-1 truncate font-semibold text-navy group-hover:text-blue">{assignment.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate">
                {assignment.categoryName}
                {showClient && assignment.clientName ? ` · ${assignment.clientName}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3 sm:w-[19rem] sm:justify-end">
              <div className="w-28">
                <ProgressBar value={assignment.progress} size="sm" showValue tone={assignment.status === "completed" ? "good" : "blue"} label={`${assignment.title} progress`} />
              </div>
              <div className="flex flex-col items-start gap-1 sm:items-end">
                <StatusBadge status={assignment.status} />
                <DueLabel assignment={assignment} />
              </div>
              {showAssignees && <AssigneeStack ids={assignment.assigneeIds} people={people} />}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
