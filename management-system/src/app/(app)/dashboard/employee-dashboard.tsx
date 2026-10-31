import Link from "next/link";
import {
  AlarmClock,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CircleCheck,
  ClipboardList,
  Clock,
  FilePen,
  Megaphone,
  MessageSquareQuote,
  Monitor,
  NotebookPen,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Meta } from "@/components/ui/misc";
import { ProgressBar } from "@/components/ui/progress";
import { AssignmentList } from "@/components/assignments/assignment-list";
import { AgendaList } from "@/components/calendar/agenda-list";
import { CardLink, ChartFrame, Figure, ScoreTile } from "@/components/dashboard/bits";
import { HoursBarChart } from "@/components/dashboard/charts";
import { AnnouncementList, FeedbackList } from "@/components/dashboard/panels";
import { describeDue, formatDateLong, formatDayMonth, formatHours, formatTime, greeting } from "@/lib/format";
import { plural } from "@/lib/utils";
import type { Viewer } from "@/lib/types";
import { loadEmployeeDashboard, type EmployeeDashboardData } from "./employee-data";
import { DeniedNotice } from "./denied-notice";
import { firstName } from "./shared";

/** "Due 20 Nov 2026" to "due 20 Nov 2026" for use mid-sentence. */
function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function workSummary(data: EmployeeDashboardData) {
  const { open, dueSoon, overdue } = data.kpis;
  if (!open.value) return "You have no open assignments at the moment.";
  const extras: string[] = [];
  if (dueSoon.value) extras.push(`${dueSoon.value} due in the next 7 days`);
  if (overdue.value) extras.push(`${overdue.value} overdue`);
  return `You have ${plural(open.value, "open assignment")}${extras.length ? `, ${extras.join(" and ")}` : ""}.`;
}

