import { CircleDot, CircleMinus, Clock, History, Monitor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap } from "@/components/ui/misc";
import { describeUserAgent } from "@/lib/request";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { SessionRecord } from "@/lib/types";

/** Why a session ended, in plain words. Unknown codes fall back to a tidied version of the code. */
const END_REASONS: Record<string, string> = {
  "signed-out": "Signed out",
  "password-changed": "Password changed",
  "password-reset": "Password reset by the administrator",
  "ended-by-admin": "Signed out by the administrator",
  suspended: "Account suspended",
  "account-deleted": "Account deleted",
  expired: "Session expired",
  network: "Left the office network",
  location: "Outside the office",
  hours: "Outside office hours",
  "device-pending": "Computer not registered",
  "device-blocked": "Computer blocked",
  "device-other-user": "Computer registered to someone else",
  "device-limit": "Computer limit reached",
  "device-mismatch": "Computer did not match",
};

export function endReasonLabel(reason: string | null) {
  if (!reason) return "Ended";
  const known = END_REASONS[reason];
  if (known) return known;
  const words = reason.replace(/[-_.]+/g, " ").trim();
  return words ? words[0]!.toUpperCase() + words.slice(1) : "Ended";
}

function sessionState(session: SessionRecord, now: string) {
  if (session.endedAt) return { label: endReasonLabel(session.endReason), tone: "neutral" as const, icon: <CircleMinus aria-hidden="true" /> };
  if (session.expiresAt <= now) return { label: "Expired", tone: "neutral" as const, icon: <Clock aria-hidden="true" /> };
  return { label: "Active", tone: "good" as const, icon: <CircleDot aria-hidden="true" /> };
}

/**
 * Recent sign-ins: the computer and browser, IP address, when the session
 * started and was last active, and how it ended.
 */
export function SessionsTable({
  sessions,
  deviceLabels,
  currentSessionId,
  empty = "No sign-ins recorded yet.",
}: {
  sessions: SessionRecord[];
  deviceLabels: Map<string, string>;
  currentSessionId?: string;
  empty?: string;
}) {
  if (!sessions.length) return <EmptyState icon={<History aria-hidden="true" />} title={empty} className="py-8" />;
  const now = new Date().toISOString();
  return (
    <TableWrap>
      <table className="data-table min-w-[44rem]">
        <thead>
          <tr>
            <th scope="col">Computer and browser</th>
            <th scope="col">IP address</th>
            <th scope="col">Signed in</th>
            <th scope="col">Last active</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => {
            const ua = describeUserAgent(session.userAgent);
            const device = session.deviceId ? deviceLabels.get(session.deviceId) : undefined;
            const state = sessionState(session, now);
            const current = session.id === currentSessionId;
            return (
              <tr key={session.id}>
                <td>
                  <div className="flex items-start gap-2.5">
                    <Monitor className="mt-0.5 size-4 shrink-0 text-slate" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{device ?? ua.label}</p>
                      <p className="text-xs text-slate">{device ? ua.label : session.role === "admin" ? "Administrator session" : "Unregistered browser"}</p>
                    </div>
                  </div>
                </td>
                <td className="tabular text-slate">{session.ip || "Unknown"}</td>
                <td className="tabular whitespace-nowrap">{formatDateTime(session.createdAt)}</td>
                <td className="whitespace-nowrap text-slate">
                  <time dateTime={session.lastSeenAt} title={formatDateTime(session.lastSeenAt)}>
                    {formatRelative(session.lastSeenAt)}
                  </time>
                </td>
                <td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={state.tone} icon={state.icon}>
                      {state.label}
                    </Badge>
                    {current && <Badge tone="blue">This browser</Badge>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrap>
  );
}
