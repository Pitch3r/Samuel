import Link from "next/link";
import {
  Building,
  ClipboardList,
  Clock,
  FileText,
  FolderTree,
  KeyRound,
  Megaphone,
  Monitor,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { PersonLite } from "@/components/assignments/assignment-list";
import type { ActivityEntry } from "@/lib/types";

const ENTITY_ICONS: Record<ActivityEntry["entityType"], LucideIcon> = {
  assignment: ClipboardList,
  client: Building,
  user: UserRound,
  report: FileText,
  device: Monitor,
  settings: Settings,
  session: KeyRound,
  category: FolderTree,
  announcement: Megaphone,
  time: Clock,
};

/** Where an entry leads, when the record it names can still be opened. */
function entryHref(entry: ActivityEntry) {
  if (entry.action.endsWith("deleted")) return null;
  switch (entry.entityType) {
    case "assignment":
      return `/assignments/${entry.entityId}`;
    case "report":
      return `/work-reports/${entry.entityId}`;
    case "client":
      return `/clients/${entry.entityId}`;
    case "user":
      return `/team/${entry.entityId}`;
    case "device":
      return "/settings/access";
    default:
      return null;
  }
}

/** Latest audit-trail entries: who did what, and when. */
export function ActivityFeed({ entries, people }: { entries: ActivityEntry[]; people: Map<string, PersonLite> }) {
  if (!entries.length) {
    return <EmptyState title="No activity yet" description="Actions across the system will be listed here." className="py-8" />;
  }
  return (
    <ol className="relative space-y-0 px-5 py-2">
      {entries.map((entry, i) => {
        const Icon = ENTITY_ICONS[entry.entityType] ?? ClipboardList;
        const href = entryHref(entry);
        const person = people.get(entry.actorId);
        return (
          <li key={entry.id} className="relative flex gap-3 py-2.5">
            {/* Timeline rail between avatars. */}
            {i < entries.length - 1 && <span className="absolute top-11 bottom-0 left-4 w-px bg-mist" aria-hidden="true" />}
            <Avatar name={entry.actorName} uid={person ? entry.actorId : undefined} photoVersion={person?.photoVersion} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                <span className="font-semibold text-navy">{entry.actorName}</span>
                <time dateTime={entry.at} title={formatDateTime(entry.at)} className="text-xs text-slate">
                  {formatRelative(entry.at)}
                </time>
              </p>
              <p className="mt-0.5 flex items-start gap-1.5 text-sm text-charcoal">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-slate" aria-hidden="true" />
                {href ? (
                  <Link href={href} className="min-w-0 break-words hover:text-blue hover:underline">
                    {entry.summary}
                  </Link>
                ) : (
                  <span className="min-w-0 break-words">{entry.summary}</span>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
