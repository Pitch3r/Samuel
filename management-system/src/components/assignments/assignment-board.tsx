import Link from "next/link";
import { Building2 } from "lucide-react";
import { PriorityBadge, StatusBadge, TrackBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { AssigneeStack, DueLabel, type PersonLite } from "@/components/assignments/assignment-list";
import { STATUS_DESCRIPTIONS, STATUS_LABELS, type AssignmentStatus } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { dayOf } from "@/lib/metrics";
import type { Assignment } from "@/lib/types";

/** Board columns, in workflow order. Cancelled work is left off the board. */
const BOARD_COLUMNS: AssignmentStatus[] = ["not_started", "in_progress", "under_review", "revision", "on_hold", "completed"];
const COMPLETED_LIMIT = 10;

function BoardCard({ assignment, people }: { assignment: Assignment; people: Map<string, PersonLite> }) {
  const done = assignment.status === "completed";
  return (
    <li>
      <Link
        href={`/assignments/${assignment.id}`}
        className="group block rounded-xl border border-mist bg-white p-3.5 shadow-card transition-[box-shadow,border-color] hover:border-blue/30 hover:shadow-lift focus-visible:shadow-lift"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="tabular text-xs font-semibold text-slate">{assignment.ref}</span>
          {(assignment.priority === "urgent" || assignment.priority === "high") && <PriorityBadge priority={assignment.priority} />}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-snug font-semibold text-navy group-hover:text-blue">{assignment.title}</p>
        {assignment.clientName && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate">
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{assignment.clientName}</span>
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <TrackBadge track={assignment.track} short />
        </div>
        <ProgressBar
          className="mt-3"
          value={assignment.progress}
          size="sm"
          showValue
          tone={done ? "good" : "blue"}
          label={`${assignment.title} progress`}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          {done ? (
            <span className="text-xs font-semibold text-good">Completed {formatDate(dayOf(assignment.completedAt), "")}</span>
          ) : (
            <DueLabel assignment={assignment} />
          )}
          <AssigneeStack ids={assignment.assigneeIds} people={people} />
        </div>
      </Link>
    </li>
  );
}

/** Kanban view: one column per workflow status. */
export function AssignmentBoard({
  assignments,
  people,
  completedHref,
}: {
  assignments: Assignment[];
  people: Map<string, PersonLite>;
  /** Link to the table of every completed assignment. */
  completedHref: string;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0" role="region" aria-label="Assignment board" tabIndex={0}>
      <div className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col items-start gap-4">
        {BOARD_COLUMNS.map((status) => {
          let items = assignments.filter((assignment) => assignment.status === status);
          const total = items.length;
          if (status === "completed") {
            items = [...items].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")).slice(0, COMPLETED_LIMIT);
          }
          return (
            <section key={status} aria-label={`${STATUS_LABELS[status]}: ${total}`} className="flex min-h-[12rem] flex-col rounded-card border border-mist bg-cloud/80">
              <header className="flex items-center justify-between gap-2 border-b border-mist px-3.5 py-3">
                <StatusBadge status={status} />
                <span className="tabular rounded-full bg-white px-2 py-0.5 text-xs font-bold text-navy ring-1 ring-mist">{total}</span>
              </header>
              <p className="px-3.5 pt-2.5 text-xs text-slate">{STATUS_DESCRIPTIONS[status]}</p>
              {items.length ? (
                <ul className="flex flex-1 flex-col gap-2.5 p-3">
                  {items.map((assignment) => (
                    <BoardCard key={assignment.id} assignment={assignment} people={people} />
                  ))}
                </ul>
              ) : (
                <p className="m-3 grid flex-1 place-items-center rounded-xl border border-dashed border-mist px-3 py-6 text-center text-xs text-slate">
                  Nothing here
                </p>
              )}
              {status === "completed" && total > COMPLETED_LIMIT && (
                <Link href={completedHref} className="mx-3 mb-3 rounded-lg px-2 py-1.5 text-center text-xs font-semibold text-blue hover:bg-white">
                  See all {total} completed
                </Link>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
