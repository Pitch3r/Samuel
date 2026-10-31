import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  ClipboardList,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; badge?: "unread" | "pendingDevices" | "reviewQueue" };
export type NavSection = { title: string; items: NavItem[]; adminOnly?: boolean };

export const NAV: NavSection[] = [
  {
    title: "Work",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Assignments", href: "/assignments", icon: ClipboardList, badge: "reviewQueue" },
      { label: "Calendar", href: "/calendar", icon: CalendarDays },
      { label: "Timesheet", href: "/timesheet", icon: Clock },
      { label: "Work reports", href: "/work-reports", icon: FileText },
    ],
  },
  {
    title: "Tracking",
    items: [
      { label: "Performance", href: "/performance", icon: TrendingUp },
      { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    ],
  },
  {
    title: "Management",
    adminOnly: true,
    items: [
      { label: "Reports and analytics", href: "/reports", icon: ChartColumn },
      { label: "Clients", href: "/clients", icon: Building },
      { label: "Team", href: "/team", icon: Users },
      { label: "Office access", href: "/settings/access", icon: ShieldCheck, badge: "pendingDevices" },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    title: "Me",
    items: [
      { label: "My profile", href: "/profile", icon: UserRound },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: "unread" },
    ],
  },
];
