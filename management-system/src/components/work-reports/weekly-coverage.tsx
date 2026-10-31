import { Check, Clock3, Minus } from "lucide-react";
import { addDays, formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WorkReport } from "@/lib/types";

export type CoverageState = "covered" | "due" | "missing";

/** The last `count` Mondays, oldest first, ending with this week's. */
export function recentMondays(thisMonday: string, count = 8) {
  return Array.from({ length: count }, (_, i) => addDays(thisMonday, (i - count + 1) * 7));
}

/** Whether any report (daily, weekly or monthly) overlaps the working week starting on `monday`. */
export function weekCovered(reports: Pick<WorkReport, "periodStart" | "periodEnd">[], monday: string) {
  const friday = addDays(monday, 4);
  return reports.some((report) => report.periodStart <= friday && report.periodEnd >= monday);
}

export function coverageState(reports: Pick<WorkReport, "periodStart" | "periodEnd">[], monday: string, today: string): CoverageState {
  if (weekCovered(reports, monday)) return "covered";
  // This week's report is not late until Friday has passed.
  return addDays(monday, 4) >= today ? "due" : "missing";
}

const LABELS: Record<CoverageState, string> = { covered: "Report submitted", due: "Due by Friday", missing: "No report" };

/** A strip of weeks: ticked when a report covers the week. Icons carry the meaning as well as colour. */
export function WeeklyCoverage({ reports, mondays, today, className }: { reports: Pick<WorkReport, "periodStart" | "periodEnd">[]; mondays: string[]; today: string; className?: string }) {
  return (
    <ol className={cn("flex gap-1.5", className)}>
      {mondays.map((monday) => {
        const state = coverageState(reports, monday, today);
        const label = `Week of ${formatDayMonth(monday)}: ${LABELS[state]}`;
        return (
          <li
            key={monday}
            title={label}
            aria-label={label}
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-lg ring-1 ring-inset [&_svg]:size-3.5",
              state === "covered" && "bg-good-tint text-good ring-good/25",
              state === "due" && "bg-blue-tint text-blue-dark ring-blue/20",
              state === "missing" && "bg-cloud text-slate/70 ring-mist",
            )}
          >
            {state === "covered" ? <Check aria-hidden="true" /> : state === "due" ? <Clock3 aria-hidden="true" /> : <Minus aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

/** Key for the coverage strip. */
export function CoverageKey() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate">
      <li className="inline-flex items-center gap-1.5">
        <Check className="size-3.5 text-good" aria-hidden="true" /> Submitted
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Clock3 className="size-3.5 text-blue-dark" aria-hidden="true" /> Due this week
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Minus className="size-3.5 text-slate" aria-hidden="true" /> No report
      </li>
    </ul>
  );
}
