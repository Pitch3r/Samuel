import type { Metadata } from "next";
import { BellOff, CheckCheck, Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listNotifications } from "@/lib/data/notifications";
import { toISODate, todayISO } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { TabLinks } from "@/components/ui/misc";
import { ButtonLink } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { dayHeading } from "@/components/calendar/model";
import type { Notification } from "@/lib/types";
import { markAllReadAction, openNotificationAction } from "./actions";

export const metadata: Metadata = { title: "Notifications" };

/** How many recent notifications the page shows. */
const LIMIT = 200;

export default async function NotificationsPage(props: PageProps<"/notifications">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const filter = params.filter === "unread" ? "unread" : "all";

  const notifications = await listNotifications(viewer.uid, LIMIT);
  const unread = notifications.filter((item) => !item.read).length;
  const shown = filter === "unread" ? notifications.filter((item) => !item.read) : notifications;

  // Group by the Lusaka calendar day each notification arrived on.
  const today = todayISO();
  const groups = new Map<string, Notification[]>();
  for (const item of shown) {
    const day = toISODate(item.createdAt);
    groups.set(day, [...(groups.get(day) ?? []), item]);
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Notifications"
        description="Updates on your assignments, reviews and reports. Opening a notification marks it as read."
        actions={
          <ActionForm action={markAllReadAction}>
            <SubmitButton variant="secondary" disabled={unread === 0} pendingLabel="Marking as read">
              <CheckCheck aria-hidden="true" />
              Mark all as read
            </SubmitButton>
          </ActionForm>
        }
      />

      <TabLinks
        items={[
          { href: "/notifications", label: "All", active: filter === "all", count: notifications.length },
          { href: "/notifications?filter=unread", label: "Unread", active: filter === "unread", count: unread },
        ]}
      />

      <div>
        <p className="mb-3 text-sm text-slate" aria-live="polite">
          {unread ? `You have ${plural(unread, "unread notification")}.` : "You are all caught up."}
          {notifications.length >= LIMIT && ` Showing the latest ${LIMIT}.`}
        </p>

        <Card className="overflow-hidden">
          {shown.length === 0 ? (
            filter === "unread" ? (
              <EmptyState
                icon={<Inbox aria-hidden="true" />}
                title="No unread notifications"
                description="New updates on your work will appear here."
                action={
                  <ButtonLink href="/notifications" variant="secondary" size="sm">
                    See all notifications
                  </ButtonLink>
                }
              />
            ) : (
              <EmptyState
                icon={<BellOff aria-hidden="true" />}
                title="No notifications yet"
                description="You will be notified here when work is assigned, reviewed or needs your attention."
              />
            )
          ) : (
            <div className="divide-y divide-mist">
              {[...groups.entries()].map(([day, items]) => {
                const heading = dayHeading(day, today);
                return (
                  <section key={day} aria-label={heading.label}>
                    <h2 className="bg-cloud/80 px-4 py-2 text-xs font-bold tracking-wide text-slate uppercase sm:px-5">{heading.label}</h2>
                    <ul className="divide-y divide-mist">
                      {items.map((item) => (
                        <NotificationItem key={item.id} notification={item} action={openNotificationAction} />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
