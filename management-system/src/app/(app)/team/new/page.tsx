import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import { DEFAULT_TARGETS } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { StaffProfileForm } from "@/components/team/staff-profile-form";
import { createEmployeeAction } from "./actions";

export const metadata: Metadata = { title: "Add employee" };

/**
 * The next staff number in the firm's existing pattern, for example PRC-004
 * after PRC-003. Empty when there is no pattern to follow.
 */
function suggestStaffNumber(existing: string[]) {
  let best: { prefix: string; number: number; width: number } | null = null;
  for (const value of existing) {
    const match = value.trim().match(/^(.*?)(\d+)$/);
    if (!match) continue;
    const number = Number(match[2]);
    if (!best || number > best.number) best = { prefix: match[1] ?? "", number, width: match[2]!.length };
  }
  return best ? `${best.prefix}${String(best.number + 1).padStart(best.width, "0")}` : "";
}

export default async function NewEmployeePage() {
  await requireAdmin();
  const users = await listUsers();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        back={{ href: "/team", label: "Team" }}
        title="Add employee"
        description="Create the employee's login and profile in one step. You choose their first password and give it to them in person."
      />
      <StaffProfileForm
        mode="create"
        action={createEmployeeAction}
        cancelHref="/team"
        values={{
          displayName: "",
          email: "",
          jobTitle: "",
          department: "",
          staffNumber: suggestStaffNumber(users.map((user) => user.staffNumber)),
          employmentType: "Full time",
          startDate: todayISO(),
          phone: "",
          location: "Lusaka",
          bio: "",
          specialisations: [],
          qualifications: "",
          emergencyContact: { name: "", phone: "", relationship: "" },
          targets: { ...DEFAULT_TARGETS },
        }}
      />
    </div>
  );
}
