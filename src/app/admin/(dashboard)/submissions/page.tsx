import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { PageTitle, StatusBadge } from "@/components/admin/ui";
import { listSubmissions, statusLabels, submissionKinds, submissionStatuses } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { kindLabels } from "@/lib/submission-fields";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Submissions" };

type Props = { searchParams: Promise<{ kind?: string; status?: string; q?: string; page?: string; deleted?: string }> };

export default async function SubmissionsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const result = await listSubmissions({ kind: params.kind, status: params.status, q: params.q, page: Number(params.page ?? 1) });

  const query = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { kind: params.kind, status: params.status, q: params.q, ...overrides };
    for (const [key, value] of Object.entries(merged)) if (value) next.set(key, value);
    const text = next.toString();
    return text ? `/admin/submissions?${text}` : "/admin/submissions";
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Submissions"
        description={`${result.total.toLocaleString("en-GB")} ${result.total === 1 ? "submission" : "submissions"} match your filters.`}
        actions={
          <a
            href={`/admin/export/submissions${params.kind ? `?kind=${params.kind}` : ""}`}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-mist bg-white px-4 font-display text-sm font-semibold text-navy hover:border-navy/40"
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      {params.deleted && <p className="rounded-xl bg-teal-tint px-4 py-3 text-sm text-teal-dark">The submission was deleted.</p>}

      <form method="get" className="flex flex-col gap-3 rounded-2xl border border-mist bg-white p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <label htmlFor="q" className="sr-only">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search name, email, organisation or reference"
            className="w-full rounded-xl border border-mist py-2.5 pr-3 pl-10 text-sm focus:border-blue focus:ring-4 focus:ring-blue/15 focus:outline-none"
          />
        </div>
        <label className="sr-only" htmlFor="kind">
          Type
        </label>
        <select id="kind" name="kind" defaultValue={params.kind ?? ""} className="rounded-xl border border-mist px-3 py-2.5 text-sm">
          <option value="">All types</option>
          {submissionKinds.map((kind) => (
            <option key={kind} value={kind}>
              {kindLabels[kind]}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={params.status ?? ""} className="rounded-xl border border-mist px-3 py-2.5 text-sm">
          <option value="">All statuses</option>
          {submissionStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-full bg-navy px-5 font-display text-sm font-semibold text-white hover:bg-navy-soft">
          Apply
        </button>
        {(params.q || params.kind || params.status) && (
          <Link href="/admin/submissions" className="text-sm font-semibold text-slate hover:text-navy">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-2xl border border-mist bg-white">
        {result.rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate">No submissions match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="bg-cloud text-xs text-slate">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Reference</th>
                  <th scope="col" className="px-4 py-3 font-semibold">From</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Subject</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Received</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} className={cn("border-t border-mist hover:bg-cloud/60", row.status === "new" && "bg-gold-tint/40")}>
                    <td className="px-6 py-3 font-mono text-xs text-slate">
                      <Link href={`/admin/submissions/${row.id}`} className="hover:text-blue">
                        {row.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/submissions/${row.id}`} className="font-semibold text-navy hover:text-blue">
                        {row.name}
                      </Link>
                      <p className="text-xs text-slate">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal">{kindLabels[row.kind]}</td>
                    <td className="max-w-[18rem] truncate px-4 py-3 text-charcoal">{row.subject}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={statusLabels[row.status]} />
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {result.pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
          <p className="text-slate">
            Page {result.page} of {result.pages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link href={query({ page: String(result.page - 1) })} className="inline-flex items-center gap-1 rounded-full border border-mist bg-white px-4 py-2 font-semibold text-navy">
                <ChevronLeft className="size-4" aria-hidden="true" /> Previous
              </Link>
            )}
            {result.page < result.pages && (
              <Link href={query({ page: String(result.page + 1) })} className="inline-flex items-center gap-1 rounded-full border border-mist bg-white px-4 py-2 font-semibold text-navy">
                Next <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
