import type { Metadata } from "next";
import { Hourglass, Monitor, ShieldCheck, ShieldOff, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { currentDeviceId } from "@/lib/auth/sign-in";
import { getAccessSettings } from "@/lib/data/settings";
import { listDevices } from "@/lib/data/devices";
import { listLoginEvents, listOpenSessions } from "@/lib/data/sessions";
import { listUsers } from "@/lib/data/users";
import { ipDiagnostics, describeUserAgent } from "@/lib/request";
import { localClock, withinOfficeHours } from "@/lib/access/policy";
import { organisation } from "@/lib/constants";
import { formatDateTime, toISODate, todayISO } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { StatCard } from "@/components/ui/stat-card";
import { TabLinks } from "@/components/ui/misc";
import { AccessPolicyForm } from "@/components/settings/access-policy-form";
import { HowAccessWorks, RulesInForce } from "@/components/settings/access-overview";
import { ComputersTable, PendingRequests, ThisComputerCard, type ComputerActions } from "@/components/settings/computers";
import { SessionsTable, SignedInPeople, SignInsTable } from "@/components/settings/sessions-and-sign-ins";
import { isLocalAddress, longDay, ruleSummaries } from "@/components/settings/policy-text";
import type { EmployeeOption } from "@/components/settings/employee-picker";
import {
  approveDeviceAction,
  endPersonSessionsAction,
  endSessionAction,
  registerThisComputerAction,
  removeDeviceAction,
  saveAccessPolicyAction,
  setDeviceBlockedAction,
  updateDeviceAction,
} from "./actions";

export const metadata: Metadata = { title: "Office access" };

const TABS = ["policy", "computers", "sessions", "signins"] as const;
type Tab = (typeof TABS)[number];

const computerActions: ComputerActions = {
  register: registerThisComputerAction,
  approve: approveDeviceAction,
  update: updateDeviceAction,
  setBlocked: setDeviceBlockedAction,
  remove: removeDeviceAction,
};

export default async function OfficeAccessPage(props: PageProps<"/settings/access">) {
  const viewer = await requireAdmin();
  const params = await props.searchParams;
  const tab: Tab = TABS.find((value) => value === params.tab) ?? "policy";
  const signInFilter = params.result === "refused" ? "refused" : "all";

  const [settings, devices, sessions, events, users, network, deviceId] = await Promise.all([
    getAccessSettings({ fresh: true }),
    listDevices(),
    listOpenSessions(),
    listLoginEvents(100),
    listUsers(),
    ipDiagnostics(),
    currentDeviceId(),
  ]);

  const people = new Map(users.map((user) => [user.uid, { name: user.displayName, photoVersion: user.photoUpdatedAt, role: user.role }]));
  const employees: EmployeeOption[] = users
    .filter((user) => user.role === "employee")
    .map((user) => ({
      uid: user.uid,
      name: user.displayName,
      jobTitle: user.jobTitle,
      photoVersion: user.photoUpdatedAt,
      suspended: user.status !== "active",
    }));

  const pending = devices.filter((device) => device.status === "pending");
  const listed = devices.filter((device) => device.status !== "pending");
  const approved = devices.filter((device) => device.status === "approved");
  const blocked = devices.filter((device) => device.status === "blocked");
  const thisDevice = deviceId ? (devices.find((device) => device.id === deviceId) ?? null) : null;
  const employeeSessions = sessions.filter((session) => session.role === "employee");
  const today = todayISO();
  const refusedToday = events.filter((event) => !event.success && toISODate(event.at) === today).length;

  const deviceById = new Map(devices.map((device) => [device.id, device]));
  const computerName = (id: string | null, userAgent: string) => {
    const device = id ? deviceById.get(id) : undefined;
    if (device && device.status === "approved") return { label: device.label, registered: true };
    return { label: device ? `${device.details.browser} on ${device.details.os}` : describeUserAgent(userAgent).label, registered: false };
  };

  const now = new Date();
  const clock = localClock(now, organisation.timeZone);
  const time = `${String(Math.floor(clock.minutes / 60)).padStart(2, "0")}:${String(clock.minutes % 60).padStart(2, "0")}`;
  const inHours = withinOfficeHours(now, settings.hours, organisation.timeZone);
  const lusakaNow = `${longDay(clock.day)} ${time}${settings.hours.enabled ? (inHours ? ", within office hours" : ", outside office hours") : ""}`;

  const updatedBy = settings.updatedBy ? people.get(settings.updatedBy)?.name : null;
  const lastSaved = settings.updatedAt ? `Last saved ${formatDateTime(settings.updatedAt)}${updatedBy ? ` by ${updatedBy}` : ""}.` : null;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        back={{ href: "/settings", label: "Settings" }}
        title="Office access"
        description="Decide where and when employees can sign in. Employees can only use the system on approved office computers, on the office network and during office hours, depending on the rules you switch on."
        actions={
          <ButtonLink href="/settings/activity?type=device" variant="secondary">
            Computer history
          </ButtonLink>
        }
      />

      {/* Status summary */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Office restrictions"
          value={settings.enforce ? "On" : "Off"}
          icon={settings.enforce ? <ShieldCheck aria-hidden="true" /> : <ShieldOff aria-hidden="true" />}
          hint={
            settings.enforce
              ? `${plural(ruleSummaries(settings).filter((rule) => rule.on).length, "rule")} in force`
              : "Employees can sign in anywhere"
          }
          tone={settings.enforce ? "good" : "warning"}
        />
        <StatCard
          label="Approved computers"
          value={approved.length}
          icon={<Monitor aria-hidden="true" />}
          hint={blocked.length ? `${blocked.length} blocked` : "None blocked"}
          href="/settings/access?tab=computers"
        />
        <StatCard
          label="Waiting for approval"
          value={pending.length}
          icon={<Hourglass aria-hidden="true" />}
          hint={pending.length ? "Review under Computers" : "No requests"}
          tone={pending.length ? "warning" : "default"}
          href="/settings/access?tab=computers"
        />
        <StatCard
          label="Signed in now"
          value={sessions.length}
          icon={<Users aria-hidden="true" />}
          hint={`${plural(employeeSessions.length, "employee session")}${refusedToday ? `, ${refusedToday} refused today` : ""}`}
          href="/settings/access?tab=sessions"
        />
      </div>

      {pending.length > 0 && tab !== "computers" && (
        <Callout
          tone="warning"
          title={`${plural(pending.length, "computer")} waiting for your approval`}
          className="mb-6"
          action={
            <ButtonLink href="/settings/access?tab=computers" size="sm" variant="secondary">
              Review
            </ButtonLink>
          }
        >
          {pending
            .map((device) => device.requestedByName)
            .filter(Boolean)
            .slice(0, 3)
            .join(", ") || "A new computer"}{" "}
          asked to use the system on a computer that is not approved yet.
        </Callout>
      )}

      <TabLinks
        items={[
          { href: "/settings/access", label: "Policy", active: tab === "policy" },
          { href: "/settings/access?tab=computers", label: "Computers", active: tab === "computers", count: devices.length },
          { href: "/settings/access?tab=sessions", label: "Active sessions", active: tab === "sessions", count: sessions.length },
          { href: "/settings/access?tab=signins", label: "Sign-in attempts", active: tab === "signins", count: events.length },
        ]}
      />

      {tab === "policy" && (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <HowAccessWorks />
            <RulesInForce rules={ruleSummaries(settings)} enforce={settings.enforce} />
          </div>
          <section aria-labelledby="policy-heading">
            <h2 id="policy-heading" className="mb-1 text-lg font-bold">
              Office access policy
            </h2>
            <p className="mb-4 text-sm text-slate">Switch on the rules you want. Each rule that is on must be met for an employee to sign in.</p>
            <AccessPolicyForm
              action={saveAccessPolicyAction}
              settings={settings}
              network={{ ...network, local: isLocalAddress(network.detected) }}
              lusakaNow={lusakaNow}
              lastSaved={lastSaved}
            />
          </section>
        </div>
      )}

      {tab === "computers" && (
        <div className="space-y-6">
          <PendingRequests devices={pending} employees={employees} actions={computerActions} />
          <ThisComputerCard
            deviceId={deviceId}
            device={thisDevice}
            employees={employees}
            people={people}
            suggestedLabel={`Office PC ${approved.length + 1}`}
            actions={computerActions}
          />
          <ComputersTable devices={listed} currentId={deviceId} employees={employees} people={people} actions={computerActions} />
        </div>
      )}

      {tab === "sessions" && (
        <div className="space-y-6">
          <SignedInPeople sessions={sessions} people={people} currentUid={viewer.uid} endAllAction={endPersonSessionsAction} />
          <SessionsTable
            sessions={sessions}
            people={people}
            computerName={computerName}
            currentSessionId={viewer.sessionId}
            endAction={endSessionAction}
          />
        </div>
      )}

      {tab === "signins" && <SignInsTable events={events} filter={signInFilter} computerName={computerName} />}
    </div>
  );
}
