import Link from "next/link";
import { FilterX, Rows3, Search, SquareKanban } from "lucide-react";
import { FilterForm } from "@/components/ui/auto-submit";
import { buttonClasses } from "@/components/ui/button";
import {
  DUE_FILTERS,
  assignmentsHref,
  hasActiveFilters,
  type AssignmentFilters,
  type SortKey,
  type StatusFilter,
} from "@/components/assignments/filters";
import { PRIORITIES, PRIORITY_LABELS, STATUS_LABELS, TRACKS, TRACK_LABELS, type AssignmentStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export type StatusCounts = { all: number; open: number; overdue: number } & Record<AssignmentStatus, number>;

const CHIP_ORDER: { id: StatusFilter; label: string }[] = [
  { id: "", label: "All" },
  { id: "open", label: "Open" },
  { id: "overdue", label: "Overdue" },
  { id: "not_started", label: STATUS_LABELS.not_started },
  { id: "in_progress", label: STATUS_LABELS.in_progress },
  { id: "under_review", label: STATUS_LABELS.under_review },
  { id: "revision", label: STATUS_LABELS.revision },
  { id: "on_hold", label: STATUS_LABELS.on_hold },
  { id: "completed", label: STATUS_LABELS.completed },
  { id: "cancelled", label: STATUS_LABELS.cancelled },
];

/** One pill per status with its count, respecting every other filter. */
export function StatusChips({ filters, counts }: { filters: AssignmentFilters; counts: StatusCounts }) {
  return (
    <nav aria-label="Filter by status" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1.5 pb-1 sm:w-auto sm:flex-wrap">
        {CHIP_ORDER.map((chip) => {
          const count = chip.id === "" ? counts.all : counts[chip.id];
          const active = filters.status === chip.id;
          // Hide empty closed statuses so the row stays short; the active chip always shows.
          if (!active && count === 0 && (chip.id === "cancelled" || chip.id === "overdue")) return null;
          const urgent = chip.id === "overdue" && count > 0;
          return (
            <li key={chip.id || "all"}>
              <Link
                href={assignmentsHref(filters, { status: chip.id })}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[0.8125rem] font-semibold whitespace-nowrap transition-colors",
                  active
                    ? "border-navy bg-navy text-white"
                    : urgent
                      ? "border-danger/25 bg-danger-tint text-danger hover:border-danger/50"
                      : "border-mist bg-white text-navy hover:border-slate/40 hover:bg-cloud",
                )}
              >
                {chip.label}
                <span
                  className={cn(
                    "tabular rounded-full px-1.5 py-px text-[0.7rem] font-bold",
                    active ? "bg-white/15 text-white" : urgent ? "bg-white text-danger" : "bg-cloud text-slate",
                  )}
                >
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Table or board. */
export function ViewToggle({ filters }: { filters: AssignmentFilters }) {
  const views = [
    { id: "table" as const, label: "Table", icon: Rows3 },
    { id: "board" as const, label: "Board", icon: SquareKanban },
  ];
  return (
    <div className="inline-flex rounded-xl border border-mist bg-cloud p-1" role="group" aria-label="View">
      {views.map((view) => {
        const active = filters.view === view.id;
        const Icon = view.icon;
        return (
          <Link
            key={view.id}
            href={assignmentsHref(filters, { view: view.id })}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors",
              active ? "bg-white text-navy shadow-sm ring-1 ring-mist" : "text-slate hover:text-navy",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}

const SORT_OPTIONS: { id: SortKey; label: string; adminOnly?: boolean }[] = [
  { id: "due", label: "Sort by due date" },
  { id: "priority", label: "Sort by priority" },
  { id: "updated", label: "Recently updated" },
  { id: "progress", label: "Sort by progress" },
  { id: "status", label: "Sort by status" },
  { id: "ref", label: "Newest first" },
  { id: "title", label: "Sort by title" },
  { id: "fee", label: "Sort by fee", adminOnly: true },
];

/**
 * Search, filters and sort. Selects submit as soon as they change; the search
 * box on Enter or the button, so it also works without JavaScript.
 */
export function FilterBar({
  filters,
  categories,
  people,
  isAdmin,
}: {
  filters: AssignmentFilters;
  categories: Pick<Category, "id" | "name" | "track">[];
  people: { uid: string; name: string }[];
  isAdmin: boolean;
}) {
  const visibleCategories = categories.filter((category) => !filters.track || category.track === filters.track);
  const keep: Record<string, string> = {};
  if (filters.status) keep.status = filters.status;
  if (filters.view !== "table") keep.view = filters.view;
  const select = "field-input h-10 py-0 text-sm";

  return (
    <FilterForm className="space-y-2.5">
      {Object.entries(keep).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <label htmlFor="assignment-search" className="sr-only">
            Search assignments
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            id="assignment-search"
            type="search"
            name="q"
            defaultValue={filters.q}
            placeholder="Search by reference, title, client, category or tag"
            className={cn(select, "pl-9")}
          />
        </div>
        <button type="submit" className={buttonClasses({ variant: "secondary", className: "h-10 px-3 sm:px-4" })}>
          <Search aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Search</span>
        </button>
        {hasActiveFilters(filters, { includeStatus: false }) && (
          <Link
            href={assignmentsHref(filters, { q: "", track: "", category: "", assignee: "", priority: "", due: "" })}
            className={buttonClasses({ variant: "ghost", className: "h-10 px-3" })}
            title="Clear filters"
          >
            <FilterX aria-hidden="true" />
            <span className="sr-only lg:not-sr-only">Clear</span>
          </Link>
        )}
      </div>
      <div className={cn("grid grid-cols-2 gap-2.5 md:grid-cols-3", isAdmin ? "xl:grid-cols-6" : "xl:grid-cols-5")}>
        <label className="min-w-0">
          <span className="sr-only">Track</span>
          <select name="track" defaultValue={filters.track} className={select}>
            <option value="">All tracks</option>
            {TRACKS.map((track) => (
              <option key={track} value={track}>
                {TRACK_LABELS[track]}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="sr-only">Category</span>
          <select name="category" defaultValue={filters.category} className={select}>
            <option value="">All categories</option>
            {TRACKS.filter((track) => !filters.track || track === filters.track).map((track) => (
              <optgroup key={track} label={TRACK_LABELS[track]}>
                {visibleCategories
                  .filter((category) => category.track === track)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        {isAdmin && (
          <label className="min-w-0">
            <span className="sr-only">Assigned to</span>
            <select name="assignee" defaultValue={filters.assignee} className={select}>
              <option value="">Everyone</option>
              {people.map((person) => (
                <option key={person.uid} value={person.uid}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="min-w-0">
          <span className="sr-only">Priority</span>
          <select name="priority" defaultValue={filters.priority} className={select}>
            <option value="">Any priority</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="sr-only">Due date</span>
          <select name="due" defaultValue={filters.due} className={select}>
            <option value="">Any due date</option>
            {DUE_FILTERS.map((due) => (
              <option key={due.id} value={due.id}>
                {due.label}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0">
          <span className="sr-only">Sort</span>
          {/* Changing the sort uses that column's natural direction; the table headers can flip it. */}
          <select name="sort" defaultValue={filters.sort} className={select}>
            {SORT_OPTIONS.filter((option) => isAdmin || !option.adminOnly).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </FilterForm>
  );
}
