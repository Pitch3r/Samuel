/**
 * Filtering, sorting and URL helpers for the Assignments page. Pure functions
 * over assignments that are already loaded (and already scoped to the viewer).
 */

import {
  ASSIGNMENT_STATUSES,
  PRIORITIES,
  PRIORITY_RANK,
  TRACKS,
  isOpenStatus,
  type AssignmentStatus,
  type Priority,
  type Track,
} from "@/lib/constants";
import { addDays, startOfWeek, todayISO } from "@/lib/format";
import { isDueWithin, isOverdue } from "@/lib/metrics";
import type { Assignment } from "@/lib/types";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export type StatusFilter = AssignmentStatus | "open" | "overdue" | "";
export type DueFilter = "overdue" | "this-week" | "next-30" | "";
export type SortKey = "due" | "ref" | "title" | "priority" | "status" | "progress" | "fee" | "updated";
export type SortDir = "asc" | "desc";
export type View = "table" | "board";

export interface AssignmentFilters {
  q: string;
  status: StatusFilter;
  track: Track | "";
  category: string;
  assignee: string;
  priority: Priority | "";
  due: DueFilter;
  view: View;
  sort: SortKey;
  dir: SortDir;
}

export const DUE_FILTERS: { id: Exclude<DueFilter, "">; label: string }[] = [
  { id: "overdue", label: "Overdue" },
  { id: "this-week", label: "Due this week" },
  { id: "next-30", label: "Due in the next 30 days" },
];

const SORT_KEYS: SortKey[] = ["due", "ref", "title", "priority", "status", "progress", "fee", "updated"];

/** The direction a column sorts in when it is first clicked. */
export const DEFAULT_DIR: Record<SortKey, SortDir> = {
  due: "asc",
  ref: "desc",
  title: "asc",
  priority: "asc",
  status: "asc",
  progress: "desc",
  fee: "desc",
  updated: "desc",
};

