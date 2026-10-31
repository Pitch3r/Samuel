import type { Metadata } from "next";
import Link from "next/link";
import { Building, Building2, CircleDollarSign, ClipboardList, FilterX, Plus, Search, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listClients } from "@/lib/data/clients";
import { listAllAssignments } from "@/lib/data/assignments";
import { CLIENT_TYPES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { outstandingFees } from "@/lib/metrics";
import { cn, plural, sum } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { TableWrap } from "@/components/ui/misc";
import { FilterForm } from "@/components/ui/auto-submit";
import { ClientTypeBadge, clientTypeIcon, isAcademicClient } from "@/components/clients/client-type-badge";
import { clientTotals, type ClientTotals } from "@/components/clients/client-totals";
import type { Assignment, Client } from "@/lib/types";

export const metadata: Metadata = { title: "Clients" };

const SORTS = [
  { id: "name", label: "Sort by name" },
  { id: "assignments", label: "Most assignments" },
  { id: "revenue", label: "Highest revenue" },
  { id: "recent", label: "Recently active" },
  { id: "newest", label: "Newest first" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

type Row = { client: Client; totals: ClientTotals };

function sortRows(rows: Row[], sort: SortId) {
  const byName = (a: Row, b: Row) => a.client.name.localeCompare(b.client.name);
  const sorted = [...rows];
  switch (sort) {
    case "assignments":
      return sorted.sort((a, b) => b.totals.count - a.totals.count || byName(a, b));
    case "revenue":
      return sorted.sort((a, b) => b.totals.revenue - a.totals.revenue || byName(a, b));
    case "recent":
      return sorted.sort((a, b) => (b.totals.lastActivity ?? b.client.updatedAt).localeCompare(a.totals.lastActivity ?? a.client.updatedAt));
    case "newest":
      return sorted.sort((a, b) => b.client.createdAt.localeCompare(a.client.createdAt));
    default:
      return sorted.sort(byName);
  }
}

/** Case-insensitive match on the fields people search by. */
function matches(client: Client, query: string) {
  if (!query) return true;
  const haystack = [client.name, client.contactName, client.email, client.phone, client.institution, client.sector, client.address].join(" ").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export default async function ClientsPage(props: PageProps<"/clients">) {
  const viewer = await requireAdmin();
  const params = await props.searchParams;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 100) : "";
  const type = CLIENT_TYPES.find((value) => value === params.type) ?? "";
  const sort: SortId = SORTS.find((option) => option.id === params.sort)?.id ?? "name";

  const [clients, assignments] = await Promise.all([listClients(), listAllAssignments(viewer)]);

  const byClient = new Map<string, Assignment[]>();
  for (const assignment of assignments) {
    if (!assignment.clientId) continue;
    const list = byClient.get(assignment.clientId) ?? [];
    list.push(assignment);
    byClient.set(assignment.clientId, list);
  }
  const all: Row[] = clients.map((client) => ({ client, totals: clientTotals(byClient.get(client.id) ?? []) }));
  const rows = sortRows(
    all.filter((row) => (!type || row.client.type === type) && matches(row.client, q)),
    sort,
  );
  const filtered = Boolean(q || type);

  const linked = assignments.filter((assignment) => assignment.clientId && byClient.has(assignment.clientId));
  const academic = clients.filter((client) => isAcademicClient(client.type)).length;
  const withOpenWork = all.filter((row) => row.totals.open > 0).length;
  const revenue = sum(all.map((row) => row.totals.revenue));
  const outstanding = outstandingFees(linked);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Clients"
        description="The businesses, public bodies, NGOs, institutions and researchers Primeresearch works for, with their assignments and fees."
        actions={
          <ButtonLink href="/clients/new">
            <Plus aria-hidden="true" />
            New client
          </ButtonLink>
        }
      />

      {params.deleted === "1" && (
        <Callout tone="success" title="The client has been deleted" className="mb-6">
          Their assignments are kept and still show the client&apos;s name.
        </Callout>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Clients"
          value={clients.length}
          icon={<Building2 aria-hidden="true" />}
          hint={`${clients.length - academic} corporate, ${academic} academic`}
        />
        <StatCard label="With open work" value={withOpenWork} icon={<ClipboardList aria-hidden="true" />} hint="Clients with work in progress" />
        <StatCard label="Revenue from completed work" value={formatMoney(revenue, { compact: true })} icon={<CircleDollarSign aria-hidden="true" />} hint="All time, fees agreed" />
        <StatCard
          label="Outstanding fees"
          value={formatMoney(outstanding, { compact: true })}
          icon={<Wallet aria-hidden="true" />}
          hint="Completed work not yet paid"
          tone={outstanding > 0 ? "warning" : "default"}
        />
      </div>

      <Card className="overflow-hidden">
        <FilterForm className="flex flex-col gap-3 border-b border-mist bg-white p-4 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label htmlFor="client-search" className="field-label">
              Search
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
              <input id="client-search" name="q" type="search" defaultValue={q} placeholder="Name, contact, email or sector" className="field-input pl-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:flex">
            <div className="min-w-0">
              <label htmlFor="client-type" className="field-label">
                Type
              </label>
              <select id="client-type" name="type" defaultValue={type} className="field-input lg:w-60">
                <option value="">All types</option>
                {CLIENT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label htmlFor="client-sort" className="field-label">
                Order
              </label>
              <select id="client-sort" name="sort" defaultValue={sort} className="field-input lg:w-48">
                {SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className={buttonClasses({ variant: "secondary", className: "h-[2.8rem] flex-1 lg:flex-none" })}>
              <Search aria-hidden="true" />
              Search
            </button>
            {filtered && (
              <Link href={sort === "name" ? "/clients" : `/clients?sort=${sort}`} className={buttonClasses({ variant: "ghost", className: "h-[2.8rem]" })}>
                <FilterX aria-hidden="true" />
                Clear
              </Link>
            )}
          </div>
        </FilterForm>

        {clients.length === 0 ? (
          <EmptyState
            icon={<Building aria-hidden="true" />}
            title="No clients yet"
            description="Add the organisations, institutions and researchers you work for, then link assignments to them to track work and fees."
            action={
              <ButtonLink href="/clients/new">
                <Plus aria-hidden="true" />
                New client
              </ButtonLink>
            }
          />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Search aria-hidden="true" />}
            title="No clients match"
            description="Try a different name or type, or clear the filters."
            action={
              <Link href="/clients" className={buttonClasses({ variant: "secondary" })}>
                <FilterX aria-hidden="true" />
                Clear filters
              </Link>
            }
          />
        ) : (
          <>
            <p className="border-b border-mist bg-cloud/60 px-4 py-2 text-xs text-slate" aria-live="polite">
              {filtered ? `${plural(rows.length, "client")} of ${clients.length}` : plural(rows.length, "client")}
            </p>
            <ClientTable rows={rows} />
            <ClientCards rows={rows} />
          </>
        )}
      </Card>
    </div>
  );
}

function ClientTable({ rows }: { rows: Row[] }) {
  return (
    <TableWrap className="hidden md:block">
      <table className="data-table min-w-[64rem]">
        <thead>
          <tr>
            <th scope="col">Client</th>
            <th scope="col">Type</th>
            <th scope="col">Sector</th>
            <th scope="col">Contact</th>
            <th scope="col">Institution</th>
            <th scope="col" className="text-right">
              Assignments
            </th>
            <th scope="col" className="text-right">
              Revenue
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ client, totals }) => (
            <tr key={client.id}>
              <td className="max-w-64">
                <Link href={`/clients/${client.id}`} className="font-semibold text-navy hover:text-blue">
                  {client.name}
                </Link>
                {client.address && <p className="mt-0.5 truncate text-xs text-slate">{client.address}</p>}
              </td>
              <td>
                <ClientTypeBadge type={client.type} />
              </td>
              <td className="max-w-48 text-[0.8125rem] leading-snug text-slate">{client.sector || "Not set"}</td>
              <td className="max-w-60">
                <p className="truncate text-charcoal">{client.contactName || <span className="text-slate">No contact</span>}</p>
                {client.email && (
                  <a href={`mailto:${client.email}`} className="block truncate text-xs text-blue-dark hover:underline">
                    {client.email}
                  </a>
                )}
                {client.phone && <p className="tabular text-xs text-slate">{client.phone}</p>}
              </td>
              <td className="max-w-48 text-[0.8125rem] leading-snug text-slate">{client.institution || "None"}</td>
              <td className="tabular text-right">
                <span className="font-semibold text-navy">{totals.count}</span>
                <p className="text-xs text-slate">{totals.open ? `${totals.open} open` : "None open"}</p>
              </td>
              <td className="tabular text-right font-semibold whitespace-nowrap text-navy">{formatMoney(totals.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrap>
  );
}

/** Small screens: one card per client instead of a wide table. */
function ClientCards({ rows }: { rows: Row[] }) {
  return (
    <ul className="divide-y divide-mist md:hidden">
      {rows.map(({ client, totals }) => (
        <li key={client.id}>
          <Link href={`/clients/${client.id}`} className="flex gap-3 px-4 py-4 transition-colors hover:bg-cloud/70">
            <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5", isAcademicClient(client.type) ? "bg-teal-tint text-teal-dark" : "bg-blue-tint text-blue-dark")}>
              {clientTypeIcon(client.type)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-navy">{client.name}</p>
              <p className="truncate text-xs text-slate">{[client.type, client.sector].filter(Boolean).join(", ")}</p>
              {(client.contactName || client.institution) && <p className="mt-1 truncate text-sm text-charcoal">{client.contactName || client.institution}</p>}
              <p className="tabular mt-1.5 text-xs text-slate">
                <span className="font-semibold text-navy">{plural(totals.count, "assignment")}</span>
                {totals.open ? `, ${totals.open} open` : ""} · {formatMoney(totals.revenue)} completed
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
