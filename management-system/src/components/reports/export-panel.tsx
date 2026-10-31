import { CalendarCheck, ClipboardList, Clock, Download, FileText, Gauge } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { PanelHeader } from "@/components/reports/panel";
import { EXPORTS, EXPORT_TYPES, exportFilename, exportHref, type ExportType } from "@/components/reports/exports";
import { formatDate } from "@/lib/format";
import type { Period } from "@/lib/metrics";

const ICONS: Record<ExportType, ReactNode> = {
  assignments: <ClipboardList aria-hidden="true" />,
  time: <Clock aria-hidden="true" />,
  reports: <FileText aria-hidden="true" />,
  attendance: <CalendarCheck aria-hidden="true" />,
  performance: <Gauge aria-hidden="true" />,
};

function DownloadLink({ type, period, className }: { type: ExportType; period: Period; className?: string }) {
  return (
    <a
      href={exportHref(type, period)}
      download={exportFilename(type, period)}
      className={buttonClasses({ variant: "secondary", size: "sm", className })}
      aria-label={`Download ${EXPORTS[type].label.toLowerCase()} as CSV`}
    >
      <Download aria-hidden="true" />
      Download CSV
    </a>
  );
}

/**
 * Spreadsheet downloads for the same period as the page. Plain links: the
 * route answers with a CSV attachment, so the browser saves it. "grid" lays
 * the exports out side by side across a full-width card; "list" stacks them
 * for a narrow column.
 */
export function ExportPanel({
  period,
  types = [...EXPORT_TYPES],
  title = "Export to spreadsheet",
  layout = "grid",
}: {
  period: Period;
  types?: ExportType[];
  title?: string;
  layout?: "grid" | "list";
}) {
  return (
    <Card className="no-print min-w-0 overflow-hidden">
      <PanelHeader
        icon={<Download aria-hidden="true" />}
        title={title}
        description={`CSV files for ${formatDate(period.from)} to ${formatDate(period.to)}, ready for Excel or Google Sheets. Dates are in Lusaka time.`}
      />
      {layout === "list" ? (
        <ul className="divide-y divide-mist">
          {types.map((type) => (
            <li key={type} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cloud text-navy [&_svg]:size-4">{ICONS[type]}</span>
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-semibold text-navy">{EXPORTS[type].label}</p>
                <p className="text-[0.8125rem] text-slate">{EXPORTS[type].description}</p>
              </div>
              <DownloadLink type={type} period={period} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-px bg-mist sm:grid-cols-2 xl:grid-cols-5">
          {types.map((type) => (
            <li key={type} className="flex flex-col bg-white px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cloud text-navy [&_svg]:size-4">{ICONS[type]}</span>
                <p className="font-semibold text-navy">{EXPORTS[type].label}</p>
              </div>
              <p className="mt-2 flex-1 text-[0.8125rem] text-slate">{EXPORTS[type].description}</p>
              <DownloadLink type={type} period={period} className="mt-3 self-start" />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
