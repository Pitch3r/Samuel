import {
  Bell,
  CalendarClock,
  CircleCheck,
  ClipboardPlus,
  FileText,
  Hourglass,
  MessageSquare,
  Paperclip,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { Notification } from "@/lib/types";

type NotificationKind = "review" | "approved" | "revision" | "assigned" | "due" | "comment" | "file" | "report" | "access" | "other";

const ICONS: Record<NotificationKind, LucideIcon> = {
  review: Hourglass,
  approved: CircleCheck,
  revision: RotateCcw,
  assigned: ClipboardPlus,
  due: CalendarClock,
  comment: MessageSquare,
  file: Paperclip,
  report: FileText,
  access: ShieldCheck,
  other: Bell,
};

/**
 * What a notification is about. Notifications are plain title/body/link
 * records, so this reads the wording the data layer uses (see
 * src/lib/data/assignments.ts and work-reports.ts) and falls back to "other".
 */
export function notificationKind(notification: Pick<Notification, "title" | "href">): NotificationKind {
  const title = notification.title.toLowerCase();
  const href = notification.href;
  if (title.startsWith("ready for review")) return "review";
  if (title.startsWith("approved")) return "approved";
  if (title.startsWith("revision requested")) return "revision";
  if (title.startsWith("new assignment")) return "assigned";
  if (title.startsWith("due date changed")) return "due";
  if (title.includes("commented")) return "comment";
  if (title.startsWith("new file")) return "file";
  if (href.startsWith("/work-reports") || title.includes("report")) return "report";
  if (href.startsWith("/settings/access") || title.includes("computer") || title.includes("device")) return "access";
  return "other";
}

export function NotificationIcon({ notification }: { notification: Pick<Notification, "title" | "href"> }) {
  const Icon = ICONS[notificationKind(notification)];
  return <Icon aria-hidden="true" />;
}
