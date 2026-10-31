import type { Metadata } from "next";
import { CalendarCheck, CircleCheck, ClipboardList, UserPlus, Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import { listAllAssignments } from "@/lib/data/assignments";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listWorkReports } from "@/lib/data/work-reports";
import { listAttendance } from "@/lib/data/attendance";
import { listDevices } from "@/lib/data/devices";
import { isOpenStatus } from "@/lib/constants";
import { startOfMonth, todayISO } from "@/lib/format";
import { dayOf, employeeMetrics, inPeriod, isDueWithin, isOverdue } from "@/lib/metrics";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { EmployeeCard } from "@/components/team/employee-card";
import { employeeSlot as memberSlot } from "@/components/charts/scale";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage(props: PageProps<"/team">) {
  const viewer = await requireAdmin();
  const params = await props.searchParams;
  const today = todayISO();
  const month = { from: startOfMonth(today), to: today };

  const [users, assignments, timeLogs, reports, attendance, devices] = await Promise.all([
    listUsers(),
    listAllAssignments(viewer),
    listTimeLogs(viewer, { from: month.from, to: today }),
    listWorkReports(viewer),
    listAttendance(viewer, { from: month.from, to: today }),
    listDevices(),
  ]);

  const employees = users.filter((user) => user.role === "employee");
  const activeEmployees = employees.filter((user) => user.status === "active");
  // Slots follow each person's place in the full employee list, as on the dashboard.
  const slotOf = new Map(employees.map((user, index) => [user.uid, memberSlot(index)]));
  const data = { assignments, timeLogs, reports, attendance };

  const open = assignments.filter((assignment) => isOpenStatus(assignment.status));
  const overdue = open.filter((assignment) => isOverdue(assignment, today)).length;
  const dueSoon = open.filter((assignment) => isDueWithin(assignment, 7, today)).length;
  const completed = assignments.filter((assignment) => assignment.status === "completed" && inPeriod(dayOf(assignment.completedAt), month)).length;
  const inToday = new Set(attendance.filter((record) => record.date === today && employees.some((user) => user.uid === record.uid)).map((record) => record.uid)).size;
  const suspended = employees.length - activeEmployees.length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Team"
        description="Everyone with a login to the management system. Add employees, keep their profiles up to date and see how each person is doing this month."
        actions={
          <ButtonLink href="/team/new">
            <UserPlus aria-hidden="true" />
            Add employee
          </ButtonLink>
        }
      />

      {params.deleted === "1" && (
        <Callout tone="success" title="The account has been deleted" className="mb-6">
          Their assignments, time logs and work reports are kept and still show their name.
        </Callout>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Employees"
          value={activeEmployees.length}
          icon={<Users aria-hidden="true" />}
          hint={suspended ? `${suspended} suspended` : "All accounts active"}
        />
        <StatCard
          label="In the office today"
          value={inToday}
          icon={<CalendarCheck aria-hidden="true" />}
          hint={`of ${plural(activeEmployees.length, "employee")}`}
          href="/attendance"
        />
        <StatCard
          label="Open assignments"
          value={open.length}
          icon={<ClipboardList aria-hidden="true" />}
          hint={overdue ? `${overdue} overdue, ${dueSoon} due in 7 days` : `${dueSoon} due in 7 days`}
          tone={overdue ? "danger" : "default"}
          href="/assignments?status=open"
        />
        <StatCard label="Completed this month" value={completed} icon={<CircleCheck aria-hidden="true" />} hint="Across both research tracks" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {users.map((user) => (
          <EmployeeCard
            key={user.uid}
            user={user}
            isYou={user.uid === viewer.uid}
            slot={slotOf.get(user.uid) ?? null}
            metrics={user.role === "employee" ? employeeMetrics(user, data, month, today) : null}
            devices={devices
              .filter((device) => device.status === "approved" && device.assignedUids.includes(user.uid))
              .map((device) => ({ id: device.id, label: device.label }))}
          />
        ))}
        {employees.length === 0 && (
          <Card className="grid place-items-center border-dashed">
            <EmptyState
              icon={<UserPlus aria-hidden="true" />}
              title="No employees yet"
              description="Create a login and profile for each member of staff. You set their first password and hand it over in person."
              action={
                <ButtonLink href="/team/new">
                  <UserPlus aria-hidden="true" />
                  Add employee
                </ButtonLink>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}
