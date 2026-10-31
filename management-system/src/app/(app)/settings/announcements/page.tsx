import type { Metadata } from "next";
import { CalendarClock, CalendarX, Megaphone, Pin, PinOff, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listAnnouncements } from "@/lib/data/announcements";
import { listUsers } from "@/lib/data/users";
import { describeDue, formatDate, formatDateTime, formatRelative, todayISO } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmActionForm, QuickActionForm } from "@/components/settings/toast-forms";
import { SectionTitle } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { EditAnnouncementButton, NewAnnouncementButton } from "@/components/settings/announcement-forms";
import { createAnnouncementAction, deleteAnnouncementAction, setAnnouncementPinnedAction, updateAnnouncementAction } from "./actions";
import type { Announcement } from "@/lib/types";

export const metadata: Metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  await requireAdmin();
  const [announcements, users] = await Promise.all([listAnnouncements({ includeExpired: true }), listUsers()]);
  const today = todayISO();
  const current = announcements.filter((item) => !item.expiresAt || item.expiresAt >= today);
  const expired = announcements
    .filter((item) => item.expiresAt && item.expiresAt < today)
    .sort((a, b) => (b.expiresAt ?? "").localeCompare(a.expiresAt ?? ""));
  const photos = new Map(users.map((user) => [user.uid, user.photoUpdatedAt]));
  const employees = users.filter((user) => user.role === "employee" && user.status === "active").length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/settings", label: "Settings" }}
        title="Announcements"
        description="Notices for the whole team, such as deadlines, office closures and reminders. Current announcements appear on every employee's dashboard, pinned ones first."
        actions={<NewAnnouncementButton action={createAnnouncementAction} today={today} />}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-8">
          <section aria-labelledby="current-heading">
            <SectionTitle>
              <span id="current-heading">Current ({current.length})</span>
            </SectionTitle>
            {current.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Megaphone aria-hidden="true" />}
                  title="No current announcements"
                  description="Post one to tell everyone about a deadline, a closure or a change in how the office works."
                  action={<NewAnnouncementButton action={createAnnouncementAction} today={today} />}
                />
              </Card>
            ) : (
              <ul className="space-y-4">
                {current.map((item) => (
                  <AnnouncementCard key={item.id} item={item} today={today} photo={photos.get(item.authorId) ?? null} />
                ))}
              </ul>
            )}
          </section>

          {expired.length > 0 && (
            <section aria-labelledby="expired-heading">
              <SectionTitle>
                <span id="expired-heading">Expired ({expired.length})</span>
              </SectionTitle>
              <p className="-mt-1 mb-3 text-sm text-slate">No longer shown to employees. Edit one and move its date forward to show it again.</p>
              <ul className="space-y-4">
                {expired.map((item) => (
                  <AnnouncementCard key={item.id} item={item} today={today} photo={photos.get(item.authorId) ?? null} expired />
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader title="Who sees them" />
            <CardBody className="space-y-3 text-sm text-charcoal">
              <p>
                <span className="font-semibold text-navy">{plural(employees, "active employee")}</span> see current announcements at the top of their
                dashboard.
              </p>
              <p>Pinned announcements come first. The rest are listed newest first.</p>
              <p>An announcement with a date in &ldquo;Show until&rdquo; disappears after that day, Lusaka time. You can still find it here.</p>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function AnnouncementCard({ item, today, photo, expired = false }: { item: Announcement; today: string; photo: string | null; expired?: boolean }) {
  const until = item.expiresAt ? describeDue(item.expiresAt, today) : null;
  return (
    <li>
      <Card as="article" className={expired ? "bg-cloud/70" : item.pinned ? "ring-1 ring-blue/25" : ""}>
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {item.pinned && !expired && (
                <Badge tone="blue" icon={<Pin aria-hidden="true" />}>
                  Pinned
                </Badge>
              )}
              {expired ? (
                <Badge tone="neutral" icon={<CalendarX aria-hidden="true" />}>
                  Expired {formatDate(item.expiresAt)}
                </Badge>
              ) : until ? (
                <Badge tone={until.days !== null && until.days <= 2 ? "warning" : "neutral"} icon={<CalendarClock aria-hidden="true" />}>
                  {until.days === 0 ? "Last day today" : `Shown until ${formatDate(item.expiresAt)}`}
                </Badge>
              ) : (
                <Badge tone="neutral">No end date</Badge>
              )}
            </div>
            <h3 className={expired ? "mt-2 text-base font-bold text-slate" : "mt-2 text-base font-bold"}>{item.title}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!expired && (
              <QuickActionForm action={setAnnouncementPinnedAction} hidden={{ id: item.id, pinned: item.pinned ? "false" : "true" }}>
                <button type="submit" className={buttonClasses({ variant: "ghost", size: "sm" })}>
                  {item.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
                  {item.pinned ? "Unpin" : "Pin"}
                </button>
              </QuickActionForm>
            )}
            <EditAnnouncementButton
              action={updateAnnouncementAction}
              today={today}
              values={{ id: item.id, title: item.title, body: item.body, pinned: item.pinned, expiresAt: item.expiresAt }}
            />
            <ConfirmActionForm
              action={deleteAnnouncementAction}
              hidden={{ id: item.id }}
              confirm={`Delete "${item.title}"? Employees will no longer see it.`}
            >
              <button type="submit" className={buttonClasses({ variant: "ghost", size: "sm", className: "text-danger hover:bg-danger-tint" })}>
                <Trash2 aria-hidden="true" />
                <span className="sr-only">Delete {item.title}</span>
              </button>
            </ConfirmActionForm>
          </div>
        </div>
        {item.body && <p className="prose-plain px-5 pt-2 text-sm text-charcoal">{item.body}</p>}
        <div className="mt-4 flex items-center gap-2 border-t border-mist px-5 py-3 text-xs text-slate">
          <Avatar name={item.authorName} uid={photo ? item.authorId : undefined} photoVersion={photo} size="xs" />
          <span>
            Posted by <span className="font-semibold text-navy">{item.authorName}</span>{" "}
            <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)}>
              {formatRelative(item.createdAt)}
            </time>
          </span>
        </div>
      </Card>
    </li>
  );
}
