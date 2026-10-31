import Link from "next/link";
import { CircleCheck, CircleX, History, LogOut, UserCheck, Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmActionForm } from "@/components/settings/toast-forms";
import { TableWrap } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { ACCESS_DENIALS, type AccessDenial } from "@/lib/constants";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn, plural } from "@/lib/utils";
import type { ActionResult, LoginEvent, SessionRecord } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;
type Person = { name: string; photoVersion: string | null; role: "admin" | "employee" };

/* ------------------------------------------------------------------ sessions */

export function SessionsTable({
  sessions,
  people,
  computerName,
  currentSessionId,
  endAction,
}: {
  sessions: SessionRecord[];
  people: Map<string, Person>;
  /** Readable name of the computer a session is on. */
  computerName: (deviceId: string | null, userAgent: string) => { label: string; registered: boolean };
  currentSessionId: string;
  endAction: Action;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<Users aria-hidden="true" />}
        title="Active sessions"
        description="Everyone signed in right now. Ending a session signs that person out on their next click; they can sign in again if the office rules allow it."
      />
      {sessions.length === 0 ? (
        <EmptyState icon={<Users aria-hidden="true" />} title="Nobody is signed in" description="Sessions appear here while people are signed in." />
      ) : (
        <TableWrap className="relative">
          <table className="data-table min-w-[52rem]">
            <thead>
              <tr>
                <th scope="col">Person</th>
                <th scope="col">Started</th>
                <th scope="col">Last active</th>
                <th scope="col">Computer</th>
                <th scope="col">IP address</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                const person = people.get(session.uid);
                const computer = computerName(session.deviceId, session.userAgent);
                const own = session.id === currentSessionId;
                return (
                  <tr key={session.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={person?.name ?? "?"} uid={person ? session.uid : undefined} photoVersion={person?.photoVersion} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-navy">{person?.name ?? "Removed account"}</p>
                          <p className="text-xs text-slate">{session.role === "admin" ? "Administrator" : "Employee"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm whitespace-nowrap">{formatDateTime(session.createdAt)}</td>
                    <td className="text-sm whitespace-nowrap">
                      <time dateTime={session.lastSeenAt} title={formatDateTime(session.lastSeenAt)}>
                        {formatRelative(session.lastSeenAt)}
                      </time>
                      <p className="text-xs text-slate">Ends {formatDateTime(session.expiresAt)}</p>
                    </td>
                    <td className="text-sm">
                      <span className={cn(computer.registered ? "font-semibold text-navy" : "text-charcoal")}>{computer.label}</span>
                      {!computer.registered && <p className="text-xs text-slate">Not an office computer</p>}
                    </td>
                    <td className="tabular font-mono text-xs text-charcoal">{session.ip || "Unknown"}</td>
                    <td>
                      <div className="flex justify-end">
                        {own ? (
                          <Badge tone="blue">Your session</Badge>
                        ) : (
                          <ConfirmActionForm
                            action={endAction}
                            hidden={{ sessionId: session.id }}
                            confirm={`End ${person?.name ?? "this person"}'s session? They will be signed out on their next click.`}
                          >
                            <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                              <LogOut aria-hidden="true" />
                              End session
                            </button>
                          </ConfirmActionForm>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}
    </Card>
  );
}

/** One tile per person who is signed in, with how many sessions they have and a way to sign them out everywhere. */
export function SignedInPeople({
  sessions,
  people,
  currentUid,
  endAllAction,
}: {
  sessions: SessionRecord[];
  people: Map<string, Person>;
  currentUid: string;
  endAllAction: Action;
}) {
  // Sessions arrive newest first, so the first one seen per person is their latest.
  const byPerson = new Map<string, { count: number; lastSeenAt: string }>();
  for (const session of sessions) {
    const entry = byPerson.get(session.uid);
    if (entry) entry.count += 1;
    else byPerson.set(session.uid, { count: 1, lastSeenAt: session.lastSeenAt });
  }
  if (byPerson.size === 0) return null;
  return (
    <Card>
      <CardHeader
        icon={<UserCheck aria-hidden="true" />}
        title="Who is signed in"
        description="A person can have more than one session, for example after signing in on two computers or without signing out."
      />
      <ul className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
        {[...byPerson.entries()].map(([uid, entry]) => {
          const person = people.get(uid);
          return (
            <li key={uid} className="flex flex-col gap-3 rounded-xl border border-mist bg-cloud/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar name={person?.name ?? "?"} uid={person ? uid : undefined} photoVersion={person?.photoVersion} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-navy">{person?.name ?? "Removed account"}</p>
                  <p className="text-xs text-slate">
                    {plural(entry.count, "session")}, active {formatRelative(entry.lastSeenAt)}
                  </p>
                </div>
                {uid === currentUid && <Badge tone="blue">You</Badge>}
              </div>
              {uid !== currentUid && (
                <ConfirmActionForm
                  action={endAllAction}
                  hidden={{ uid }}
                  confirm={`Sign ${person?.name ?? "this person"} out on every computer? They can sign in again if the office rules allow it.`}
                >
                  <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm", className: "w-full" })}>
                    <LogOut aria-hidden="true" />
                    Sign out everywhere
                  </button>
                </ConfirmActionForm>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------ sign-in attempts */

/** The sentence the person was shown, or a fallback for codes from older versions. */
export function denialText(reason: string) {
  return reason in ACCESS_DENIALS ? ACCESS_DENIALS[reason as AccessDenial] : reason || "Refused.";
}

export function SignInsTable({
  events,
  filter,
  computerName,
}: {
  events: LoginEvent[];
  filter: "all" | "refused";
  computerName: (deviceId: string | null, userAgent: string) => { label: string; registered: boolean };
}) {
  const refused = events.filter((event) => !event.success);
  const shown = filter === "refused" ? refused : events;
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-8 items-center rounded-full px-3 text-[0.8125rem] font-semibold transition-colors",
      active ? "bg-navy text-white" : "bg-cloud text-slate hover:text-navy",
    );
  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<History aria-hidden="true" />}
        title="Recent sign-in attempts"
        description={`The latest ${plural(events.length, "attempt")}: ${events.length - refused.length} signed in, ${refused.length} refused. A refusal shows the reason the person was given.`}
        action={
          <nav className="flex gap-1.5" aria-label="Filter sign-in attempts">
            <Link href="/settings/access?tab=signins" className={chip(filter === "all")} aria-current={filter === "all" ? "page" : undefined}>
              All
            </Link>
            <Link
              href="/settings/access?tab=signins&result=refused"
              className={chip(filter === "refused")}
              aria-current={filter === "refused" ? "page" : undefined}
            >
              Refused only
            </Link>
          </nav>
        }
      />
      {shown.length === 0 ? (
        <EmptyState
          icon={<History aria-hidden="true" />}
          title={filter === "refused" ? "No refused attempts" : "No sign-in attempts yet"}
          description={filter === "refused" ? "Every recent attempt succeeded." : "Each sign-in, successful or not, is recorded here."}
        />
      ) : (
        <TableWrap className="relative">
          <table className="data-table min-w-[56rem]">
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Account</th>
                <th scope="col">Result</th>
                <th scope="col">Computer</th>
                <th scope="col">IP address</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((event) => {
                const computer = computerName(event.deviceId, event.userAgent);
                return (
                  <tr key={event.id} className={cn(!event.success && "[&>td]:bg-danger-tint/20")}>
                    <td className="text-sm whitespace-nowrap">
                      <time dateTime={event.at}>{formatDateTime(event.at)}</time>
                      <p className="text-xs text-slate">{formatRelative(event.at)}</p>
                    </td>
                    <td className="max-w-56">
                      <p className="truncate font-semibold text-navy">{event.name || event.email || "Unknown"}</p>
                      {event.name && <p className="truncate text-xs text-slate">{event.email}</p>}
                    </td>
                    <td className="max-w-80">
                      {event.success ? (
                        <Badge tone="good" icon={<CircleCheck aria-hidden="true" />}>
                          Signed in
                        </Badge>
                      ) : (
                        <>
                          <Badge tone="danger" icon={<CircleX aria-hidden="true" />}>
                            Refused
                          </Badge>
                          <p className="mt-1 text-xs text-charcoal">{denialText(event.reason)}</p>
                        </>
                      )}
                    </td>
                    <td className="text-sm">
                      <span className={cn(computer.registered ? "font-semibold text-navy" : "text-charcoal")}>{computer.label}</span>
                    </td>
                    <td className="tabular font-mono text-xs text-charcoal">{event.ip || "Unknown"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      )}
    </Card>
  );
}
