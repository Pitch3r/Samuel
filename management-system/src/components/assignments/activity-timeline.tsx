import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, CircleDot, FileText, Flag, MessageSquareText, RotateCcw, Settings2, TrendingUp } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AssignmentUpdate, UpdateKind } from "@/lib/types";

const VISIBLE = 20;

const KIND_STYLE: Record<UpdateKind, { icon: ReactNode; className: string; verb: string }> = {
  comment: { icon: <MessageSquareText aria-hidden="true" />, className: "bg-blue-tint text-blue", verb: "commented" },
  progress: { icon: <TrendingUp aria-hidden="true" />, className: "bg-blue-tint text-blue-dark", verb: "updated progress" },
  status: { icon: <CircleDot aria-hidden="true" />, className: "bg-navy text-white", verb: "changed the status" },
  file: { icon: <FileText aria-hidden="true" />, className: "bg-cloud text-navy ring-1 ring-mist", verb: "updated the files" },
  milestone: { icon: <Flag aria-hidden="true" />, className: "bg-good-tint text-good", verb: "updated a milestone" },
  review: { icon: <BadgeCheck aria-hidden="true" />, className: "bg-good-tint text-good", verb: "reviewed the work" },
  system: { icon: <Settings2 aria-hidden="true" />, className: "bg-cloud text-slate ring-1 ring-mist", verb: "" },
};

/** The text worth showing: automatic "Moved from X to Y" style notes are already told by the badges. */
function noteFor(update: AssignmentUpdate) {
  if (update.kind === "status" && update.fromStatus && update.toStatus) {
    return update.text === `Moved from ${STATUS_LABELS[update.fromStatus]} to ${STATUS_LABELS[update.toStatus]}.` ? "" : update.text;
  }
  if (update.kind === "progress" && update.progress !== null) {
    return update.text === `Progress updated to ${update.progress}%.` ? "" : update.text;
  }
  return update.text;
}

function TimelineItem({ update, now, last }: { update: AssignmentUpdate; now: Date; last: boolean }) {
  const revision = update.kind === "review" && update.toStatus === "revision";
  const style = revision
    ? { ...KIND_STYLE.review, icon: <RotateCcw aria-hidden="true" />, className: "bg-serious-tint text-serious", verb: "returned the work for revision" }
    : update.kind === "review"
      ? { ...KIND_STYLE.review, verb: "approved the work" }
      : KIND_STYLE[update.kind];
  const note = noteFor(update);
  const isComment = update.kind === "comment";

  return (
    <li className={cn("relative flex gap-3.5", !last && "pb-6")}>
      {!last && <span className="absolute top-9 bottom-0 left-[1.0625rem] w-px bg-mist" aria-hidden="true" />}
      <span className={cn("relative z-[1] grid size-[2.125rem] shrink-0 place-items-center rounded-full [&_svg]:size-4", style.className)}>{style.icon}</span>
      <div className="min-w-0 flex-1 pt-1.5">
        <p className="text-sm text-slate">
          <span className="font-semibold text-navy">{update.authorName}</span>
          {style.verb && update.kind !== "system" ? ` ${style.verb}` : ""}
          {update.kind === "progress" && update.progress !== null && (
            <>
              {" to "}
              <span className="tabular font-semibold text-navy">{update.progress}%</span>
            </>
          )}
          <span className="mx-1.5 text-mist" aria-hidden="true">
            |
          </span>
          <time dateTime={update.createdAt} title={formatDateTime(update.createdAt)} className="text-xs">
            {formatRelative(update.createdAt, now)}
          </time>
        </p>
        {(update.kind === "status" || update.kind === "review" || (update.kind === "progress" && update.toStatus)) && update.fromStatus && update.toStatus && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={update.fromStatus} />
            <ArrowRight className="size-3.5 text-slate" aria-label="to" />
            <StatusBadge status={update.toStatus} />
          </p>
        )}
        {note &&
          (isComment || update.kind === "review" || update.kind === "status" || update.kind === "progress" ? (
            <div
              className={cn(
                "prose-plain mt-2 text-sm text-charcoal",
                isComment ? "rounded-xl bg-cloud px-3.5 py-2.5 ring-1 ring-mist" : "border-l-2 border-mist py-0.5 pl-3",
              )}
            >
              {note}
            </div>
          ) : (
            <p className="mt-0.5 text-sm break-words text-charcoal">{note}</p>
          ))}
      </div>
    </li>
  );
}

/** Everything that has happened on the assignment, newest first. */
export function ActivityTimeline({ updates }: { updates: AssignmentUpdate[] }) {
  const now = new Date();
  if (!updates.length) return <p className="py-6 text-center text-sm text-slate">No activity yet.</p>;
  const recent = updates.slice(0, VISIBLE);
  const older = updates.slice(VISIBLE);
  return (
    <div>
      <ol>
        {recent.map((update, index) => (
          <TimelineItem key={update.id} update={update} now={now} last={index === recent.length - 1} />
        ))}
      </ol>
      {older.length > 0 && (
        <details className="group mt-6">
          <summary className="cursor-pointer list-none text-sm font-semibold text-blue hover:underline">
            <span className="group-open:hidden">Show {older.length} earlier updates</span>
            <span className="hidden group-open:inline">Hide earlier updates</span>
          </summary>
          <ol className="mt-6">
            {older.map((update, index) => (
              <TimelineItem key={update.id} update={update} now={now} last={index === older.length - 1} />
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
