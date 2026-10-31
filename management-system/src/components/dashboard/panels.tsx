import Link from "next/link";
import { FileText, Pin, ShieldAlert, ShieldCheck, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ACCESS_DENIALS, REPORT_PERIOD_LABELS, type AccessDenial, type AssignmentStatus } from "@/lib/constants";
import { daysBetween, formatDate, formatDateTime, formatRelative, formatTime, toISODate, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PersonLite } from "@/components/assignments/assignment-list";
import type { Announcement, LoginEvent, WorkReport } from "@/lib/types";

/* ------------------------------------------------------------------ security */

/** Short reasons for the security panel; the full wording lives in ACCESS_DENIALS. */
const REASON_LABELS: Partial<Record<AccessDenial, string>> = {
  "bad-credentials": "Wrong email or password",
  "rate-limited": "Too many attempts",
  suspended: "Suspended account",
  "no-profile": "No staff profile",
  network: "Outside the office network",
  location: "Outside the office",
  "location-missing": "Location not shared",
  hours: "Outside office hours",
  "device-pending": "Computer awaiting approval",
  "device-blocked": "Blocked computer",
  "device-other-user": "Another person's computer",
  "device-limit": "Computer limit reached",
  "auth-error": "Sign-in service error",
};

function reasonLabel(reason: string) {
  if (Object.hasOwn(REASON_LABELS, reason)) return REASON_LABELS[reason as AccessDenial];
  return Object.hasOwn(ACCESS_DENIALS, reason) ? ACCESS_DENIALS[reason as AccessDenial] : reason;
}

