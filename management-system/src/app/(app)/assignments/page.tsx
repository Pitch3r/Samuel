import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Download, Hourglass, Plus, RotateCcw, SearchX } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listCategories } from "@/lib/data/categories";
import { listUsers } from "@/lib/data/users";
import { ASSIGNMENT_STATUSES, isOpenStatus } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import { isOverdue } from "@/lib/metrics";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { AssignmentList } from "@/components/assignments/assignment-list";
import { AssignmentTable } from "@/components/assignments/assignment-table";
import { AssignmentBoard } from "@/components/assignments/assignment-board";
import { FilterBar, StatusChips, ViewToggle, type StatusCounts } from "@/components/assignments/assignment-toolbar";
import { toPeopleMap } from "@/components/assignments/people";
import {
  assignmentsHref,
  filterAssignments,
  hasActiveFilters,
  parseFilters,
  sortAssignments,
  sortHref,
  type SortKey,
} from "@/components/assignments/filters";
import type { Assignment } from "@/lib/types";

export const metadata: Metadata = { title: "Assignments" };

const SORT_LABELS: Record<SortKey, string> = {
  due: "due date",
  ref: "reference",
  title: "title",
  priority: "priority",
  status: "status",
  progress: "progress",
  fee: "fee",
  updated: "last update",
};

function countStatuses(assignments: Assignment[], today: string): StatusCounts {
  const counts = Object.fromEntries(ASSIGNMENT_STATUSES.map((status) => [status, 0])) as StatusCounts;
  counts.all = assignments.length;
  counts.open = 0;
  counts.overdue = 0;
  for (const assignment of assignments) {
    counts[assignment.status] += 1;
    if (isOpenStatus(assignment.status)) counts.open += 1;
    if (isOverdue(assignment, today)) counts.overdue += 1;
  }
  return counts;
}

