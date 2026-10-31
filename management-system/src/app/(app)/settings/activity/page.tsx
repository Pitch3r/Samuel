import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, History, X } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listActivity } from "@/lib/data/activity";
import { peopleMap } from "@/lib/people";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn, plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap } from "@/components/ui/misc";
import { FilterForm } from "@/components/ui/auto-submit";
import { buttonClasses } from "@/components/ui/button";
import {
  ENTITY_ICONS,
  ENTITY_LABELS,
  ENTITY_SINGULAR,
  ENTITY_TYPES,
  activityHref,
  isEntityType,
  type EntityType,
} from "@/components/settings/activity-meta";

export const metadata: Metadata = { title: "Activity log" };

/** How far back the log reads, and how many rows a page shows. */
const LIMIT = 300;
const PAGE_SIZE = 50;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ActivityPage(props: PageProps<"/settings/activity">) {
  await requireAdmin();
  const params = await props.searchParams;
  const type = isEntityType(first(params.type)) ? (first(params.type) as EntityType) : null;
  const actor = first(params.actor)?.slice(0, 128) || null;

  const [entries, people] = await Promise.all([listActivity(LIMIT), peopleMap()]);

  // Actors: everyone with an account, plus anyone named in the log whose account is gone.
  const actors = new Map<string, string>([...people.values()].map((person) => [person.uid, person.name]));
  for (const entry of entries) if (!actors.has(entry.actorId)) actors.set(entry.actorId, entry.actorName);

  const byActor = actor ? entries.filter((entry) => entry.actorId === actor) : entries;
  const filtered = type ? byActor.filter((entry) => entry.entityType === type) : byActor;
  const counts = new Map<EntityType, number>();
  for (const entry of byActor) counts.set(entry.entityType, (counts.get(entry.entityType) ?? 0) + 1);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageNumber = Math.min(Math.max(Number.parseInt(first(params.page) ?? "1", 10) || 1, 1), pages);
  const shown = filtered.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);

  const href = (patch: Record<string, string | null>) => {
    const query = new URLSearchParams();
    const next = { type, actor, page: null as string | null, ...patch };
    for (const [key, value] of Object.entries(next)) if (value) query.set(key, value);
    const text = query.toString();
    return text ? `/settings/activity?${text}` : "/settings/activity";
  };

  const oldest = entries.at(-1);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        back={{ href: "/settings", label: "Settings" }}
        title="Activity log"
        description="The audit trail of the management system: who created, changed, approved or removed what, and when. Entries cannot be edited or deleted."
      />

      <Card className="mb-6 px-5 py-4">
        <FilterForm className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-slate">
            <span className="mb-1 block">Area</span>
            <select name="type" defaultValue={type ?? ""} className="field-input h-10 w-56 py-0 text-sm">
              <option value="">All areas</option>
              {ENTITY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {ENTITY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate">
            <span className="mb-1 block">Person</span>
            <select name="actor" defaultValue={actor ?? ""} className="field-input h-10 w-56 py-0 text-sm">
              <option value="">Everyone</option>
              {[...actors.entries()].map(([uid, name]) => (
                <option key={uid} value={uid}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <noscript>
            <button type="submit" className={buttonClasses({ variant: "secondary" })}>
              Apply
            </button>
          </noscript>
          {(type || actor) && (
            <Link href="/settings/activity" className={buttonClasses({ variant: "ghost" })}>
              <X aria-hidden="true" />
              Clear filters
            </Link>
          )}
        </FilterForm>

        {byActor.length > 0 && (
          <nav aria-label="Areas" className="mt-4 flex flex-wrap gap-1.5 border-t border-mist pt-4">
            {ENTITY_TYPES.filter((value) => counts.get(value)).map((value) => {
              const Icon = ENTITY_ICONS[value];
              const active = type === value;
              return (
                <Link
                  key={value}
                  href={href({ type: active ? null : value })}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-semibold transition-colors",
                    active ? "bg-navy text-white" : "bg-cloud text-slate hover:text-navy",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {ENTITY_LABELS[value]}
                  <span className={cn("tabular text-xs", active ? "text-white/75" : "text-slate/80")}>{counts.get(value)}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </Card>

      <p className="mb-3 text-sm text-slate" aria-live="polite">
        {filtered.length
          ? `Showing ${plural(filtered.length, "entry", "entries")}${type || actor ? " that match" : ""}, newest first.`
          : "No entries match."}
        {entries.length >= LIMIT && oldest && ` The log reads the latest ${LIMIT} entries, back to ${formatDateTime(oldest.at)}.`}
      </p>

      <Card className="overflow-hidden">
        {shown.length === 0 ? (
          <EmptyState
            icon={<History aria-hidden="true" />}
            title={entries.length ? "Nothing matches these filters" : "No activity yet"}
            description={entries.length ? "Try another area or person." : "Actions across the system are recorded here as they happen."}
            action={
              entries.length ? (
                <Link href="/settings/activity" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        ) : (
          <TableWrap className="relative">
            <table className="data-table min-w-[50rem]">
              <thead>
                <tr>
                  <th scope="col" className="w-48">
                    When
                  </th>
                  <th scope="col" className="w-56">
                    Who
                  </th>
                  <th scope="col">What happened</th>
                  <th scope="col" className="w-44">
                    Area
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((entry) => {
                  const Icon = ENTITY_ICONS[entry.entityType] ?? History;
                  const link = activityHref(entry);
                  const person = people.get(entry.actorId);
                  return (
                    <tr key={entry.id}>
                      <td className="text-sm whitespace-nowrap">
                        <time dateTime={entry.at} className="text-charcoal">
                          {formatDateTime(entry.at)}
                        </time>
                        <p className="text-xs text-slate">{formatRelative(entry.at)}</p>
                      </td>
                      <td>
                        <Link
                          href={href({ actor: entry.actorId })}
                          className="flex items-center gap-2.5 hover:text-blue"
                          title={`Only show ${entry.actorName}`}
                        >
                          <Avatar name={entry.actorName} uid={person ? entry.actorId : undefined} photoVersion={person?.photoVersion} size="sm" />
                          <span className="truncate text-sm font-semibold text-navy">{entry.actorName}</span>
                        </Link>
                      </td>
                      <td className="text-sm">
                        {link ? (
                          <Link href={link} className="break-words text-charcoal hover:text-blue hover:underline">
                            {entry.summary}
                          </Link>
                        ) : (
                          <span className="break-words text-charcoal">{entry.summary}</span>
                        )}
                        <p className="mt-0.5 font-mono text-[0.6875rem] text-slate">{entry.action}</p>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1.5 text-sm text-charcoal">
                          <Icon className="size-4 text-slate" aria-hidden="true" />
                          {ENTITY_SINGULAR[entry.entityType] ?? entry.entityType}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        )}
        {pages > 1 && (
          <nav className="flex items-center justify-between gap-3 border-t border-mist px-5 py-3 text-sm" aria-label="Pages">
            <span className="text-slate">
              Page {pageNumber} of {pages}
            </span>
            <div className="flex gap-2">
              {pageNumber > 1 ? (
                <Link href={href({ page: String(pageNumber - 1) })} className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  <ChevronLeft aria-hidden="true" />
                  Newer
                </Link>
              ) : null}
              {pageNumber < pages ? (
                <Link href={href({ page: String(pageNumber + 1) })} className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  Older
                  <ChevronRight aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </nav>
        )}
      </Card>
    </div>
  );
}
