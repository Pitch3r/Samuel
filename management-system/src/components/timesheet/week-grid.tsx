import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { ConfirmForm } from "@/components/ui/form";
import { formatDayMonth, formatHours, formatWeekdayShort, isWeekday } from "@/lib/format";
import { cn, round, sum } from "@/lib/utils";
import type { ActionResult, TimeLog } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * Seven days side by side on wide screens, one row per day on narrow ones.
 * Each day lists its entries (assignment or general office work, hours, note)
 * with the day total, and a link to log time for that day.
 */
export function WeekGrid({
  days,
  logs,
  today,
  canDelete,
  deleteAction,
  addHref,
}: {
  days: string[];
  logs: TimeLog[];
  today: string;
  canDelete: (log: TimeLog) => boolean;
  deleteAction: Action;
  addHref: (date: string) => string;
}) {
  return (
    <ol className="grid divide-y divide-mist xl:grid-cols-7 xl:divide-x xl:divide-y-0">
      {days.map((day) => {
        const entries = logs.filter((log) => log.date === day).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const total = round(sum(entries.map((log) => log.hours)), 2);
        const isToday = day === today;
        const future = day > today;
        const weekend = !isWeekday(day);
        return (
          <li
            key={day}
            aria-label={`${formatWeekdayShort(day)} ${formatDayMonth(day)}: ${formatHours(total)}`}
            className={cn("grid grid-cols-[6.5rem_1fr] xl:flex xl:min-h-64 xl:flex-col", weekend && "bg-cloud/60", isToday && "bg-blue-tint/40")}
          >
            <div className={cn("flex flex-col gap-1 border-r border-mist px-3 py-3 xl:border-r-0 xl:border-b", isToday && "xl:border-b-blue/30")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={cn("text-xs font-semibold tracking-wide uppercase", isToday ? "text-blue-dark" : "text-slate")}>
                    {isToday ? "Today" : formatWeekdayShort(day)}
                  </p>
                  <p className="font-display text-sm font-bold text-navy">{formatDayMonth(day)}</p>
                </div>
                {!future && (
                  <Link
                    href={addHref(day)}
                    className="hidden size-7 shrink-0 place-items-center rounded-lg text-slate transition-colors hover:bg-white hover:text-blue xl:grid"
                    aria-label={`Log time on ${formatDayMonth(day)}`}
                    title="Log time on this day"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <p className={cn("tabular text-sm font-semibold", total > 0 ? "text-navy" : "text-slate/70")}>{formatHours(total)}</p>
              {!future && (
                <Link href={addHref(day)} className="text-xs font-semibold text-blue-dark hover:underline xl:hidden">
                  Log time
                </Link>
              )}
            </div>

            <div className="min-w-0 flex-1 px-3 py-3 xl:px-2">
              {entries.length === 0 ? (
                <p className="text-xs text-slate/80">{future ? "Upcoming" : weekend ? "Weekend" : "No time logged"}</p>
              ) : (
                <ul className="space-y-2">
                  {entries.map((log) => (
                    <li key={log.id} className="rounded-lg border border-mist bg-white px-2.5 py-2 shadow-[0_1px_0_rgb(11_36_71/0.03)]">
                      <div className="flex items-baseline justify-between gap-2">
                        {log.assignmentId ? (
                          <Link
                            href={`/assignments/${log.assignmentId}`}
                            className="tabular min-w-0 truncate text-[0.7rem] font-semibold text-slate hover:text-blue"
                            title={`${log.assignmentRef} ${log.assignmentTitle}`}
                          >
                            {log.assignmentRef || "Assignment"}
                          </Link>
                        ) : (
                          <span className="min-w-0 text-xs font-semibold text-navy">General office work</span>
                        )}
                        <span className="tabular shrink-0 text-xs font-bold text-navy">{formatHours(log.hours)}</span>
                      </div>
                      {log.assignmentId && (
                        <p className="mt-0.5 line-clamp-2 text-xs leading-snug font-semibold text-navy" title={log.assignmentTitle}>
                          {log.assignmentTitle}
                        </p>
                      )}
                      {(log.note || canDelete(log)) && (
                        <div className="mt-1 flex items-end justify-between gap-1">
                          <p className="line-clamp-2 min-w-0 text-[0.7rem] leading-snug text-slate">{log.note}</p>
                          {canDelete(log) && (
                            <ConfirmForm
                              action={deleteAction}
                              confirm={`Delete this entry of ${formatHours(log.hours)} on ${formatDayMonth(log.date)}?`}
                              hidden={{ id: log.id }}
                              className="-mr-1 -mb-1 shrink-0"
                            >
                              <button
                                type="submit"
                                title="Delete entry"
                                className="grid size-6 place-items-center rounded-md text-slate/70 transition-colors hover:bg-danger-tint hover:text-danger"
                                aria-label={`Delete ${formatHours(log.hours)} on ${formatDayMonth(log.date)}${log.assignmentRef ? ` for ${log.assignmentRef}` : ""}`}
                              >
                                <Trash2 className="size-3.5" aria-hidden="true" />
                              </button>
                            </ConfirmForm>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
