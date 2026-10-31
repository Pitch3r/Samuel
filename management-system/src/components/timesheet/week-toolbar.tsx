import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { FilterForm } from "@/components/ui/auto-submit";
import { buttonClasses } from "@/components/ui/button";
import { addDays, formatDate, formatDayMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Builds a timesheet URL, dropping empty values. */
export function timesheetHref(params: { week?: string; uid?: string; date?: string }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const query = search.toString();
  return query ? `/timesheet?${query}` : "/timesheet";
}

/**
 * Previous and next week, a jump back to this week, and (for the
 * administrator) whose timesheet to show.
 */
export function WeekToolbar({
  monday,
  thisMonday,
  uid,
  people,
}: {
  monday: string;
  thisMonday: string;
  uid?: string;
  people?: { uid: string; name: string; suffix?: string }[];
}) {
  const sunday = addDays(monday, 6);
  const isCurrent = monday === thisMonday;
  const canGoForward = monday < thisMonday;
  const nav = "grid size-10 place-items-center rounded-xl border border-mist bg-white text-navy shadow-sm transition-colors hover:bg-cloud";

  return (
    <div className="no-print mb-6 flex flex-col gap-3 rounded-card border border-mist bg-white p-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Link href={timesheetHref({ week: addDays(monday, -7), uid })} className={nav} aria-label="Previous week">
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1 px-1 text-center sm:min-w-56 sm:flex-none">
          <p className="text-[0.7rem] font-semibold tracking-wide text-slate uppercase">{isCurrent ? "This week" : "Week of"}</p>
          <p className="tabular font-display text-[0.95rem] font-bold whitespace-nowrap text-navy">
            {formatDayMonth(monday)} to {formatDate(sunday)}
          </p>
        </div>
        {canGoForward ? (
          <Link href={timesheetHref({ week: addDays(monday, 7), uid })} className={nav} aria-label="Next week">
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className={cn(nav, "pointer-events-none opacity-40")} aria-hidden="true">
            <ChevronRight className="size-4" />
          </span>
        )}
        {!isCurrent && (
          <Link href={timesheetHref({ uid })} className={buttonClasses({ variant: "ghost", size: "sm", className: "ml-1 hidden sm:inline-flex" })}>
            <CalendarDays aria-hidden="true" />
            This week
          </Link>
        )}
      </div>

      {people && (
        <FilterForm className="flex items-center gap-2" action="/timesheet">
          <input type="hidden" name="week" value={monday} />
          <label htmlFor="timesheet-person" className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-slate">
            <Users className="size-4" aria-hidden="true" />
            <span>Showing</span>
          </label>
          <select id="timesheet-person" name="uid" defaultValue={uid ?? "all"} className="field-input h-10 py-0 text-sm sm:w-60">
            <option value="all">All team</option>
            {people.map((person) => (
              <option key={person.uid} value={person.uid}>
                {person.name}
                {person.suffix ? ` ${person.suffix}` : ""}
              </option>
            ))}
          </select>
          <noscript>
            <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              Show
            </button>
          </noscript>
        </FilterForm>
      )}
      {!isCurrent && (
        <Link href={timesheetHref({ uid })} className={buttonClasses({ variant: "secondary", size: "sm", className: "sm:hidden" })}>
          <CalendarDays aria-hidden="true" />
          Back to this week
        </Link>
      )}
    </div>
  );
}
