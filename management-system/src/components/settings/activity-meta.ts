import {
  Building,
  ClipboardList,
  Clock,
  FileText,
  FolderTree,
  KeyRound,
  Megaphone,
  Monitor,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import type { ActivityEntry } from "@/lib/types";

export type EntityType = ActivityEntry["entityType"];

/** Filter options for the activity log, in the order they are offered. */
export const ENTITY_TYPES: EntityType[] = [
  "assignment",
  "report",
  "time",
  "client",
  "user",
  "device",
  "session",
  "settings",
  "category",
  "announcement",
];

export const ENTITY_LABELS: Record<EntityType, string> = {
  assignment: "Assignments",
  report: "Work reports",
  time: "Time logs",
  client: "Clients",
  user: "Staff accounts",
  device: "Office computers",
  session: "Sessions",
  settings: "Office access policy",
  category: "Categories",
  announcement: "Announcements",
};

/** Singular label for the type column. */
export const ENTITY_SINGULAR: Record<EntityType, string> = {
  assignment: "Assignment",
  report: "Work report",
  time: "Time log",
  client: "Client",
  user: "Staff account",
  device: "Computer",
  session: "Session",
  settings: "Settings",
  category: "Category",
  announcement: "Announcement",
};

export const ENTITY_ICONS: Record<EntityType, LucideIcon> = {
  assignment: ClipboardList,
  report: FileText,
  time: Clock,
  client: Building,
  user: UserRound,
  device: Monitor,
  session: KeyRound,
  settings: Settings,
  category: FolderTree,
  announcement: Megaphone,
};

export function isEntityType(value: unknown): value is EntityType {
  return typeof value === "string" && (ENTITY_TYPES as string[]).includes(value);
}

/** Where an entry leads, when the record it names can still be opened. */
export function activityHref(entry: Pick<ActivityEntry, "action" | "entityType" | "entityId">) {
  if (entry.action.endsWith(".deleted")) return null;
  const id = encodeURIComponent(entry.entityId);
  switch (entry.entityType) {
    case "assignment":
      return `/assignments/${id}`;
    case "user":
      return `/team/${id}`;
    case "report":
      return `/work-reports/${id}`;
    case "client":
      return `/clients/${id}`;
    case "device":
      return "/settings/access?tab=computers";
    case "settings":
      return "/settings/access";
    case "session":
      return "/settings/access?tab=sessions";
    case "category":
      return "/settings/categories";
    case "announcement":
      return "/settings/announcements";
    default:
      return null;
  }
}