/** Office access at a glance: whether restrictions are on, computers waiting, and refused sign-ins today. */
export function SecurityPanel({
  enforced,
  pendingDevices,
  failedToday,
  signedInNow,
}: {
  enforced: boolean;
  pendingDevices: number;
  failedToday: LoginEvent[];
  signedInNow: number;
}) {
  return (
    <div>
      <dl className="grid grid-cols-3 gap-px border-b border-mist bg-mist">
        <div className="bg-white px-4 py-3">
          <dt className="text-[0.7rem] font-semibold tracking-wide text-slate uppercase">Office lock</dt>
          <dd className="mt-1.5">
            {enforced ? (
              <Badge tone="good" icon={<ShieldCheck aria-hidden="true" />}>
                On
              </Badge>
            ) : (
              <Badge tone="warning" icon={<ShieldAlert aria-hidden="true" />}>
                Off
              </Badge>
            )}
          </dd>
        </div>
        <div className="bg-white px-4 py-3">
          <dt className="text-[0.7rem] font-semibold tracking-wide text-slate uppercase">Computers waiting</dt>
          <dd className={cn("tabular mt-1 font-display text-lg font-bold", pendingDevices ? "text-serious" : "text-navy")}>{pendingDevices}</dd>
        </div>
        <div className="bg-white px-4 py-3">
          <dt className="text-[0.7rem] font-semibold tracking-wide text-slate uppercase">Signed in now</dt>
          <dd className="tabular mt-1 font-display text-lg font-bold text-navy">{signedInNow}</dd>
        </div>
      </dl>
      <div className="px-5 pt-4 pb-2">
        <p className="text-sm font-semibold text-navy">
          Refused sign-ins today <span className="tabular ml-1 rounded-full bg-cloud px-2 py-px text-xs text-slate">{failedToday.length}</span>
        </p>
      </div>
      {failedToday.length ? (
        <ul className="divide-y divide-mist px-5 pb-3">
          {failedToday.slice(0, 4).map((event) => (
            <li key={event.id} className="flex items-start justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-charcoal">{event.name || event.email || "Unknown account"}</p>
                <p className="truncate text-xs text-slate">{reasonLabel(event.reason)}</p>
              </div>
              <time dateTime={event.at} title={formatDateTime(event.at)} className="tabular shrink-0 text-xs text-slate">
                {formatTime(event.at)}
              </time>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 pb-4 text-sm text-slate">No refused sign-ins today.</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ announcements */

export function AnnouncementList({ items, limit = 3 }: { items: Announcement[]; limit?: number }) {
  if (!items.length) {
    return <p className="px-5 py-4 text-sm text-slate">No announcements right now.</p>;
  }
  return (
    <ul className="divide-y divide-mist">
      {items.slice(0, limit).map((item) => (
        <li key={item.id} className="px-5 py-3.5">
          <p className="flex items-start gap-1.5 font-semibold text-navy">
            {item.pinned && (
              <>
                <Pin className="mt-1 size-3.5 shrink-0 text-blue" aria-hidden="true" />
                <span className="sr-only">Pinned: </span>
              </>
            )}
            <span className="min-w-0">{item.title}</span>
          </p>
          {item.body && <p className="mt-1 line-clamp-3 text-sm whitespace-pre-line text-charcoal/85">{item.body}</p>}
          <p className="mt-1.5 text-xs text-slate">
            {item.authorName}, {formatRelative(item.createdAt)}
            {item.expiresAt ? `. Shown until ${formatDate(item.expiresAt)}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ work reports */

/** Reports submitted by staff that still need the administrator's feedback. */
export function ReportsAwaiting({ reports, people }: { reports: WorkReport[]; people: Map<string, PersonLite> }) {
  if (!reports.length) {
    return (
      <EmptyState icon={<FileText aria-hidden="true" />} title="All reports reviewed" description="New work reports will appear here." className="py-8" />
    );
  }
  return (
    <ul className="divide-y divide-mist">
      {reports.map((report) => {
        const person = people.get(report.uid);
        return (
          <li key={report.id}>
            <Link href={`/work-reports/${report.id}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-cloud/70">
              <Avatar name={report.authorName} uid={person ? report.uid : undefined} photoVersion={person?.photoVersion} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy group-hover:text-blue">{report.authorName}</p>
                <p className="truncate text-xs text-slate">
                  {REPORT_PERIOD_LABELS[report.period]}, {formatDate(report.periodStart)}
                  {report.periodEnd !== report.periodStart ? ` to ${formatDate(report.periodEnd)}` : ""}
                </p>
              </div>
              <time dateTime={report.createdAt} title={formatDateTime(report.createdAt)} className="shrink-0 text-xs text-slate">
                {formatRelative(report.createdAt)}
              </time>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------------ feedback */

/** "3 days ago" for recent items, the date alone for older ones, so it stays short. */
function sinceLabel(iso: string) {
  const day = toISODate(iso);
  return daysBetween(day, todayISO()) > 25 ? formatDate(day) : formatRelative(iso);
}

export type FeedbackItem = {
  key: string;
  kind: "report" | "assignment";
  title: string;
  note: string;
  rating: number | null;
  at: string;
  href: string;
  status: AssignmentStatus | null;
};

function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cn("size-3.5", i < value ? "fill-navy text-navy" : "text-mist")} aria-hidden="true" />
      ))}
    </span>
  );
}

/** Latest feedback from the administrator on the employee's reports and assignments. */
export function FeedbackList({ items }: { items: FeedbackItem[] }) {
  if (!items.length) {
    return (
      <EmptyState
        icon={<FileText aria-hidden="true" />}
        title="No feedback yet"
        description="Comments on your reports and reviewed assignments will appear here."
        className="py-8"
      />
    );
  }
  return (
    <ul className="divide-y divide-mist">
      {items.map((item) => (
        <li key={item.key}>
          <Link href={item.href} className="group block px-5 py-3.5 transition-colors hover:bg-cloud/70">
            <div className="flex flex-wrap items-center gap-2">
              {item.status ? (
                <StatusBadge status={item.status} />
              ) : (
                <Badge tone="neutral" icon={<FileText aria-hidden="true" />}>
                  Report reviewed
                </Badge>
              )}
              {item.rating ? <Rating value={item.rating} /> : null}
              <time dateTime={item.at} title={formatDateTime(item.at)} className="ml-auto text-xs whitespace-nowrap text-slate">
                {sinceLabel(item.at)}
              </time>
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold text-navy group-hover:text-blue">{item.title}</p>
            {item.note && <p className="mt-1 line-clamp-2 border-l-2 border-mist pl-3 text-sm text-charcoal/85 italic">{item.note}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
