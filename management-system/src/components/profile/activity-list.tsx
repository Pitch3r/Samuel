import type { ReactNode } from "react";
import {
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  History,
  KeyRound,
  Megaphone,
  Monitor,
  Settings,
  Tags,
  UserRound,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { ActivityEntry } from "@/lib/types";

const ENTITY_ICONS: Record<ActivityEntry["entityType"], ReactNode> = {
  assignment: <ClipboardList aria-hidden="true" />,
  client: <Building2 aria-hidden="true" />,
  user: <UserRound aria-hidden="true" />,
  report: <FileText aria-hidden="true" />,
  device: <Monitor aria-hidden="true" />,
  settings: <Settings aria-hidden="true" />,
  session: <KeyRound aria-hidden="true" />,
  category: <Tags aria-hidden="true" />,
  announcement: <Megaphone aria-hidden="true" />,
  time: <CalendarClock aria-hidden="true" />,
};

/** An audit trail as a simple timeline. `showActor` adds who did it, for entries about a person. */
export function ActivityList({ entries, showActor = false, empty = "Nothing recorded yet." }: { entries: ActivityEntry[]; showActor?: boolean; empty?: string }) {
  if (!entries.length) return <EmptyState icon={<History aria-hidden="true" />} title={empty} className="py-8" />;
  return (
    <ol className="divide-y divide-mist">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 px-5 py-3">
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-cloud text-navy [&_svg]:size-4">{ENTITY_ICONS[entry.entityType] ?? <History aria-hidden="true" />}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm break-words text-charcoal">
              {showActor && <span className="font-semibold text-navy">{entry.actorName}: </span>}
              {entry.summary}
            </p>
            <p className="mt-0.5 text-xs text-slate">
              <time dateTime={entry.at} title={formatDateTime(entry.at)}>
                {formatRelative(entry.at)}
              </time>
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
