import { Avatar } from "@/components/ui/avatar";
import type { PersonLite } from "@/components/assignments/assignment-list";
import { formatDayMonth, formatHours } from "@/lib/format";
import { round, sum } from "@/lib/utils";
import type { TimeLog } from "@/lib/types";

/**
 * Hours on one assignment. The administrator sees everyone's time; an
 * employee is only ever given their own entries.
 */
export function TimeSummary({
  logs,
  people,
  showPeople,
  recent = 5,
}: {
  logs: TimeLog[];
  people: Map<string, PersonLite>;
  showPeople: boolean;
  recent?: number;
}) {
  if (!logs.length) return <p className="text-sm text-slate">No time has been logged{showPeople ? "" : " by you"} on this assignment yet.</p>;

  const totals = new Map<string, number>();
  for (const log of logs) totals.set(log.uid, (totals.get(log.uid) ?? 0) + log.hours);
  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(...rows.map(([, hours]) => hours), 1);

  return (
    <div className="space-y-5">
      {showPeople ? (
        <ul className="space-y-3" aria-label="Hours per person">
          {rows.map(([uid, hours]) => {
            const person = people.get(uid);
            return (
              <li key={uid} className="flex items-center gap-3">
                <Avatar name={person?.name ?? "?"} uid={uid} photoVersion={person?.photoVersion} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate text-charcoal">{person?.name ?? "Former staff member"}</span>
                    <span className="tabular shrink-0 font-semibold text-navy">{formatHours(round(hours, 2))}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-cloud" aria-hidden="true">
                    <div className="h-1.5 rounded-full bg-series-2" style={{ width: `${Math.max((hours / max) * 100, 3)}%` }} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate">
          You have logged <span className="tabular font-semibold text-navy">{formatHours(round(sum(logs.map((log) => log.hours)), 2))}</span> on this assignment.
        </p>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-slate uppercase">Latest entries</h3>
        <ul className="divide-y divide-mist rounded-xl border border-mist">
          {logs.slice(0, recent).map((log) => (
            <li key={log.id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate text-charcoal">{log.note || "No note"}</p>
                <p className="text-xs text-slate">
                  {formatDayMonth(log.date)}
                  {showPeople ? `, ${people.get(log.uid)?.name ?? "Former staff member"}` : ""}
                </p>
              </div>
              <span className="tabular shrink-0 font-semibold text-navy">{formatHours(log.hours)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
