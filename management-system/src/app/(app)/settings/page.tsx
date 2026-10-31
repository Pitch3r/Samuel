import type { Metadata } from "next";
import { Cloud, Database, FolderTree, Globe, History, Lock, Megaphone, ShieldCheck, TriangleAlert } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getAccessSettings } from "@/lib/data/settings";
import { listDevices } from "@/lib/data/devices";
import { listCategories } from "@/lib/data/categories";
import { listAnnouncements } from "@/lib/data/announcements";
import { listActivity } from "@/lib/data/activity";
import { listUsers } from "@/lib/data/users";
import { listAllAssignments } from "@/lib/data/assignments";
import { listClients } from "@/lib/data/clients";
import { firebaseProjectId, usingEmulators, clientIpSource } from "@/lib/env";
import { isOpenStatus, organisation, TRACKS, TRACK_LABELS } from "@/lib/constants";
import { formatNumber, formatRelative, todayISO } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DescriptionList } from "@/components/ui/misc";
import { SettingsLinkCard } from "@/components/settings/settings-link-card";
import { ruleSummaries } from "@/components/settings/policy-text";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const viewer = await requireAdmin();
  const [access, devices, categories, announcements, activity, users, assignments, clients] = await Promise.all([
    getAccessSettings(),
    listDevices(),
    listCategories({ includeInactive: true }),
    listAnnouncements({ includeExpired: true }),
    listActivity(1),
    listUsers(),
    listAllAssignments(viewer),
    listClients(),
  ]);

  const today = todayISO();
  const rulesOn = ruleSummaries(access).filter((rule) => rule.on).length;
  const pending = devices.filter((device) => device.status === "pending").length;
  const approved = devices.filter((device) => device.status === "approved").length;
  const activeCategories = categories.filter((category) => category.active);
  const current = announcements.filter((item) => !item.expiresAt || item.expiresAt >= today);
  const pinned = current.filter((item) => item.pinned).length;
  const employees = users.filter((user) => user.role === "employee");
  const admins = users.length - employees.length;
  const openWork = assignments.filter((assignment) => isOpenStatus(assignment.status)).length;
  const projectId = firebaseProjectId() ?? "Not configured";

  const accessStatus = !access.enforce
    ? "Restrictions are off"
    : `Restrictions on, ${plural(rulesOn, "rule")}, ${plural(approved, "approved computer")}`;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Settings"
        description={`Control how the ${organisation.systemShort} works for the whole firm: where employees can sign in, how assignments are categorised, what staff are told and who changed what.`}
      />

      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SettingsLinkCard
          href="/settings/access"
          icon={<ShieldCheck aria-hidden="true" />}
          title="Office access"
          description="Lock employees to office computers, the office network and office hours. Approve computers and end sessions."
          attention={pending > 0}
          status={
            pending > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-warning">
                <TriangleAlert className="size-4" aria-hidden="true" />
                {plural(pending, "computer")} waiting for approval
              </span>
            ) : (
              accessStatus
            )
          }
        />
        <SettingsLinkCard
          href="/settings/categories"
          icon={<FolderTree aria-hidden="true" />}
          title="Categories"
          description="The service lines assignments are filed under, for corporate and academic research."
          status={`${plural(activeCategories.length, "active category", "active categories")} across ${TRACKS.length} tracks`}
        />
        <SettingsLinkCard
          href="/settings/announcements"
          icon={<Megaphone aria-hidden="true" />}
          title="Announcements"
          description="Notices that employees see on their dashboard, such as deadlines, closures and reminders."
          status={
            current.length ? `${plural(current.length, "current announcement")}${pinned ? `, ${pinned} pinned` : ""}` : "No current announcements"
          }
        />
        <SettingsLinkCard
          href="/settings/activity"
          icon={<History aria-hidden="true" />}
          title="Activity log"
          description="The audit trail: who created, changed, approved or removed what, and when."
          status={activity[0] ? `Last activity ${formatRelative(activity[0].at)}` : "No activity recorded yet"}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader icon={<Globe aria-hidden="true" />} title="Organisation" description="Shown on reports, exports and the sign-in page." />
          <CardBody className="space-y-5">
            <DescriptionList
              items={[
                { label: "Firm", value: organisation.name },
                { label: "System", value: `${organisation.system} (${organisation.systemShort})` },
                { label: "Location", value: organisation.city },
                { label: "Time zone", value: "Lusaka time (CAT, UTC+2)" },
                { label: "Currency", value: "Zambian kwacha (ZMW)" },
                {
                  label: "Website",
                  value: (
                    <a href={organisation.website} target="_blank" rel="noreferrer" className="font-semibold text-blue-dark hover:underline">
                      {organisation.website.replace(/^https?:\/\//, "")}
                    </a>
                  ),
                },
                { label: "Research tracks", value: TRACKS.map((track) => TRACK_LABELS[track]).join(" and ") },
                { label: "Tagline", value: organisation.tagline },
              ]}
            />
            <div className="rounded-xl border border-mist bg-cloud/60 px-4 py-3 text-sm">
              <p className="font-semibold text-navy">Academic integrity</p>
              <p className="mt-0.5 text-charcoal">{organisation.integrityNote}</p>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader
              icon={<Database aria-hidden="true" />}
              title="System"
              description="Where the data lives and how much of it there is."
              action={
                usingEmulators ? (
                  <Badge tone="warning" icon={<TriangleAlert aria-hidden="true" />}>
                    Local emulators
                  </Badge>
                ) : (
                  <Badge tone="good" icon={<Cloud aria-hidden="true" />}>
                    Live Firebase
                  </Badge>
                )
              }
            />
            <CardBody className="space-y-5">
              <DescriptionList
                items={[
                  { label: "Firebase project", value: <code className="font-mono text-[0.8125rem] text-navy">{projectId}</code> },
                  {
                    label: "Database",
                    value: usingEmulators ? "Firebase emulators on this machine (test data only)" : "Cloud Firestore and Cloud Storage",
                  },
                  { label: "Client IP source", value: <code className="font-mono text-[0.8125rem] text-navy">{clientIpSource()}</code> },
                  { label: "Signed in as", value: `${viewer.name} (${viewer.email})` },
                ]}
              />
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Staff accounts", value: users.length, hint: `${plural(employees.length, "employee")}, ${plural(admins, "admin")}` },
                  { label: "Assignments", value: assignments.length, hint: `${formatNumber(openWork)} open` },
                  { label: "Clients", value: clients.length, hint: "On record" },
                  { label: "Computers", value: devices.length, hint: `${approved} approved` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-mist bg-cloud/50 px-3 py-3">
                    <dt className="text-xs font-semibold text-slate">{item.label}</dt>
                    <dd className="mt-1 font-display text-xl font-bold text-navy tabular">{formatNumber(item.value)}</dd>
                    <dd className="mt-0.5 text-xs text-slate">{item.hint}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={<Lock aria-hidden="true" />} title="Data and privacy" />
            <CardBody>
              <ul className="space-y-3 text-sm text-charcoal">
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                  <span>
                    All records, files and photos are stored in the firm&apos;s own Firebase project
                    {usingEmulators ? "" : ` (${projectId})`}. No other organisation has access to it.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                  <span>
                    Browsers never talk to the database directly. Every read and write goes through the server after the sign-in and office checks,
                    and the database rules refuse everything else.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                  <span>
                    Employees see only their own assignments, time, reports and performance. Staff, client and sign-in records are visible to the
                    administrator only.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                  <span>
                    Personal data about staff, clients and research participants is handled in line with Zambia&apos;s Data Protection Act No. 3 of
                    2021: collect only what the work needs, keep it secure and remove it when it is no longer required.
                  </span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
