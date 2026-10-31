import Link from "next/link";
import { ArrowRight, Clock, MessageSquareQuote } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PeriodBadge, ReportStatusBadge, Stars } from "@/components/work-reports/report-badges";
import { rangeLabel } from "@/components/work-reports/periods";
import { formatDateTime, formatHours, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { REPORT_PERIOD_LABELS } from "@/lib/constants";
import type { WorkReport } from "@/lib/types";
import type { PersonLite } from "@/components/assignments/assignment-list";

/**
 * One report per row: type and dates, author (for the administrator), an
 * excerpt of the summary, hours and the review state. Reports waiting for the
 * administrator carry a blue edge so they stand out in a long list.
 */
export function ReportRows({
  reports,
  people,
  showAuthor,
  highlightAwaiting,
}: {
  reports: WorkReport[];
  people: Map<string, PersonLite>;
  showAuthor: boolean;
  highlightAwaiting: boolean;
}) {
  return (
    <ul className="divide-y divide-mist">
      {reports.map((report) => {
        const person = people.get(report.uid);
        const awaiting = report.status === "submitted";
        return (
          <li key={report.id} className="relative">
            {highlightAwaiting && awaiting && <span className="absolute inset-y-0 left-0 w-1 bg-blue" aria-hidden="true" />}
            <Link
              href={`/work-reports/${report.id}`}
              className={cn(
                "group flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-cloud/70 sm:flex-row sm:items-start sm:gap-4",
                highlightAwaiting && awaiting && "bg-blue-tint/25",
              )}
            >
              {showAuthor && (
                <Avatar name={report.authorName} uid={person ? report.uid : undefined} photoVersion={person?.photoVersion} size="md" className="hidden sm:inline-grid" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <PeriodBadge period={report.period} />
                  <span className="font-display font-bold text-navy group-hover:text-blue">{rangeLabel(report.periodStart, report.periodEnd)}</span>
                </div>
                <p className="mt-1 text-xs text-slate">
                  {showAuthor && <span className="font-semibold text-charcoal">{report.authorName}</span>}
                  {showAuthor ? ", submitted " : "Submitted "}
                  <time dateTime={report.createdAt} title={formatDateTime(report.createdAt)}>
                    {formatRelative(report.createdAt)}
                  </time>
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-charcoal">{report.summary}</p>
                {report.feedback && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-slate">
                    <MessageSquareQuote className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                    <span className="line-clamp-1 italic">{report.feedback}</span>
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 sm:w-52 sm:flex-col sm:items-end">
                <ReportStatusBadge status={report.status} />
                {report.rating !== null && <Stars value={report.rating} />}
                <span className="tabular inline-flex items-center gap-1 text-xs font-semibold text-slate">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {report.hours === null ? "Hours not given" : formatHours(report.hours)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Oldest first: the reports the administrator still has to read. */
export function AwaitingReview({ reports, people }: { reports: WorkReport[]; people: Map<string, PersonLite> }) {
  return (
    <ul className="divide-y divide-mist">
      {reports.map((report) => {
        const person = people.get(report.uid);
        return (
          <li key={report.id}>
            <Link href={`/work-reports/${report.id}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-cloud/70">
              <Avatar name={report.authorName} uid={person ? report.uid : undefined} photoVersion={person?.photoVersion} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy group-hover:text-blue">{report.authorName}</p>
                <p className="truncate text-xs text-charcoal">
                  {REPORT_PERIOD_LABELS[report.period]}, {rangeLabel(report.periodStart, report.periodEnd)}
                </p>
                <p className="truncate text-xs text-slate">
                  Sent{" "}
                  <time dateTime={report.createdAt} title={formatDateTime(report.createdAt)}>
                    {formatRelative(report.createdAt)}
                  </time>
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 text-[0.8125rem] font-semibold text-blue-dark">
                Review
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
