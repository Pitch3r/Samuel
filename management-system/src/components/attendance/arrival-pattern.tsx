import { formatClock, LATE_AFTER_LABEL, LATE_AFTER_MINUTES, lusakaMinutes, firstSignIn } from "@/components/attendance/stats";
import { WEEKDAYS } from "@/lib/constants";
import { weekdayOf } from "@/lib/format";
import { average } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AttendanceRecord } from "@/lib/types";

/** The scale runs from 06:30 to 10:00, which covers normal arrivals; later times sit at the right edge. */
const SCALE_FROM = 6 * 60 + 30;
const SCALE_TO = 10 * 60;

function position(minutes: number) {
  return ((Math.min(Math.max(minutes, SCALE_FROM), SCALE_TO) - SCALE_FROM) / (SCALE_TO - SCALE_FROM)) * 100;
}

/**
 * Average first sign-in for each working day of the week, as a dot on a
 * morning time scale with the 08:30 cut-off marked. The time is always
 * written beside the dot, so the chart never relies on colour.
 */
export function ArrivalPattern({ records }: { records: AttendanceRecord[] }) {
  const rows = [1, 2, 3, 4, 5].map((day) => {
    const onDay = records.filter((record) => weekdayOf(record.date) === day);
    const avg = average(onDay.map((record) => lusakaMinutes(firstSignIn(record))));
    return { day, label: WEEKDAYS[day]!.slice(0, 3), avg, count: onDay.length };
  });
  const cutoff = position(LATE_AFTER_MINUTES);
  return (
    <figure>
      <figcaption className="sr-only">Average first sign-in time by weekday</figcaption>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.day} className="grid grid-cols-[2.25rem_1fr_3rem] items-center gap-3 text-xs" aria-label={`${WEEKDAYS[row.day]}: ${row.avg === null ? "no sign-ins" : `average ${formatClock(row.avg)} over ${row.count} days`}`}>
            <span className="font-semibold text-slate" aria-hidden="true">
              {row.label}
            </span>
            <span className="relative h-5" aria-hidden="true">
              <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-cloud ring-1 ring-mist ring-inset" />
              <span className="absolute top-0 bottom-0 w-px bg-slate/40" style={{ left: `${cutoff}%` }} />
              {row.avg !== null && (
                <span
                  className={cn(
                    "absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white",
                    row.avg > LATE_AFTER_MINUTES ? "bg-gold-dark" : "bg-navy",
                  )}
                  style={{ left: `${position(row.avg)}%` }}
                />
              )}
            </span>
            <span className={cn("tabular text-right font-semibold", row.avg !== null && row.avg > LATE_AFTER_MINUTES ? "text-warning" : "text-navy")} aria-hidden="true">
              {formatClock(row.avg, "None")}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-[2.25rem_1fr_3rem] gap-3 text-[0.7rem] text-slate" aria-hidden="true">
        <span />
        <span className="relative h-4">
          <span className="absolute left-0">06:30</span>
          <span className="absolute -translate-x-1/2 font-semibold text-navy" style={{ left: `${cutoff}%` }}>
            {LATE_AFTER_LABEL}
          </span>
          <span className="absolute right-0">10:00</span>
        </span>
        <span />
      </div>
    </figure>
  );
}
