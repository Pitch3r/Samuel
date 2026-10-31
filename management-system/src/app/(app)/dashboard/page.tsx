import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const viewer = await requireUser();
  return <PageHeader title={`Welcome, ${viewer.name}`} description="Dashboard placeholder" />;
}
