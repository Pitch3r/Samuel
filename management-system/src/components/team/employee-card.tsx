import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Clock, Hash, Mail, Monitor, MonitorOff, Phone, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/progress";
import { seriesColor, type SeriesSlot } from "@/components/charts/scale";
import { AdminBadge, UserStatusBadge } from "@/components/profile/badges";
import { GradeBadge } from "@/components/profile/grade-badge";
import { SpecialisationChips } from "@/components/profile/profile-details";
import { formatDateTime, formatPercent, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EmployeeMetrics } from "@/lib/metrics";
import type { UserProfile } from "@/lib/types";

export type CardDevice = { id: string; label: string };

function Stat({ label, value, sub, tone = "default" }: { label: string; value: ReactNode; sub?: string; tone?: "default" | "danger" }) {
  return (
    <div className="min-w-0 bg-white px-4 py-3">
      <dt className="truncate text-[0.7rem] font-semibold tracking-wide text-slate uppercase">{label}</dt>
      <dd className={cn("tabular mt-1 font-display text-lg leading-none font-bold", tone === "danger" ? "text-danger" : "text-navy")}>{value}</dd>
      {sub && <dd className="mt-1 truncate text-xs text-slate">{sub}</dd>}
    </div>
  );
}

/**
 * One member of staff in the team list: who they are, how to reach them,
 * this month's figures (employees only), when they were last seen and which
 * office computers they are registered to.
 */
export function EmployeeCard({
  user,
  metrics,
  devices,
  slot,
  isYou,
}: {
  user: UserProfile;
  metrics: EmployeeMetrics | null;
  devices: CardDevice[];
  /** Chart colour for employees, so the swatch matches the team charts. */
  slot: SeriesSlot | null;
  isYou: boolean;
}) {
  const isAdmin = user.role === "admin";
  const href = `/team/${user.uid}`;
  return (
    <Card as="article" className={cn("flex min-w-0 flex-col overflow-hidden", user.status === "suspended" && "bg-cloud/40")}>
      <div className="flex items-start gap-4 p-5">
        <Avatar name={user.displayName} uid={user.uid} photoVersion={user.photoUpdatedAt} size="lg" className={user.status === "suspended" ? "opacity-60" : undefined} />
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-base leading-snug font-bold">
            {slot && <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: seriesColor(slot) }} aria-hidden="true" />}
            <Link href={href} className="truncate hover:text-blue">
              {user.displayName}
            </Link>
            {isYou && <span className="shrink-0 text-xs font-semibold text-slate">(you)</span>}
          </h2>
          <p className="text-sm text-slate">{[user.jobTitle || (isAdmin ? "Administrator" : "Employee"), user.department].filter(Boolean).join(", ")}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {isAdmin && <AdminBadge />}
            <UserStatusBadge status={user.status} />
            {metrics && user.status === "active" && <GradeBadge score={metrics.score} />}
          </div>
        </div>
        {metrics && <ScoreRing value={metrics.score} size={68} stroke={7} label={`${user.displayName}, performance score this month`} sublabel="Score" />}
      </div>

      <div className="space-y-3 px-5 pb-4">
        <ul className="space-y-1.5 text-sm">
          <li className="flex min-w-0 items-center gap-2 text-charcoal">
            <Mail className="size-4 shrink-0 text-slate" aria-hidden="true" />
            <a href={`mailto:${user.email}`} className="truncate hover:text-blue">
              {user.email}
            </a>
          </li>
          <li className="flex items-center gap-2 text-charcoal">
            <Phone className="size-4 shrink-0 text-slate" aria-hidden="true" />
            {user.phone ? (
              <a href={`tel:${user.phone.replace(/\s+/g, "")}`} className="hover:text-blue">
                {user.phone}
              </a>
            ) : (
              <span className="text-slate">No phone recorded</span>
            )}
          </li>
          <li className="flex items-center gap-2 text-charcoal">
            <Hash className="size-4 shrink-0 text-slate" aria-hidden="true" />
            {user.staffNumber ? <span className="tabular">Staff no. {user.staffNumber}</span> : <span className="text-slate">No staff number</span>}
            <span className="text-slate">· {user.employmentType}</span>
          </li>
        </ul>
        {user.specialisations.length > 0 && <SpecialisationChips items={user.specialisations} max={4} />}
      </div>

      {metrics ? (
        <dl className="grid grid-cols-2 gap-px border-y border-mist bg-mist sm:grid-cols-4">
          <Stat label="Active" value={metrics.activeCount} sub={`${metrics.dueSoonCount} due in 7 days`} />
          <Stat label="Overdue" value={metrics.overdueCount} tone={metrics.overdueCount > 0 ? "danger" : "default"} sub={metrics.overdueCount ? "Needs follow-up" : "On schedule"} />
          <Stat label="Completed" value={metrics.completedInPeriod} sub="This month" />
          <Stat label="On time" value={formatPercent(metrics.onTimeRate, "N/A")} sub={metrics.avgQuality !== null ? `Quality ${metrics.avgQuality}/5` : "No ratings yet"} />
        </dl>
      ) : (
        <div className="flex items-start gap-3 border-y border-mist bg-cloud/60 px-5 py-3.5 text-sm text-charcoal">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden="true" />
          <p>Full access to assignments, staff, clients and settings. Office sign-in restrictions never apply to the administrator.</p>
        </div>
      )}

      <footer className="mt-auto space-y-2 px-5 py-3.5 text-xs">
        <p className="flex items-center gap-1.5 text-slate">
          <Clock className="size-3.5 shrink-0" aria-hidden="true" />
          {user.lastSeenAt ? (
            <span>
              Last seen{" "}
              <time dateTime={user.lastSeenAt} title={formatDateTime(user.lastSeenAt)} className="font-semibold text-charcoal">
                {formatRelative(user.lastSeenAt)}
              </time>
            </span>
          ) : (
            "Has not signed in yet"
          )}
        </p>
        {!isAdmin && (
          <p className="flex min-w-0 items-center gap-1.5 text-slate">
            {devices.length ? <Monitor className="size-3.5 shrink-0" aria-hidden="true" /> : <MonitorOff className="size-3.5 shrink-0" aria-hidden="true" />}
            {devices.length ? (
              <span className="truncate">
                Office computer: <span className="font-semibold text-charcoal">{devices.map((device) => device.label).join(", ")}</span>
              </span>
            ) : (
              <span>No office computer registered</span>
            )}
          </p>
        )}
        <div className="flex justify-end pt-1">
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.8125rem] font-semibold text-blue-dark transition-colors hover:bg-blue-tint"
          >
            View profile
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </Card>
  );
}
