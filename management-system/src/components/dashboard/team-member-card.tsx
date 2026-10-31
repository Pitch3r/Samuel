import Link from "next/link";
import { CircleCheck, Clock, Monitor } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ProgressBar, ScoreRing } from "@/components/ui/progress";
import { seriesColor, type SeriesSlot } from "@/components/charts/scale";
import { CardLink, Figure, GradeBadge } from "@/components/dashboard/bits";
import { formatHours, formatPercent, formatRelative, formatTime } from "@/lib/format";
import type { EmployeeMetrics } from "@/lib/metrics";
import type { AttendanceRecord } from "@/lib/types";

export type TeamMember = {
  uid: string;
  name: string;
  jobTitle: string;
  photoVersion: string | null;
  lastSeenAt: string | null;
  /** Their session checked in recently and they have not signed out. */
  online: boolean;
};

/**
 * One employee at a glance for the administrator: this month's score and
 * delivery, this week's hours against target, and today's attendance.
 */
export function TeamMemberCard({
  person,
  slot,
  metrics,
  hoursThisWeek,
  weeklyTarget,
  attendance,
}: {
  person: TeamMember;
  slot: SeriesSlot;
  metrics: EmployeeMetrics;
  hoursThisWeek: number;
  weeklyTarget: number;
  attendance: AttendanceRecord | null;
}) {
  const hoursPct = weeklyTarget ? (hoursThisWeek / weeklyTarget) * 100 : 0;
  const { online } = person;
  return (
    <Card as="article" className="flex min-w-0 flex-col overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        <span className="relative shrink-0">
          <Avatar name={person.name} uid={person.uid} photoVersion={person.photoVersion} size="lg" />
          {online && (
            <span className="absolute right-0 bottom-0 size-3.5 rounded-full bg-good ring-2 ring-white" title="Active now" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 text-base leading-snug">
            {/* The swatch ties this person to their colour in the team charts. */}
            <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: seriesColor(slot) }} aria-hidden="true" />
            <Link href={`/team/${person.uid}`} className="truncate hover:text-blue">
              {person.name}
            </Link>
          </h3>
          <p className="truncate text-sm text-slate">{person.jobTitle || "Employee"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <GradeBadge score={metrics.score} />
            {online && <span className="text-xs font-semibold text-good">Active now</span>}
          </div>
        </div>
        <ScoreRing value={metrics.score} size={72} stroke={7} label={`${person.name}, performance score this month`} sublabel="Score" />
      </div>

      <dl className="grid grid-cols-2 gap-px border-y border-mist bg-mist sm:grid-cols-4">
        <Figure label="Active" value={metrics.activeCount} sub={`${metrics.dueSoonCount} due in 7 days`} />
        <Figure label="Overdue" value={metrics.overdueCount} tone={metrics.overdueCount > 0 ? "danger" : "default"} sub={metrics.overdueCount ? "Needs follow-up" : "On schedule"} />
        <Figure label="Completed" value={metrics.completedInPeriod} sub={`Target ${Math.max(Math.round(metrics.completedTarget), 1)}`} />
        <Figure
          label="On time"
          value={formatPercent(metrics.onTimeRate, "N/A")}
          sub={metrics.avgQuality !== null ? `Quality ${metrics.avgQuality}/5` : "No ratings yet"}
        />
      </dl>

      <div className="px-5 py-4">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold text-navy">Hours this week</span>
          <span className="tabular text-slate">
            <span className="font-semibold text-navy">{formatHours(hoursThisWeek)}</span> of {formatHours(weeklyTarget)}
          </span>
        </div>
        <ProgressBar value={hoursPct} tone={hoursPct >= 100 ? "good" : "blue"} label={`${person.name}, hours this week against target`} className="mt-2" />
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-mist bg-cloud/50 px-5 py-3 text-xs">
        {attendance?.firstSignInAt ? (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-charcoal">
            <CircleCheck className="size-4 shrink-0 text-good" aria-hidden="true" />
            <span className="truncate">
              Signed in at <span className="tabular font-semibold">{formatTime(attendance.firstSignInAt)}</span>
              {attendance.deviceLabel && (
                <>
                  {" "}
                  on <Monitor className="mb-px inline size-3.5 text-slate" aria-hidden="true" /> {attendance.deviceLabel}
                </>
              )}
            </span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-slate">
            <Clock className="size-4 shrink-0" aria-hidden="true" />
            Not signed in today{person.lastSeenAt ? `, last seen ${formatRelative(person.lastSeenAt)}` : ""}
          </span>
        )}
        <CardLink href={`/team/${person.uid}`}>Profile</CardLink>
      </footer>
    </Card>
  );
}
