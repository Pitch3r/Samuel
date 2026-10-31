import { EventChip } from "@/components/calendar/event-chip";
import type { CalendarEvent } from "@/components/calendar/model";
import { formatDateLong, isWeekday, todayISO } from "@/lib/format";
import { cn, plural } from "@/lib/utils";

const WEEKDAY_HEADINGS = [
  { short: "Mon", long: "Monday" },
  { short: "Tue", long: "Tuesday" },
  { short: "Wed", long: "Wednesday" },
  { short: "Thu", long: "Thursday" },
  { short: "Fri", long: "Friday" },
  { short: "Sat", long: "Saturday" },
  { short: "Sun", long: "Sunday" },
];

/** How many chips a day shows before folding the rest under "more". */
const VISIBLE_PER_DAY = 3;

/**
 * Month grid, Monday first. Weekends are shaded, today is marked, and days
 * outside the month are dimmed. Busy days fold extra items into a native
 * disclosure, so the grid works without JavaScript.
 */
export function MonthGrid({ month, weeks, byDate }: { month: string; weeks: string[][]; byDate: Map<string, CalendarEvent[]> }) {
  const today = todayISO();
  return (
    <div role="table" aria-label="Month calendar" className="overflow-hidden rounded-b-card">
      <div role="row" className="grid grid-cols-7 border-b border-mist bg-cloud">
        {WEEKDAY_HEADINGS.map((day, i) => (
          <div
            key={day.short}
            role="columnheader"
            aria-label={day.long}
            className={cn("px-2.5 py-2 text-[0.7rem] font-bold tracking-wide text-slate uppercase", i >= 5 && "text-slate/80")}
          >
            {day.short}
          </div>
        ))}
      </div>
      {weeks.map((week) => (
        <div role="row" key={week[0]} className="grid grid-cols-7 border-b border-mist last:border-b-0">
          {week.map((date, i) => {
            const events = byDate.get(date) ?? [];
            const inMonth = date.startsWith(month);
            const isToday = date === today;
            const weekend = !isWeekday(date);
            const shown = events.slice(0, VISIBLE_PER_DAY);
            const hidden = events.slice(VISIBLE_PER_DAY);
            return (
              <div
                role="cell"
                key={date}
                aria-label={`${formatDateLong(date)}${isToday ? ", today" : ""}: ${events.length ? plural(events.length, "item") : "nothing due"}`}
                className={cn(
                  "relative flex min-h-[7.75rem] min-w-0 flex-col gap-1 p-1.5",
                  i < 6 && "border-r border-mist",
                  weekend && "bg-mist/45",
                  !inMonth && (weekend ? "bg-mist/60" : "bg-cloud"),
                  isToday && "bg-blue-tint/50 ring-2 ring-blue ring-inset",
                )}
              >
                <div className="flex items-center justify-between px-1 pt-0.5">
                  <span
                    className={cn(
                      "tabular grid size-6 place-items-center rounded-full text-xs font-bold",
                      isToday ? "bg-navy text-white" : inMonth ? "text-navy" : "text-slate/55",
                    )}
                  >
                    {Number(date.slice(8))}
                  </span>
                  {isToday && <span className="text-[0.65rem] font-bold tracking-wide text-blue-dark uppercase">Today</span>}
                </div>
                <div className={cn("flex min-w-0 flex-col gap-1", !inMonth && "opacity-60")}>
                  {shown.map((event) => (
                    <EventChip key={event.key} event={event} />
                  ))}
                  {hidden.length > 0 && (
                    <details className="group/more">
                      <summary className="cursor-pointer list-none rounded-md px-1.5 py-0.5 text-[0.7rem] font-semibold text-blue-dark hover:bg-blue-tint">
                        <span className="group-open/more:hidden">+{hidden.length} more</span>
                        <span className="hidden group-open/more:inline">Show fewer</span>
                      </summary>
                      <div className="mt-1 flex flex-col gap-1">
                        {hidden.map((event) => (
                          <EventChip key={event.key} event={event} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