export const DEFAULT_FILTERS: AssignmentFilters = {
  q: "",
  status: "",
  track: "",
  category: "",
  assignee: "",
  priority: "",
  due: "",
  view: "table",
  sort: "due",
  dir: "asc",
};

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function oneOf<T extends string>(value: string, allowed: readonly T[], fallback: T | ""): T | "" {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Reads the filters from the URL, ignoring anything unexpected. */
export function parseFilters(params: SearchParamsRecord, isAdmin: boolean): AssignmentFilters {
  const sort = (oneOf(first(params.sort), SORT_KEYS, "due") || "due") as SortKey;
  const dir = oneOf(first(params.dir), ["asc", "desc"] as const, "") || DEFAULT_DIR[sort];
  return {
    q: first(params.q).slice(0, 120),
    status: oneOf(first(params.status), [...ASSIGNMENT_STATUSES, "open", "overdue"] as const, ""),
    track: oneOf(first(params.track), TRACKS, ""),
    category: first(params.category).slice(0, 80),
    // Only the administrator can look at other people's work.
    assignee: isAdmin ? first(params.assignee).slice(0, 128) : "",
    priority: oneOf(first(params.priority), PRIORITIES, ""),
    due: oneOf(first(params.due), ["overdue", "this-week", "next-30"] as const, ""),
    view: first(params.view) === "board" ? "board" : "table",
    sort: isAdmin || sort !== "fee" ? sort : "due",
    dir,
  };
}

export function hasActiveFilters(filters: AssignmentFilters, { includeStatus = true } = {}) {
  return Boolean(
    filters.q ||
      filters.track ||
      filters.category ||
      filters.assignee ||
      filters.priority ||
      filters.due ||
      (includeStatus && filters.status),
  );
}

function matchesStatus(assignment: Assignment, status: StatusFilter, today: string) {
  if (!status) return true;
  if (status === "open") return isOpenStatus(assignment.status);
  if (status === "overdue") return isOverdue(assignment, today);
  return assignment.status === status;
}

function matchesDue(assignment: Assignment, due: DueFilter, today: string) {
  if (!due) return true;
  if (due === "overdue") return isOverdue(assignment, today);
  if (due === "next-30") return isDueWithin(assignment, 30, today);
  // This week: from today to the coming Sunday, open work only.
  const endOfWeek = addDays(startOfWeek(today), 6);
  return isOpenStatus(assignment.status) && Boolean(assignment.dueDate && assignment.dueDate >= today && assignment.dueDate <= endOfWeek);
}

function matchesQuery(assignment: Assignment, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [assignment.ref, assignment.title, assignment.clientName, assignment.categoryName, ...assignment.tags].some((value) =>
    value?.toLowerCase().includes(needle),
  );
}

/** Applies every filter. `ignoreStatus` is used to count the status chips. */
export function filterAssignments(
  assignments: Assignment[],
  filters: AssignmentFilters,
  { ignoreStatus = false, today = todayISO() }: { ignoreStatus?: boolean; today?: string } = {},
) {
  return assignments.filter(
    (assignment) =>
      (ignoreStatus || matchesStatus(assignment, filters.status, today)) &&
      (!filters.track || assignment.track === filters.track) &&
      (!filters.category || assignment.categoryId === filters.category) &&
      (!filters.assignee || assignment.assigneeIds.includes(filters.assignee)) &&
      (!filters.priority || assignment.priority === filters.priority) &&
      matchesDue(assignment, filters.due, today) &&
      matchesQuery(assignment, filters.q),
  );
}

const STATUS_ORDER = Object.fromEntries(ASSIGNMENT_STATUSES.map((status, index) => [status, index])) as Record<AssignmentStatus, number>;

/** Text compare with empty values always last, whichever the direction. */
function compareNullable(a: string | number | null, b: string | number | null, dir: SortDir) {
  if (a === b) return 0;
  if (a === null || a === "") return 1;
  if (b === null || b === "") return -1;
  const result = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
  return dir === "asc" ? result : -result;
}

export function sortAssignments(assignments: Assignment[], sort: SortKey, dir: SortDir) {
  const flip = (value: number) => (dir === "asc" ? value : -value);
  const byDue = (a: Assignment, b: Assignment) => {
    // Open work first, by due date; closed work after it, most recently finished first.
    const openA = isOpenStatus(a.status);
    const openB = isOpenStatus(b.status);
    if (openA !== openB) return openA ? -1 : 1;
    if (!openA) return (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt);
    return compareNullable(a.dueDate, b.dueDate, dir);
  };
  const compare: Record<SortKey, (a: Assignment, b: Assignment) => number> = {
    due: byDue,
    ref: (a, b) => flip(a.ref.localeCompare(b.ref, "en-GB", { numeric: true })),
    title: (a, b) => flip(a.title.localeCompare(b.title, "en-GB")),
    priority: (a, b) => flip(PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]),
    status: (a, b) => flip(STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    progress: (a, b) => flip(a.progress - b.progress),
    fee: (a, b) => compareNullable(a.fee, b.fee, dir),
    updated: (a, b) => flip(a.updatedAt.localeCompare(b.updatedAt)),
  };
  return [...assignments].sort((a, b) => compare[sort](a, b) || byDue(a, b) || b.ref.localeCompare(a.ref, "en-GB", { numeric: true }));
}

/** "/assignments?..." for the current filters with some values changed. Defaults are left out of the URL. */
export function assignmentsHref(filters: AssignmentFilters, patch: Partial<AssignmentFilters> = {}) {
  const next = { ...filters, ...patch };
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULT_FILTERS) as (keyof AssignmentFilters)[]) {
    const value = next[key];
    if (!value) continue;
    if (key === "view" && value === "table") continue;
    if (key === "sort" && value === "due") continue;
    if (key === "dir" && value === DEFAULT_DIR[next.sort]) continue;
    params.set(key, value);
  }
  const query = params.toString();
  return query ? `/assignments?${query}` : "/assignments";
}

/** Link for a sortable column header: first click uses the column's natural direction, the next flips it. */
export function sortHref(filters: AssignmentFilters, key: SortKey) {
  const dir: SortDir = filters.sort === key ? (filters.dir === "asc" ? "desc" : "asc") : DEFAULT_DIR[key];
  return assignmentsHref(filters, { sort: key, dir });
}
