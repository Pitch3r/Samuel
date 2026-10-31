import {
  Activity,
  AlarmClock,
  Banknote,
  CalendarClock,
  ChartColumn,
  CircleCheck,
  ClipboardList,
  Clock,
  FileText,
  Hourglass,
  Layers,
  Megaphone,
  Plus,
  ShieldCheck,
  Timer,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionTitle } from "@/components/ui/misc";
import { BarChart } from "@/components/charts/bar-chart";
import { seriesColor } from "@/components/charts/scale";
import { AssignmentList } from "@/components/assignments/assignment-list";
import { CardLink, ChartFrame, Figure } from "@/components/dashboard/bits";
import { HoursBarChart } from "@/components/dashboard/charts";
import { CategoryBreakdown, StatusBreakdown } from "@/components/dashboard/breakdowns";
import { FollowUpList, ReviewQueue } from "@/components/dashboard/review-queue";
import { TeamMemberCard } from "@/components/dashboard/team-member-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AnnouncementList, ReportsAwaiting, SecurityPanel } from "@/components/dashboard/panels";
import { TRACK_LABELS, TRACK_SERIES } from "@/lib/constants";
import { formatDateLong, formatHours, formatMoney, formatPercent, greeting } from "@/lib/format";
import { plural } from "@/lib/utils";
import type { Viewer } from "@/lib/types";
import { loadAdminDashboard, type AdminDashboardData } from "./admin-data";
import { DeniedNotice } from "./denied-notice";
import { firstName } from "./shared";

/** One line under the greeting saying what needs the administrator today. */
function todaySummary(data: AdminDashboardData) {
  const parts: string[] = [];
  if (data.reviewQueue.length) parts.push(`${plural(data.reviewQueue.length, "assignment")} waiting for your review`);
  if (data.kpis.overdue.value) parts.push(`${data.kpis.overdue.value} overdue`);
  if (data.reportsAwaitingTotal) parts.push(`${plural(data.reportsAwaitingTotal, "work report")} to read`);
  if (data.security.pendingDevices) parts.push(`${plural(data.security.pendingDevices, "computer")} to approve`);
  if (!parts.length) return "Everything is on track: no reviews, overdue work or access requests are waiting for you.";
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  return `Today you have ${list}.`;
}

