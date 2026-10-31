import Link from "next/link";
import { CircleCheck, FileText, Hourglass, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { REPORT_PERIOD_LABELS } from "@/lib/constants";
import { formatDate, formatDayMonth } from "@/lib/format";
import type { WorkReport } from "@/lib/types";

function periodText(report: WorkReport) {
  return report.periodStart === report.periodEnd ? formatDate(report.periodStart) : `${formatDayMonth(report.periodStart)} to ${formatDate(report.periodEnd)}`;
}

/** Recent daily, weekly and monthly reports with their review state. */
export function ReportList({ reports, empty = "No work reports yet." }: { reports: WorkReport[]; empty?: string }) {
  if (!reports.length) return <EmptyState icon={<FileText aria-hidden="true" />} title={empty} className="py-8" />;
  return (
    <ul className="divide-y divide-mist">
      {reports.map((report) => (
        <li key={report.id}>
          <Link href={`/work-reports/${report.id}`} className="group flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-cloud/70 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate">
                {REPORT_PERIOD_LABELS[report.period]}, {periodText(report)}
              </p>
              <p className="mt-0.5 line-clamp-2 text-sm text-charcoal group-hover:text-navy">{report.summary}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {report.rating !== null && (
                <Badge tone="neutral" icon={<Star aria-hidden="true" />}>
                  {report.rating}/5
                </Badge>
              )}
              {report.status === "reviewed" ? (
                <Badge tone="good" icon={<CircleCheck aria-hidden="true" />}>
                  Reviewed
                </Badge>
              ) : (
                <Badge tone="blue" icon={<Hourglass aria-hidden="true" />}>
                  Awaiting review
                </Badge>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
