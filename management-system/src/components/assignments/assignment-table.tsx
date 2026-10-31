import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, CircleCheck } from "lucide-react";
import { PriorityBadge, StatusBadge, TrackBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { TableWrap } from "@/components/ui/misc";
import { AssigneeStack, DueLabel, type PersonLite } from "@/components/assignments/assignment-list";
import { PAYMENT_LABELS } from "@/lib/constants";
import { describeDue, formatDate, formatMoney } from "@/lib/format";
import { dayOf } from "@/lib/metrics";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/lib/types";
import type { SortDir, SortKey } from "@/components/assignments/filters";

type Column = { key: string; label: string; sort?: SortKey; className?: string };

function SortHeader({ column, sort, dir, href }: { column: Column; sort: SortKey; dir: SortDir; href?: string }) {
  if (!column.sort || !href) return <th className={column.className}>{column.label}</th>;
  const active = sort === column.sort;
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className={column.className} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
      <Link href={href} scroll={false} className={cn("group inline-flex items-center gap-1 hover:text-navy", active && "text-navy")}>
        {column.label}
        <Icon className={cn("size-3.5", active ? "text-blue" : "text-slate/50 group-hover:text-slate")} aria-hidden="true" />
        <span className="sr-only">{active ? `, sorted ${dir === "asc" ? "ascending" : "descending"}` : ", sort"}</span>
      </Link>
    </th>
  );
}

/** Due column: the countdown for open work, the finish date for closed work. */
function DueCell({ assignment }: { assignment: Assignment }) {
  if (assignment.status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-good">
        <CircleCheck className="size-3.5" aria-hidden="true" />
        Done {formatDate(dayOf(assignment.completedAt), "")}
      </span>
    );
  }
  if (assignment.status === "cancelled") return <span className="text-xs text-slate">Cancelled</span>;
  // Close dates show a countdown, so add the date itself; later ones already read "Due 12 Dec 2026".
  const soon = assignment.dueDate !== null && (describeDue(assignment.dueDate).days ?? 99) <= 7;
  return (
    <div className="space-y-0.5">
      <DueLabel assignment={assignment} />
      {soon && <span className="tabular block text-xs text-slate">{formatDate(assignment.dueDate)}</span>}
    </div>
  );
}

/** The full assignments table, with sortable headers driven by the URL. */
export function AssignmentTable({
  assignments,
  people,
  isAdmin,
  sort,
  dir,
  sortLinks,
}: {
  assignments: Assignment[];
  people: Map<string, PersonLite>;
  isAdmin: boolean;
  sort: SortKey;
  dir: SortDir;
  sortLinks: Partial<Record<SortKey, string>>;
}) {
  const columns: Column[] = [
    { key: "title", label: "Assignment", sort: "ref", className: "min-w-[15rem]" },
    { key: "category", label: "Category" },
    { key: "team", label: "Team" },
    { key: "priority", label: "Priority", sort: "priority" },
    { key: "status", label: "Status", sort: "status" },
    { key: "progress", label: "Progress", sort: "progress", className: "w-32" },
    { key: "due", label: "Due", sort: "due" },
    ...(isAdmin ? [{ key: "fee", label: "Fee", sort: "fee" as const, className: "text-right" }] : []),
  ];

  return (
    <TableWrap>
      <table className="data-table [&_td]:px-3 [&_td]:py-3 [&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_th]:px-3 [&_th:first-child]:pl-5 [&_th:last-child]:pr-5">
        <thead>
          <tr>
            {columns.map((column) => (
              <SortHeader key={column.key} column={column} sort={sort} dir={dir} href={column.sort ? sortLinks[column.sort] : undefined} />
            ))}
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => {
            const names = assignment.assigneeIds.map((uid) => people.get(uid)?.name ?? "Former staff member");
            return (
              <tr key={assignment.id}>
                <td>
                  <p className="tabular text-xs font-semibold text-slate">{assignment.ref}</p>
                  <Link href={`/assignments/${assignment.id}`} className="mt-0.5 block font-semibold text-navy hover:text-blue hover:underline">
                    {assignment.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate" title={assignment.tags.length ? `Tags: ${assignment.tags.join(", ")}` : undefined}>
                    {assignment.clientName || "No client"}
                  </p>
                </td>
                <td className="max-w-[11rem]">
                  <div className="flex flex-col items-start gap-1">
                    <TrackBadge track={assignment.track} short />
                    <span className="line-clamp-1 text-xs text-slate" title={assignment.categoryName}>
                      {assignment.categoryName}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2" title={names.join(", ")}>
                    <AssigneeStack ids={assignment.assigneeIds} people={people} />
                    <span className="sr-only">{names.join(", ")}</span>
                  </div>
                </td>
                <td>
                  <PriorityBadge priority={assignment.priority} />
                </td>
                <td>
                  <StatusBadge status={assignment.status} />
                </td>
                <td>
                  <ProgressBar
                    value={assignment.progress}
                    size="sm"
                    showValue
                    tone={assignment.status === "completed" ? "good" : "blue"}
                    label={`${assignment.title} progress`}
                  />
                </td>
                <td className="whitespace-nowrap">
                  <DueCell assignment={assignment} />
                </td>
                {isAdmin && (
                  <td className="text-right whitespace-nowrap">
                    {assignment.fee ? (
                      <>
                        <span className="tabular block font-semibold text-navy">{formatMoney(assignment.fee)}</span>
                        <span className="block text-xs text-slate">{PAYMENT_LABELS[assignment.paymentStatus]}</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate">No fee</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrap>
  );
}