export async function EmployeeDashboard({ viewer, denied }: { viewer: Viewer; denied: boolean }) {
  const data = await loadEmployeeDashboard(viewer);
  const { kpis, week } = data;
  const remaining = Math.max(kpis.hours.target - kpis.hours.value, 0);
  const hoursPct = kpis.hours.target ? (kpis.hours.value / kpis.hours.target) * 100 : 0;

  return (
    <>
      <PageHeader
        eyebrow={formatDateLong(data.today)}
        title={`${greeting()}, ${firstName(viewer.name)}`}
        description={
          <>
            <span className="block">{workSummary(data)}</span>
            {data.attendanceToday?.firstSignInAt && (
              <span className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                <Meta icon={<Monitor aria-hidden="true" />}>
                  <span>
                    Signed in at <span className="tabular font-semibold text-navy">{formatTime(data.attendanceToday.firstSignInAt)}</span>
                    {data.computer ? ` on ${data.computer}` : ""}
                  </span>
                </Meta>
              </span>
            )}
          </>
        }
        actions={
          <>
            <ButtonLink href="/timesheet">
              <Clock aria-hidden="true" />
              Log time
            </ButtonLink>
            <ButtonLink href="/work-reports/new" variant="secondary">
              <FilePen aria-hidden="true" />
              Write a report
            </ButtonLink>
            <ButtonLink href="/calendar" variant="secondary">
              <CalendarDays aria-hidden="true" />
              Calendar
            </ButtonLink>
          </>
        }
      />

      {denied && <DeniedNotice />}

      {(data.needsAction.length > 0 || !data.reportThisWeek) && (
        <div className="mb-6 space-y-3">
          {data.needsAction.length > 0 && (
            <Callout
              tone="warning"
              title={`${plural(data.needsAction.length, "assignment")} ${data.needsAction.length === 1 ? "needs" : "need"} your attention`}
            >
              <ul className="mt-1 space-y-1">
                {data.needsAction.slice(0, 4).map((assignment) => (
                  <li key={assignment.id}>
                    <Link href={`/assignments/${assignment.id}`} className="font-semibold text-navy underline-offset-2 hover:underline">
                      {assignment.title}
                    </Link>
                    {assignment.status === "revision"
                      ? `: returned for revision.${assignment.reviewNote ? ` "${assignment.reviewNote}"` : ""}`
                      : `: not started yet${assignment.dueDate ? `, ${lowerFirst(describeDue(assignment.dueDate, data.today).label)}` : ""}.`}
                  </li>
                ))}
              </ul>
            </Callout>
          )}
          {!data.reportThisWeek && (
            <Callout
              tone={data.reportDue ? "warning" : "info"}
              title={data.reportDue ? "Your weekly report is due" : "Weekly report"}
              action={
                <ButtonLink href="/work-reports/new" size="sm" variant={data.reportDue ? "primary" : "secondary"}>
                  <NotebookPen aria-hidden="true" />
                  Write report
                </ButtonLink>
              }
            >
              {data.reportDue
                ? "You have not submitted a report for this week yet. Please send it before the end of the day."
                : "Remember to submit your report for this week by Friday."}
            </Callout>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------ key figures */}
      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="My open assignments"
          value={kpis.open.value}
          icon={<ClipboardList aria-hidden="true" />}
          href="/assignments"
          hint={`${kpis.open.inProgress} in progress`}
        />
        <StatCard
          label="Due in 7 days"
          value={kpis.dueSoon.value}
          icon={<CalendarClock aria-hidden="true" />}
          href="/calendar"
          hint={kpis.dueSoon.dueToday ? `${kpis.dueSoon.dueToday} due today` : "Nothing due today"}
        />
        <StatCard
          label="Overdue"
          value={kpis.overdue.value}
          icon={<AlarmClock aria-hidden="true" />}
          href="/assignments"
          tone={kpis.overdue.value > 0 ? "danger" : "default"}
          hint={kpis.overdue.value ? "Update the administrator on these" : "Nothing is past its due date"}
        />
        <StatCard
          label="Completed this month"
          value={kpis.completed.value}
          icon={<CircleCheck aria-hidden="true" />}
          delta={{ value: kpis.completed.value - kpis.completed.lastMonth, label: "vs same point last month" }}
          hint={`Monthly target ${kpis.completed.target}`}
          trend={kpis.completed.trend}
        />
        <StatCard
          label="Hours this week"
          value={formatHours(kpis.hours.value)}
          icon={<Clock aria-hidden="true" />}
          href="/timesheet"
          delta={{ value: kpis.hours.value - kpis.hours.lastWeek, label: "h vs same point last week" }}
          hint={`of ${formatHours(kpis.hours.target)} target`}
          trend={kpis.hours.trend}
        />
        <ScoreTile score={kpis.score} label="My performance score" href="/performance" hint="This month. See how it is worked out." />
      </section>

      {/* Two independent column stacks, so a tall card on one side never leaves a gap on the other. */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <div className="grid min-w-0 gap-6 lg:col-span-2">
          <Card className="min-w-0">
            <CardHeader
              icon={<ClipboardList aria-hidden="true" />}
              title="My assignments"
              description="Open work, soonest due first."
              action={<CardLink href="/assignments">View all</CardLink>}
            />
            <AssignmentList assignments={data.open.slice(0, 8)} people={data.people} empty="You have no open assignments." />
            {data.open.length > 8 && <CardFooter className="text-xs text-slate">Showing 8 of {data.open.length}. See all on the assignments page.</CardFooter>}
          </Card>

          <Card className="min-w-0">
            <CardHeader
              icon={<Clock aria-hidden="true" />}
              title="This week"
              description={`Hours logged from Monday ${formatDayMonth(week.start)} to Sunday ${formatDayMonth(week.end)}.`}
              action={<CardLink href="/timesheet">Timesheet</CardLink>}
            />
            <dl className="grid grid-cols-3 gap-px border-b border-mist bg-mist">
              <Figure label="Today" value={formatHours(week.today)} sub={`Daily target ${formatHours(week.dailyTarget)}`} />
              <Figure
                label="This week"
                value={formatHours(kpis.hours.value)}
                sub={remaining > 0 ? `${formatHours(remaining)} to go` : "Target reached"}
                tone={remaining > 0 ? "default" : "good"}
              />
              <Figure label="Weekly target" value={formatHours(kpis.hours.target)} sub="Over five working days" />
            </dl>
            <CardBody className="pt-5">
              <ChartFrame minWidth="24rem">
                <HoursBarChart title="Hours logged each day this week" rows={week.rows} series={[{ key: "hours", label: "Hours logged", slot: data.slot }]} height={200} />
              </ChartFrame>
              <ProgressBar value={hoursPct} tone={hoursPct >= 100 ? "good" : "blue"} label="Hours this week against target" showValue className="mt-4" />
              <p className="mt-3 text-sm text-slate">
                Your daily target is <span className="font-semibold text-navy">{formatHours(week.dailyTarget)}</span>, which is {formatHours(kpis.hours.target)} a week
                over five working days.{" "}
                {remaining > 0 ? (
                  <>
                    <span className="font-semibold text-navy">{formatHours(remaining)}</span> to go this week.
                  </>
                ) : (
                  "You have reached this week's target."
                )}
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="grid min-w-0 gap-6 md:grid-cols-2 lg:grid-cols-1">
          <Card className="min-w-0">
            <CardHeader icon={<CalendarRange aria-hidden="true" />} title="Next 14 days" description="Your deadlines and milestones, overdue work first." />
            <div className="max-h-[30rem] overflow-y-auto">
              <AgendaList events={data.agenda} overdueFirst empty="Nothing due in the next 14 days" emptyDescription="New deadlines will appear here." />
            </div>
            <CardFooter className="flex justify-end">
              <CardLink href="/calendar">Open the calendar</CardLink>
            </CardFooter>
          </Card>

          <Card className="min-w-0">
            <CardHeader icon={<Megaphone aria-hidden="true" />} title="Announcements" description="News and reminders from the office." />
            <AnnouncementList items={data.announcements} limit={4} />
          </Card>

          <Card className="min-w-0 md:col-span-2 lg:col-span-1">
            <CardHeader icon={<MessageSquareQuote aria-hidden="true" />} title="Recent feedback" description="From the administrator on your reports and assignments." />
            <FeedbackList items={data.feedback} />
            <CardFooter className="flex justify-end">
              <CardLink href="/work-reports">My work reports</CardLink>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