export default async function AssignmentsPage(props: PageProps<"/assignments">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  let filters = parseFilters(params, viewer.isAdmin);

  const [assignments, categories, users] = await Promise.all([
    listAssignmentsFor(viewer),
    listCategories({ includeInactive: true }),
    listUsers(),
  ]);
  const people = toPeopleMap(users);

  // A category that does not exist, or belongs to the other track, would hide everything.
  const chosen = categories.find((category) => category.id === filters.category);
  if (filters.category && (!chosen || (filters.track && chosen.track !== filters.track))) filters = { ...filters, category: "" };

  const today = todayISO();
  const withoutStatus = filterAssignments(assignments, filters, { ignoreStatus: true, today });
  const counts = countStatuses(withoutStatus, today);
  const visible = sortAssignments(filterAssignments(withoutStatus, filters, { today }), filters.sort, filters.dir);

  const awaitingReview = assignments.filter((assignment) => assignment.status === "under_review").length;
  const needRevision = assignments.filter((assignment) => assignment.status === "revision").length;
  const filtered = hasActiveFilters(filters);
  const clearHref = assignmentsHref(filters, { q: "", status: "", track: "", category: "", assignee: "", priority: "", due: "" });
  const sortLinks = Object.fromEntries(
    (["ref", "title", "priority", "status", "progress", "due", "fee"] as SortKey[]).map((key) => [key, sortHref(filters, key)]),
  );

  const empty = !assignments.length ? (
    viewer.isAdmin ? (
      <EmptyState
        icon={<ClipboardList aria-hidden="true" />}
        title="No assignments yet"
        description="Create the first assignment to start tracking the work, its progress, files and payment."
        action={
          <ButtonLink href="/assignments/new">
            <Plus aria-hidden="true" />
            New assignment
          </ButtonLink>
        }
      />
    ) : (
      <EmptyState
        icon={<ClipboardList aria-hidden="true" />}
        title="Nothing has been assigned to you yet"
        description="When the administrator gives you an assignment it appears here, and you get a notification."
      />
    )
  ) : !visible.length ? (
    <EmptyState
      icon={<SearchX aria-hidden="true" />}
      title="No assignments match these filters"
      description="Try a different search, or clear the filters to see everything again."
      action={
        <ButtonLink href={clearHref} variant="secondary">
          Clear filters
        </ButtonLink>
      }
    />
  ) : null;

  return (
    <>
      <PageHeader
        title="Assignments"
        description={
          viewer.isAdmin
            ? "Every corporate and academic research assignment, from brief to delivery. Open a record to manage progress, files, review and payment."
            : "These are the assignments given to you. Open one to update progress, tick off milestones, share files and submit your work for review."
        }
        actions={
          viewer.isAdmin ? (
            <>
              {/* A plain download link: the CSV comes from a route handler, not a page. */}
              <a href="/api/export/assignments" download className={buttonClasses({ variant: "secondary" })}>
                <Download aria-hidden="true" />
                Export CSV
              </a>
              <ButtonLink href="/assignments/new">
                <Plus aria-hidden="true" />
                New assignment
              </ButtonLink>
            </>
          ) : undefined
        }
      />

      <div className="space-y-5">
        {params.deleted === "1" && <Callout tone="success" title="Assignment deleted" />}
        {viewer.isAdmin && awaitingReview > 0 && filters.status !== "under_review" && (
          <Callout
            title={`${plural(awaitingReview, "assignment is", "assignments are")} waiting for your review`}
            action={
              <ButtonLink href={assignmentsHref(filters, { status: "under_review" })} size="sm" variant="secondary">
                <Hourglass aria-hidden="true" />
                Review now
              </ButtonLink>
            }
          >
            Approve the work with a quality rating, or send it back with notes.
          </Callout>
        )}
        {!viewer.isAdmin && needRevision > 0 && filters.status !== "revision" && (
          <Callout
            tone="warning"
            title={`${plural(needRevision, "assignment needs", "assignments need")} revisions`}
            action={
              <ButtonLink href={assignmentsHref(filters, { status: "revision" })} size="sm" variant="secondary">
                <RotateCcw aria-hidden="true" />
                Show them
              </ButtonLink>
            }
          >
            The administrator has returned work with notes. Open it to see what needs to change.
          </Callout>
        )}

        <StatusChips filters={filters} counts={counts} />

        <Card>
          <div className="border-b border-mist p-4">
            <FilterBar
              filters={filters}
              categories={categories}
              people={users.map((user) => ({ uid: user.uid, name: user.role === "admin" ? `${user.displayName} (administrator)` : user.displayName }))}
              isAdmin={viewer.isAdmin}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <p className="text-sm text-slate" aria-live="polite">
              {filtered ? (
                <>
                  Showing <strong className="font-semibold text-navy">{visible.length}</strong> of {plural(assignments.length, "assignment")}
                  {" · "}
                  <Link href={clearHref} className="font-semibold text-blue hover:underline">
                    Clear filters
                  </Link>
                </>
              ) : (
                <>
                  <strong className="font-semibold text-navy">{plural(visible.length, "assignment")}</strong>
                  {filters.view === "table" ? `, sorted by ${SORT_LABELS[filters.sort]}` : ". Scroll sideways to see every column."}
                </>
              )}
            </p>
            <ViewToggle filters={filters} />
          </div>

          {empty ? (
            <div className="border-t border-mist">{empty}</div>
          ) : filters.view === "table" ? (
            <>
              <div className="hidden border-t border-mist xl:block">
                <AssignmentTable
                  assignments={visible}
                  people={people}
                  isAdmin={viewer.isAdmin}
                  sort={filters.sort}
                  dir={filters.dir}
                  sortLinks={sortLinks}
                />
              </div>
              <div className="border-t border-mist xl:hidden">
                <AssignmentList assignments={visible} people={people} />
              </div>
            </>
          ) : null}
        </Card>

        {!empty && filters.view === "board" && (
          <AssignmentBoard
            assignments={visible}
            people={people}
            completedHref={assignmentsHref(filters, { view: "table", status: "completed" })}
          />
        )}
        {!empty && filters.view === "board" && counts.cancelled > 0 && filters.status !== "cancelled" && (
          <p className="text-xs text-slate">
            Cancelled assignments are not shown on the board.{" "}
            <Link href={assignmentsHref(filters, { view: "table", status: "cancelled" })} className="font-semibold text-blue hover:underline">
              See {plural(counts.cancelled, "cancelled assignment")}
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
