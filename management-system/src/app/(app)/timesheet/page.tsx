import type { Metadata } from "next";
import { CalendarRange, ChartColumn, Clock, Download, Gauge, ListChecks, Timer, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listTimeLogs } from "@/lib/data/time-logs";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listEmployees } from "@/lib/data/users";
import { peopleMap } from "@/lib/people";
import { isOpenStatus, type Track } from "@/lib/constants";
import { addDays, formatDate, formatHours, startOfWeek, todayISO } from "@/lib/format";
import { round, sum, uniq } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { buttonClasses } from "@/components/ui/button";
import { LogTimeForm } from "@/components/timesheet/log-time-form";
import { WeekGrid } from "@/components/timesheet/week-grid";
import { WeekSummary } from "@/components/timesheet/week-summary";
import { WeekToolbar, timesheetHref } from "@/components/timesheet/week-toolbar";
import { TeamEntries, TeamWeekTable, type TeamMember } from "@/components/timesheet/team-week";
import { HoursHeatmap, WeeklyHoursChart, twelveWeeks } from "@/components/timesheet/trends";
import { employeeSlot, slotsFor } from "@/components/timesheet/series";
import { parseWeek, targetStatus, weekDays, weekLabel } from "@/components/timesheet/week";
import type { UserProfile } from "@/lib/types";
import type { PersonLite } from "@/components/assignments/assignment-list";
import { deleteTimeLogAction, logTimeAction } from "./actions";

export const metadata: Metadata = { title: "Timesheet" };

const isoDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export default async function TimesheetPage(props: PageProps<"/timesheet">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const today = todayISO();
  const thisMonday = startOfWeek(today);
  // Weeks after the current one have nothing to show or log.
  const requestedMonday = parseWeek(params.week, thisMonday);
  const monday = requestedMonday > thisMonday ? thisMonday : requestedMonday;
  const sunday = addDays(monday, 6);
  const days = weekDays(monday);
  const historyFrom = twelveWeeks(monday)[0]!;

  // Whose timesheet: employees always their own; the administrator picks a person or the whole team.
  // The employee list fixes chart colours (slot by position), so it is read for everyone; names are only shown to the administrator.
  const employees = await listEmployees();
  const requested = typeof params.uid === "string" ? params.uid : "";
  let person: UserProfile | null = viewer.profile;
  if (viewer.isAdmin) {
    person = requested === viewer.uid ? viewer.profile : (employees.find((employee) => employee.uid === requested) ?? null);
  }
  const teamMode = person === null;

  const [logs, assignments, people] = await Promise.all([
    listTimeLogs(viewer, { uid: person?.uid, from: historyFrom, to: sunday }),
    listAssignmentsFor(viewer),
    viewer.isAdmin ? peopleMap() : Promise.resolve(new Map<string, PersonLite>()),
  ]);

  const weekLogs = logs.filter((log) => log.date >= monday && log.date <= sunday);
  const trackOf = new Map<string, Track>(assignments.map((assignment) => [assignment.id, assignment.track]));
  const slots = slotsFor(employees);

  // Log time form: open assignments, the person to log for, and the date to start on.
  const openAssignments = assignments
    .filter((assignment) => isOpenStatus(assignment.status))
    .map((assignment) => ({ id: assignment.id, ref: assignment.ref, title: assignment.title, assigneeIds: assignment.assigneeIds }));
  const activeEmployees = employees.filter((employee) => employee.status === "active");
  const formPeople = viewer.isAdmin
    ? [...activeEmployees.map((employee) => ({ uid: employee.uid, name: employee.displayName })), { uid: viewer.uid, name: viewer.name }]
    : [];
  const formUid = !viewer.isAdmin
    ? viewer.uid
    : person && formPeople.some((entry) => entry.uid === person.uid)
      ? person.uid
      : (activeEmployees[0]?.uid ?? viewer.uid);
  const requestedDate = isoDate(params.date) && params.date <= today ? params.date : null;
  const formDate = requestedDate ?? (today >= monday && today <= sunday ? today : days.filter((day) => day <= today).at(-1) ?? today);
  const formAssignment = typeof params.assignment === "string" ? params.assignment : "";
  const exportHref = `/api/export/time?from=${monday}&to=${sunday}${person && viewer.isAdmin ? `&uid=${encodeURIComponent(person.uid)}` : ""}`;

  const logCard = (
    <Card className="min-w-0">
      <div id="log-time" className="scroll-mt-24" />
      <CardHeader
        icon={<Clock aria-hidden="true" />}
        title="Log time"
        description={viewer.isAdmin ? "Record hours for yourself or a member of staff." : "Record hours as you go, at least once a day."}
      />
      <CardBody>
        <LogTimeForm
          key={`${formUid}-${formDate}-${formAssignment}`}
          action={logTimeAction}
          assignments={openAssignments}
          people={formPeople}
          viewerUid={viewer.uid}
          isAdmin={viewer.isAdmin}
          defaultUid={formUid}
          defaultDate={formDate}
          defaultAssignmentId={formAssignment}
          today={today}
        />
      </CardBody>
    </Card>
  );

  const toolbarPeople = viewer.isAdmin
    ? [
        ...employees.map((employee) => ({ uid: employee.uid, name: employee.displayName, suffix: employee.status === "suspended" ? "(suspended)" : undefined })),
        { uid: viewer.uid, name: "My own time" },
      ]
    : undefined;

  const header = (
    <PageHeader
      eyebrow={viewer.isAdmin ? (teamMode ? "All team" : person?.uid === viewer.uid ? "Your timesheet" : person?.displayName) : undefined}
      title="Timesheet"
      description={
        teamMode
          ? "Hours logged by every employee this week, against their weekly targets. Choose a person to see their days in detail."
          : person?.uid === viewer.uid
            ? `Log the hours you spend on each assignment and on general office work. Your weekly target is ${formatHours(viewer.profile.targets.weeklyHours)}.`
            : `Hours ${person?.displayName} has logged, day by day. Their weekly target is ${formatHours(person?.targets.weeklyHours ?? 0)}.`
      }
      actions={
        <a href={exportHref} className={buttonClasses({ variant: "secondary" })}>
          <Download aria-hidden="true" />
          Export CSV
        </a>
      }
    />
  );

  /* ------------------------------------------------------------ all team */
  if (teamMode) {
    const members: TeamMember[] = activeEmployees.map((employee) => ({
      uid: employee.uid,
      name: employee.displayName,
      jobTitle: employee.jobTitle,
      weeklyHours: employee.targets.weeklyHours,
      photoVersion: employee.photoUpdatedAt,
    }));
    const memberIds = new Set(members.map((member) => member.uid));
    const teamWeekLogs = weekLogs.filter((log) => memberIds.has(log.uid));
    const teamHours = round(sum(teamWeekLogs.map((log) => log.hours)), 2);
    const teamTarget = sum(members.map((member) => member.weeklyHours));
    const statuses = members.map((member) =>
      targetStatus(sum(teamWeekLogs.filter((log) => log.uid === member.uid).map((log) => log.hours)), member.weeklyHours, monday, today),
    );
    const onTarget = statuses.filter((status) => status.state === "met" || status.state === "on-track").length;
    const contributors = uniq(teamWeekLogs.map((log) => log.uid)).length;
    const historyLogs = logs.filter((log) => memberIds.has(log.uid));
    const heatTo = sunday < today ? sunday : today;

    return (
      <div className="mx-auto max-w-7xl">
        {header}
        <WeekToolbar monday={monday} thisMonday={thisMonday} people={toolbarPeople} />

        <section aria-label="This week in figures" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Team hours" value={formatHours(teamHours)} icon={<Timer aria-hidden="true" />} hint={`of ${formatHours(teamTarget)} combined target`} />
          <StatCard
            label="On target"
            value={`${onTarget} of ${members.length}`}
            icon={<Gauge aria-hidden="true" />}
            hint={monday === thisMonday ? "Met or on track so far" : "Reached their weekly target"}
            tone={members.length && onTarget < members.length ? "warning" : "default"}
          />
          <StatCard label="Entries" value={teamWeekLogs.length} icon={<ListChecks aria-hidden="true" />} hint={`From ${contributors} of ${members.length} employees`} />
          <StatCard
            label="Average per person"
            value={formatHours(members.length ? round(teamHours / members.length, 2) : 0)}
            icon={<Users aria-hidden="true" />}
            hint={weekLabel(monday)}
          />
        </section>

        <Card className="mb-6 overflow-hidden">
          <CardHeader
            icon={<CalendarRange aria-hidden="true" />}
            title="Team week"
            description="Hours per day for each employee. Select a name to open their timesheet."
          />
          <TeamWeekTable members={members} logs={teamWeekLogs} days={days} today={today} monday={monday} />
        </Card>

        <div className="mb-6 grid gap-6 lg:grid-cols-5">
          <Card className="min-w-0 lg:col-span-3">
            <CardHeader icon={<ChartColumn aria-hidden="true" />} title="Weekly hours, last 12 weeks" description="Each employee's total per week. The selected week is highlighted." />
            <CardBody>
              <WeeklyHoursChart
                logs={historyLogs}
                monday={monday}
                title="Weekly hours per employee over the last 12 weeks"
                series={members.map((member) => ({ key: member.uid, uid: member.uid, label: member.name, slot: slots.get(member.uid) ?? employeeSlot(0) }))}
              />
            </CardBody>
          </Card>
          <Card className="min-w-0 lg:col-span-2">
            <CardHeader icon={<CalendarRange aria-hidden="true" />} title="Team activity" description="Combined hours per day across the team, last 12 weeks." />
            <CardBody>
              <HoursHeatmap logs={historyLogs} from={historyFrom} to={heatTo} title="Combined team hours per day over the last 12 weeks" scale={Math.max(members.length, 1)} />
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="min-w-0 overflow-hidden lg:col-span-2">
            <CardHeader icon={<ListChecks aria-hidden="true" />} title="Entries this week" description="Every entry logged for the week, newest day first. You can remove one that was logged in error." />
            <TeamEntries logs={teamWeekLogs} people={people} deleteAction={deleteTimeLogAction} />
          </Card>
          <div className="min-w-0">{logCard}</div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------ one person */
  const subject = person!;
  const isSelf = subject.uid === viewer.uid;
  const target = subject.targets.weeklyHours;
  const weekHours = round(sum(weekLogs.map((log) => log.hours)), 2);
  const status = targetStatus(weekHours, target, monday, today);
  const slotIndex = employees.findIndex((employee) => employee.uid === subject.uid);
  const personSlot = slotIndex >= 0 ? employeeSlot(slotIndex) : employeeSlot(1);
  const heatTo = sunday < today ? sunday : today;
  const uidParam = viewer.isAdmin ? subject.uid : undefined;

  return (
    <div className="mx-auto max-w-7xl">
      {header}
      <WeekToolbar monday={monday} thisMonday={thisMonday} uid={uidParam} people={toolbarPeople} />

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader
            icon={<Gauge aria-hidden="true" />}
            title={monday === thisMonday ? "This week so far" : `Week of ${formatDate(monday)}`}
            description={isSelf ? "Your hours against your weekly target." : `${subject.displayName}'s hours against their weekly target.`}
          />
          <CardBody className="py-5">
            <WeekSummary logs={weekLogs} days={days} today={today} target={target} status={status} trackOf={trackOf} isSelf={isSelf} slot={personSlot} />
          </CardBody>
        </Card>
        {logCard}
      </div>

      <Card className="mb-6 overflow-hidden">
        <CardHeader
          icon={<CalendarRange aria-hidden="true" />}
          title="Day by day"
          description="Entries for each day of the week. Use Log time on a day to add hours to it."
          action={<span className="tabular text-sm font-semibold text-navy">{formatHours(weekHours)} this week</span>}
        />
        <WeekGrid
          days={days}
          logs={weekLogs}
          today={today}
          canDelete={(log) => viewer.isAdmin || log.uid === viewer.uid}
          deleteAction={deleteTimeLogAction}
          addHref={(date) => `${timesheetHref({ week: monday, uid: uidParam, date })}#log-time`}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="min-w-0 lg:col-span-3">
          <CardHeader icon={<ChartColumn aria-hidden="true" />} title="Weekly hours, last 12 weeks" description={`Total hours per week, with a weekly target of ${formatHours(target)}. The selected week is highlighted.`} />
          <CardBody>
            <WeeklyHoursChart
              logs={logs}
              monday={monday}
              title={`Weekly hours for ${subject.displayName} over the last 12 weeks`}
              series={[{ key: "hours", uid: null, label: "Hours", slot: personSlot }]}
            />
          </CardBody>
        </Card>
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader icon={<CalendarRange aria-hidden="true" />} title="Daily activity" description="Hours logged each day over the last 12 weeks. Darker means more hours." />
          <CardBody>
            <HoursHeatmap logs={logs} from={historyFrom} to={heatTo} title={`Hours logged per day by ${subject.displayName} over the last 12 weeks`} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
