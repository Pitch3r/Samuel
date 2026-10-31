import { FilterForm } from "@/components/ui/auto-submit";
import { TRACK_LABELS, TRACKS } from "@/lib/constants";

export type CalendarFilterValues = { month: string; track: string; person: string; show: "all" | "open" };

/** Builds a /calendar link, leaving out empty filters. */
export function calendarHref(values: CalendarFilterValues, patch: Partial<CalendarFilterValues> = {}) {
  const next = { ...values, ...patch };
  const query = new URLSearchParams();
  query.set("month", next.month);
  if (next.track) query.set("track", next.track);
  if (next.person) query.set("person", next.person);
  if (next.show === "open") query.set("show", "open");
  return `/calendar?${query.toString()}`;
}

/** Track, person (administrator only) and open-only filters. Submits on change. */
export function CalendarFilters({ values, people }: { values: CalendarFilterValues; people: { uid: string; name: string }[] | null }) {
  return (
    <FilterForm className="no-print grid grid-cols-2 items-end gap-2 sm:flex sm:flex-wrap">
      <input type="hidden" name="month" value={values.month} />
      <label className="min-w-0 text-xs font-semibold text-slate">
        <span className="mb-1 block">Track</span>
        <select name="track" defaultValue={values.track} className="field-input h-10 w-full py-0 text-sm sm:w-52">
          <option value="">Both tracks</option>
          {TRACKS.map((track) => (
            <option key={track} value={track}>
              {TRACK_LABELS[track]}
            </option>
          ))}
        </select>
      </label>
      {people && (
        <label className="min-w-0 text-xs font-semibold text-slate">
          <span className="mb-1 block">Member of staff</span>
          <select name="person" defaultValue={values.person} className="field-input h-10 w-full py-0 text-sm sm:w-52">
            <option value="">Whole team</option>
            {people.map((person) => (
              <option key={person.uid} value={person.uid}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="min-w-0 text-xs font-semibold text-slate">
        <span className="mb-1 block">Show</span>
        <select name="show" defaultValue={values.show} className="field-input h-10 w-full py-0 text-sm sm:w-56">
          <option value="all">Open and completed</option>
          <option value="open">Open work only</option>
        </select>
      </label>
      <noscript>
        <button type="submit" className="field-input h-10 w-auto">
          Apply
        </button>
      </noscript>
    </FilterForm>
  );
}
