import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { AdminDashboard } from "./admin-dashboard";
import { EmployeeDashboard } from "./employee-dashboard";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * One address, two dashboards: the administrator sees the whole practice,
 * an employee sees only their own work. Each variant loads its data in a
 * single parallel pass through the permission-checked data layer.
 */
export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  // requireAdmin() sends employees here with ?denied=1 when they open an administrator page.
  const denied = params.denied === "1";
  return viewer.isAdmin ? <AdminDashboard viewer={viewer} denied={denied} /> : <EmployeeDashboard viewer={viewer} denied={denied} />;
}
