import { CalendarCheck, Clock, Gauge, Target } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";
import { HBarList } from "@/components/charts/hbar-list";
import { Legend } from "@/components/charts/legend";
import { seriesColor } from "@/components/charts/scale";
import type { SeriesSlot } from "@/components/charts/scale";
import { DayBars } from "@/components/timesheet/day-bars";
import { GENERAL_SLOT, workSlot } from "@/components/timesheet/series";
import { TargetBadge, targetTone } from "@/components/timesheet/target-badge";
import type { TargetStatus } from "@/components/timesheet/week";
import { TRACK_LABELS, TRACK_SERIES, type Track } from "@/lib/constants";
import { formatHours, isWeekday } from "@/lib/format";
import { round, sum, uniq } from "@/lib/utils";
import type { TimeLog } from "@/lib/types";

/** One labelled figure in the summary strip. */
export function Figure({ label, value, hint, icon }: { label: string; value: React.ReactNode; hint?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-cloud px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wide text-slate uppercase [&_svg]:size-3.5">
        {icon}
        {label}
      </p>
      <p className="tabular mt-1 font-display text-lg leading-tight font-bold text-navy">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-slate">{hint}</p>}
    </div>
  );
}

export type WorkTotal = { key: string; label: string; hours: number; track: Track | null };

/** Hours per assignment (and general office work) for a set of entries, largest first. */
export function totalsByWork(logs: TimeLog[], trackOf: Map<string, Track>): WorkTotal[] {
  const map = new Map<string, WorkTotal>();
  for (const log of logs) {
    const key = log.assignmentId ?? "general";
    const entry = map.get(key) ?? {
      key,
      label: log.assignmentId ? `${log.assignmentRef ? `${log.assignmentRef} ` : ""}${log.assignmentTitle}` : "General office work",
      hours: 0,
      track: log.assignmentId ? (trackOf.get(log.assignmentId) ?? null) : null,
    };
    entry.hours = round(entry.hours + log.hours, 2);
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => b.hours - a.hours || a.label.localeCompare(b.label));
}

/** Legend for work totals: the research tracks present, plus general office work. */
export function WorkLegend({ totals, className }: { totals: WorkTotal[]; className?: string }) {
  const tracks = uniq(totals.map((total) => total.track));
  if (tracks.length < 2) return null;
  const items = tracks
    .sort((a, b) => (a === null ? 1 : b === null ? -1 : a.localeCompare(b)))
    .map((track) => ({
      label: track ? TRACK_LABELS[track] : "General office work",
      color: seriesColor(track ? TRACK_SERIES[track] : GENERAL_SLOT),
    }));
  return <Legend className={className} items={items} />;
}

/**
 * The week at a glance: total against the weekly target, a strip of figures
 * and where the time went.
 */
export function WeekSummary({
  logs,
  days,
  today,
  target,
  status,
  trackOf,
  isSelf,
  slot,
}: {
  logs: TimeLog[];
  days: string[];
  today: string;
  target: number;
  status: TargetStatus;
  trackOf: Map<string, Track>;
  isSelf: boolean;
  slot: SeriesSlot;
}) {
  const total = round(sum(logs.map((log) => log.hours)), 2);
  const daysLogged = uniq(logs.map((log) => log.date)).length;
  const workingSoFar = days.filter((day) => isWeekday(day) && day <= today).length;
  const average = daysLogged ? round(total / daysLogged, 2) : 0;
  const onAssignments = round(sum(logs.filter((log) => log.assignmentId).map((log) => log.hours)), 2);
  const todayHours = round(sum(logs.filter((log) => log.date === today).map((log) => log.hours)), 2);
  const inWeek = days.includes(today);
  const totals = totalsByWork(logs, trackOf);
  const pct = target ? (total / target) * 100 : 0;
  const remaining = Math.max(round(target - total, 2), 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[0.8125rem] font-semibold text-slate">Hours this week</p>
            <p className="mt-1 font-display text-4xl leading-none font-bold tracking-tight text-navy">
              <span className="tabular">{(Math.round(total * 4) / 4).toLocaleString("en-GB")}</span>
              <span className="ml-1.5 text-lg font-semibold text-slate">of {formatHours(target)}</span>
            </p>
          </div>
          <TargetBadge status={status} />
        </div>
        <ProgressBar value={pct} tone={targetTone(status)} label="Hours logged against the weekly target" className="mt-4" />
        <p className="mt-2 text-xs text-slate">
          {status.state === "met"
            ? `The weekly target of ${formatHours(target)} is reached.`
            : status.state === "behind"
              ? `${formatHours(status.expected)} expected by now. ${formatHours(remaining)} to go this week.`
              : status.state === "short"
                ? `The week closed ${formatHours(status.gap)} under the ${formatHours(target)} target.`
                : target
                  ? `${formatHours(remaining)} to go to reach the ${formatHours(target)} target.`
                  : "No weekly target is set for this person."}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Figure
            label="Days logged"
            icon={<CalendarCheck aria-hidden="true" />}
            value={`${daysLogged} of ${Math.max(workingSoFar, daysLogged)}`}
            hint={workingSoFar ? "Working days so far" : "The week has not started"}
          />
          <Figure label="Daily average" icon={<Gauge aria-hidden="true" />} value={formatHours(average)} hint="On days with time logged" />
          <Figure
            label={inWeek ? "Today" : "Weekly target"}
            icon={inWeek ? <Clock aria-hidden="true" /> : <Target aria-hidden="true" />}
            value={inWeek ? formatHours(todayHours) : formatHours(target)}
            hint={inWeek ? (todayHours ? "Logged so far today" : isSelf ? "Nothing logged yet today" : "Nothing logged yet") : "Set on the staff profile"}
          />
          <Figure
            label="On assignments"
            icon={<Target aria-hidden="true" />}
            value={total ? `${Math.round((onAssignments / total) * 100)}%` : "0%"}
            hint={`${formatHours(onAssignments)} of client work`}
          />
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[0.8125rem] font-semibold text-slate">Where the time went</p>
        {totals.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-mist px-4 py-6 text-center text-sm text-slate">
            No time logged this week yet. Entries appear here by assignment.
          </p>
        ) : (
          <>
            <HBarList
              className="mt-3"
              title="Hours this week by assignment"
              items={totals.slice(0, 6).map((item) => ({
                label: item.label,
                value: item.hours,
                slot: workSlot(item.track),
                hint: total ? `${Math.round((item.hours / total) * 100)}%` : undefined,
              }))}
              valueFormat={formatHours}
            />
            {totals.length > 6 && <p className="mt-2 text-xs text-slate">and {totals.length - 6} more, see the days below.</p>}
            <WorkLegend totals={totals.slice(0, 6)} className="mt-4" />
          </>
        )}
        <p className="mt-6 text-[0.8125rem] font-semibold text-slate">Hours per day</p>
        <div className="mt-3">
          <DayBars
            title="Hours logged per day this week"
            slot={slot}
            today={today}
            values={days.map((day) => ({ date: day, hours: round(sum(logs.filter((log) => log.date === day).map((log) => log.hours)), 2) }))}
          />
        </div>
      </div>
    </div>
  );
}
