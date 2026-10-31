import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { AssigneeStack, DueLabel, type PersonLite } from "@/components/assignments/assignment-list";
import { StatusBadge, TrackBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { Assignment } from "@/lib/types";

/** Submitted work waiting for the administrator, oldest submission first. */
export function ReviewQueue({ items, people }: { items: Assignment[]; people: Map<string, PersonLite> }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<CircleCheck aria-hidden="true" />}
        title="Nothing is waiting for review"
        description="Work your team submits for review will appear here."
        className="py-8"
      />
    );
  }
  return (
    <ul className="divide-y divide-mist">
      {items.map((assignment) => (
        <li key={assignment.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
          <div className="min-w-0 flex-1 basis-56">
            <div className="flex flex-wrap items-center gap-2">
              <span className="tabular text-xs font-semibold text-slate">{assignment.ref}</span>
              <TrackBadge track={assignment.track} short />
            </div>
            <Link href={`/assignments/${assignment.id}`} className="mt-1 block truncate font-semibold text-navy hover:text-blue">
              {assignment.title}
            </Link>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate">
              {assignment.submittedAt && (
                <time dateTime={assignment.submittedAt} title={formatDateTime(assignment.submittedAt)}>
                  Submitted {formatRelative(assignment.submittedAt)}
                </time>
              )}
              <DueLabel assignment={assignment} />
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AssigneeStack ids={assignment.assigneeIds} people={people} size="sm" />
            <ButtonLink href={`/assignments/${assignment.id}`} size="sm">
              Review
            </ButtonLink>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Assignments sent back for revision or past their due date. */
export function FollowUpList({ items, people }: { items: Assignment[]; people: Map<string, PersonLite> }) {
  if (!items.length) {
    return <p className="px-5 pb-5 text-sm text-slate">No revisions outstanding and nothing overdue.</p>;
  }
  return (
    <ul className="divide-y divide-mist">
      {items.map((assignment) => (
        <li key={assignment.id}>
          <Link href={`/assignments/${assignment.id}`} className="group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-cloud/70">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={assignment.status} />
                <DueLabel assignment={assignment} />
              </div>
              <p className="mt-1 truncate text-sm font-semibold text-navy group-hover:text-blue">
                <span className="tabular mr-1.5 text-xs text-slate">{assignment.ref}</span>
                {assignment.title}
              </p>
              {assignment.status === "revision" && assignment.reviewNote && (
                <p className="mt-0.5 line-clamp-1 text-xs text-slate">Note: {assignment.reviewNote}</p>
              )}
            </div>
            <AssigneeStack ids={assignment.assigneeIds} people={people} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