export async function AdminDashboard({ viewer, denied }: { viewer: Viewer; denied: boolean }) {
  const data = await loadAdminDashboard(viewer);
  const { kpis } = data;

  return (
    <>
      <PageHeader
        eyebrow={formatDateLong(data.today)}
        title={`${greeting()}, ${firstName(viewer.name)}`}
        description={todaySummary(data)}
        actions={
          <>
            <ButtonLink href="/assignments/new">
              <Plus aria-hidden="true" />
              New assignment
            </ButtonLink>
            <ButtonLink href="/team/new" variant="secondary">
              <UserPlus aria-hidden="true" />
              Add employee
            </ButtonLink>
            <ButtonLink href="/reports" variant="secondary">
              <ChartColumn aria-hidden="true" />
              Reports
            </ButtonLink>
          </>
        }
      />

      {denied && <DeniedNotice />}

      {data.security.pendingDevices > 0 && (
        <Callout
          tone="warning"
          className="mb-6"
          title={`${plural(data.security.pendingDevices, "office computer")} waiting for approval`}
          action={
            <ButtonLink href="/settings/access" size="sm" variant="secondary">
              Review
            </ButtonLink>
          }
        >
          Staff cannot sign in from a new computer until you approve it.
        </Callout>
      )}

      {/* ------------------------------------------------------------ key figures */}
      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active assignments"
          value={kpis.active.value}
          icon={<ClipboardList aria-hidden="true" />}
          href="/assignments"
          delta={{ value: kpis.active.value - kpis.active.lastMonth, label: "vs a month ago" }}
          trend={kpis.active.trend}
          hint={`${kpis.active.byTrack.corporate} corporate, ${kpis.active.byTrack.academic} academic`}
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
          href="#follow-up"
          tone={kpis.overdue.value > 0 ? "danger" : "default"}
          hint={kpis.overdue.value ? `Oldest is ${plural(kpis.overdue.oldestDays, "day")} late` : "Nothing is past its due date"}
        />
        <StatCard
          label="Completed this month"
          value={kpis.completed.value}
          icon={<CircleCheck aria-hidden="true" />}
          delta={{ value: kpis.completed.value - kpis.completed.lastMonth, label: "vs same point last month" }}
          trend={kpis.completed.trend}
        />
        <StatCard
          label="On-time delivery"
          value={formatPercent(kpis.onTime.value, "N/A")}
          icon={<Timer aria-hidden="true" />}
          delta={
            kpis.onTime.value !== null && kpis.onTime.lastQuarter !== null
              ? { value: kpis.onTime.value - kpis.onTime.lastQuarter, label: "vs last quarter", format: "percent" }
              : undefined
          }
          hint={kpis.onTime.value === null ? "No dated work completed this quarter" : "This quarter"}
          trend={kpis.onTime.trend}
        />
        <StatCard
          label="Hours logged this week"
          value={formatHours(kpis.hours.value)}
          icon={<Clock aria-hidden="true" />}
          href="/timesheet"
          delta={{ value: kpis.hours.value - kpis.hours.lastWeek, label: "h vs same point last week" }}
          hint={`Team target ${formatHours(kpis.hours.target)}`}
          trend={kpis.hours.trend}
        />
        <StatCard
          label="Revenue this month"
          value={formatMoney(kpis.revenue.value, { compact: true })}
          icon={<Banknote aria-hidden="true" />}
          href="/reports"
          hint={`Completed work. ${formatMoney(kpis.revenue.lastMonth, { compact: true })} by this point last month`}
          trend={kpis.revenue.trend}
        />
        <StatCard
          label="Outstanding fees"
          value={formatMoney(kpis.outstanding.value, { compact: true })}
          icon={<Wallet aria-hidden="true" />}
          href="/reports"
          hint={kpis.outstanding.count ? `${plural(kpis.outstanding.count, "completed assignment")} not fully paid` : "All completed work is paid"}
        />
      </section>

      {/* ------------------------------------------------------------ delivery and workload */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader
            icon={<TrendingUp aria-hidden="true" />}
            title="Delivery trend"
            description="Assignments completed each month by track, over the last six months."
            action={<CardLink href="/reports">Reports</CardLink>}
          />
          <CardBody className="pt-5">
            <ChartFrame>
            <BarChart
              title="Assignments completed per month, by track"
              rows={data.delivery.rows}
              series={[
                { key: "academic", label: TRACK_LABELS.academic, slot: TRACK_SERIES.academic },
                { key: "corporate", label: TRACK_LABELS.corporate, slot: TRACK_SERIES.corporate },
              ]}
              stacked
              height={250}
            />
            </ChartFrame>
          </CardBody>
          <dl className="grid grid-cols-2 gap-px border-t border-mist bg-mist sm:grid-cols-4">
            <Figure label="Completed" value={data.delivery.totals.completed} sub="Last six months" />
            <Figure label="New work" value={data.delivery.totals.created} sub="Assignments opened" />
            <Figure label="On time" value={formatPercent(data.delivery.totals.onTime, "N/A")} sub="Of dated deliveries" />
            <Figure label="Value delivered" value={formatMoney(data.delivery.totals.revenue, { compact: true })} sub="Fees on completed work" />
          </dl>
        </Card>

        <Card className="min-w-0">
          <CardHeader icon={<Layers aria-hidden="true" />} title="Workload by status" description="Where open assignments stand right now." />
          <CardBody>
            <StatusBreakdown counts={data.statusCounts} byTrack={data.openByTrack} />
          </CardBody>
        </Card>
      </div>

      {/* ------------------------------------------------------------ review and deadlines */}
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-5">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader
            icon={<Hourglass aria-hidden="true" />}
            title="Review queue"
            description={data.reviewQueue.length ? `${plural(data.reviewQueue.length, "assignment")} submitted for review, oldest first.` : "Work submitted for your review."}
          />
          <ReviewQueue items={data.reviewQueue} people={data.people} />
          <section id="follow-up" aria-labelledby="follow-up-title" className="scroll-mt-24 border-t border-mist">
            <div className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-2">
              <h3 id="follow-up-title" className="text-sm font-bold">
                Needs follow-up{" "}
                {data.followUpTotal > 0 && <span className="tabular ml-1 rounded-full bg-danger-tint px-2 py-px text-xs text-danger">{data.followUpTotal}</span>}
              </h3>
              <span className="text-xs text-slate">Returned for revision or overdue</span>
            </div>
            <FollowUpList items={data.followUp} people={data.people} />
          </section>
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate">
              {data.followUpTotal > data.followUp.length ? `and ${data.followUpTotal - data.followUp.length} more to follow up` : ""}
            </span>
            <CardLink href="/assignments">All assignments</CardLink>
          </CardFooter>
        </Card>

        <Card className="min-w-0 xl:col-span-3">
          <CardHeader
            icon={<CalendarClock aria-hidden="true" />}
            title="Upcoming deadlines"
            description="Open assignments due in the next 14 days."
            action={<CardLink href="/calendar">Calendar</CardLink>}
          />
          <AssignmentList assignments={data.upcoming} people={data.people} empty="Nothing is due in the next 14 days." />
          {data.upcomingTotal > data.upcoming.length && (
            <CardFooter className="text-xs text-slate">
              Showing the first {data.upcoming.length} of {data.upcomingTotal}. See the calendar for the rest.
            </CardFooter>
          )}
        </Card>
      </div>

      {/* ------------------------------------------------------------ team */}
      <section aria-labelledby="team-title" className="mt-10">
        <SectionTitle action={<CardLink href="/performance">Performance</CardLink>}>
          <span id="team-title">Team this month</span>
        </SectionTitle>
        {data.teamCards.length ? (
          <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {data.teamCards.map((card) => (
              <TeamMemberCard key={card.person.uid} {...card} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Users aria-hidden="true" />}
              title={data.hasEmployees ? "No active employees" : "No employees yet"}
              description="Add your staff so you can assign work and follow their progress here."
              action={
                <ButtonLink href="/team/new" size="sm">
                  <UserPlus aria-hidden="true" />
                  Add employee
                </ButtonLink>
              }
            />
          </Card>
        )}
      </section>

      {/* ------------------------------------------------------------ hours and categories */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader
            icon={<Clock aria-hidden="true" />}
            title="Team hours, last 14 days"
            description="Hours logged each day by each member of staff."
            action={<CardLink href="/timesheet">Timesheets</CardLink>}
          />
          <CardBody className="pt-5">
            {data.teamHours.series.length ? (
              <ChartFrame>
                <HoursBarChart title="Hours logged per day by member of staff, last 14 days" rows={data.teamHours.rows} series={data.teamHours.series} height={230} />
              </ChartFrame>
            ) : (
              <EmptyState title="No team hours yet" description="Hours appear here once staff log time." className="py-8" />
            )}
          </CardBody>
          {data.teamHours.totals.length > 0 && (
            <dl className="grid gap-px border-t border-mist bg-mist sm:grid-cols-2">
              {data.teamHours.totals.map((row) => (
                <div key={row.uid} className="flex items-center justify-between gap-3 bg-white px-5 py-3">
                  <dt className="flex min-w-0 items-center gap-2 text-sm text-charcoal">
                    <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: seriesColor(row.slot) }} aria-hidden="true" />
                    <span className="truncate">{row.name}</span>
                  </dt>
                  <dd className="tabular shrink-0 text-right text-sm">
                    <span className="font-semibold text-navy">{formatHours(row.hours)}</span>
                    <span className="ml-1.5 text-xs text-slate">
                      over {plural(row.days, "day")}
                      {row.days ? `, ${formatHours(row.hours / row.days)} a day` : ""}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Card>

        <Card className="min-w-0">
          <CardHeader icon={<ClipboardList aria-hidden="true" />} title="Work by category" description="Busiest service lines, open and completed." />
          <CardBody>
            <CategoryBreakdown rows={data.categories} />
          </CardBody>
        </Card>
      </div>

      {/* ------------------------------------------------------------ activity, reports, access */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="min-w-0">
          <CardHeader
            icon={<Activity aria-hidden="true" />}
            title="Recent activity"
            description="The latest actions across the system."
          />
          <ActivityFeed entries={data.activity} people={data.people} />
          <CardFooter className="flex justify-end">
            <CardLink href="/settings/activity">Full activity log</CardLink>
          </CardFooter>
        </Card>

        <Card className="min-w-0">
          <CardHeader
            icon={<FileText aria-hidden="true" />}
            title="Work reports to review"
            description={data.reportsAwaitingTotal ? `${plural(data.reportsAwaitingTotal, "report")} waiting for your feedback.` : "Reports from staff that need feedback."}
          />
          <ReportsAwaiting reports={data.reportsAwaiting} people={data.people} />
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate">
              {data.reportsAwaitingTotal > data.reportsAwaiting.length ? `and ${data.reportsAwaitingTotal - data.reportsAwaiting.length} more` : ""}
            </span>
            <CardLink href="/work-reports">All work reports</CardLink>
          </CardFooter>
        </Card>

        <div className="grid min-w-0 gap-6 lg:col-span-2 lg:grid-cols-2 xl:col-span-1 xl:grid-cols-1">
          <Card className="min-w-0">
            <CardHeader
              icon={<ShieldCheck aria-hidden="true" />}
              title="Office access"
              description="Computers, sign-ins and who is working now."
            />
            <SecurityPanel {...data.security} />
            <CardFooter className="flex justify-end">
              <CardLink href="/settings/access">Manage office access</CardLink>
            </CardFooter>
          </Card>
          <Card className="min-w-0">
            <CardHeader
              icon={<Megaphone aria-hidden="true" />}
              title="Announcements"
              description="What your team sees on their dashboards."
            />
            <AnnouncementList items={data.announcements} />
            <CardFooter className="flex justify-end">
              <CardLink href="/settings/announcements">Manage announcements</CardLink>
            </CardFooter>
          </Card>
        </div>
      </div>

    </>
  );
}
