import { AdminShell } from "@/components/admin/admin-shell";
import { newSubmissionCount } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const newCount = await newSubmissionCount().catch(() => 0);
  return <AdminShell newCount={newCount}>{children}</AdminShell>;
}
