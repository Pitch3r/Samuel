import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, FilePen, FileText, FilterX, Hourglass, MessageSquareQuote, Plus, Star, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listWorkReports } from "@/lib/data/work-reports";
import { listEmployees } from "@/lib/data/users";
import { peopleMap } from "@/lib/people";
import { REPORT_PERIODS, REPORT_PERIOD_LABELS, type ReportPeriod, type ReportStatus } from "@/lib/constants";
import { addDays, formatRelative, startOfMonth, startOfWeek, toISODate, todayISO } from "@/lib/format";
import { average, plural, round } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { FilterForm } from "@/components/ui/auto-submit";
import { AwaitingReview, ReportRows } from "@/components/work-reports/report-rows";
import { RATING_LABELS, Stars } from "@/components/work-reports/report-badges";
import { CoverageKey, WeeklyCoverage, coverageState, recentMondays } from "@/components/work-reports/weekly-coverage";
import { Pager, pageFrom } from "@/components/work-reports/pager";
import { rangeLabel } from "@/components/work-reports/periods";
import type { WorkReport } from "@/lib/types";
import type { PersonLite } from "@/components/assignments/assignment-list";

export const metadata: Metadata = { title: "Work reports" };

const PAGE_SIZE = 15;
const STATUS_FILTERS: { id: ReportStatus; label: string }[] = [
  { id: "submitted", label: "Awaiting review" },
  { id: "reviewed", label: "Reviewed" },
];

export default async function WorkReportsPage(props: PageProps<"/work-reports">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const today = todayISO();
  const thisMonday = startOfWeek(today);
  const monthStart = startOfMonth(today);

  const [reports, employees, people] = await Promise.all([
    listWorkReports(viewer),
    viewer.isAdmin ? listEmployees() : Promise.resolve([]),
    viewer.isAdmin ? peopleMap() : Promise.resolve(new Map<string, PersonLite>()),
  ]);

  // Filters. Employees only ever have their own reports, so the person filter is the administrator's.
  const status = STATUS_FILTERS.find((option) => option.id === params.status)?.id ?? "";
  const period: ReportPeriod | "" = REPORT_PERIODS.find((value) => value === params.period) ?? "";
  const uid = viewer.isAdmin && typeof params.uid === "string" && employees.some((employee) => employee.uid === params.uid) ? params.uid : "";
  const filtered = reports.filter((report) => (!uid || report.uid === uid) && (!status || report.status === status) && (!period || report.period === period));
  const isFiltered = Boolean(uid || status || period);
  const page = Math.min(pageFrom(params.page), Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Figures.
  // For the administrator: other people's reports still to review. For an employee: their own still under review.
  const awaiting = reports.filter((report) => report.status === "submitted" && (!viewer.isAdmin || report.uid !== viewer.uid));
  const rated = reports.filter((report) => report.rating !== null);
  const avgRating = average(rated.map((report) => report.rating ?? 0));
  const reviewedThisMonth = reports.filter((report) => report.reviewedAt && toISODate(report.reviewedAt) >= monthStart).length;
  const mondays = recentMondays(thisMonday, 8);
  const activeEmployees = employees.filter((employee) => employee.status === "active");

  const filters = (
    <FilterForm className="no-print grid gap-3 border-b border-mist p-4 sm:grid-cols-2 lg:flex lg:items-end">
      {viewer.isAdmin && (
        <div className="min-w-0 lg:w-56">
          <label htmlFor="report-person" className="field-label">
            Person
          </label>
          <select id="report-person" name="uid" defaultValue={uid} className="field-input">
            <option value="">Everyone</option>
            {employees.map((employee) => (
              <option key={employee.uid} value={employee.uid}>
                {employee.displayName}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="min-w-0 lg:w-48">
        <label htmlFor="report-status" className="field-label">
          Status
        </label>
        <select id="report-status" name="status" defaultValue={status} className="field-input">
          <option value="">Any status</option>
          {STATUS_FILTERS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-0 lg:w-48">
        <label htmlFor="report-period" className="field-label">
          Type
        </label>
        <select id="report-period" name="period" defaultValue={period} className="field-input">
          <option value="">All types</option>
          {REPORT_PERIODS.map((value) => (
            <option key={value} value={value}>
              {REPORT_PERIOD_LABELS[value]}
            </option>
          ))}
        </select>
      </div>
      <noscript>
        <button type="submit" className={buttonClasses({ variant: "secondary" })}>
          Apply
        </button>
      </noscript>
      {isFiltered && (
        <Link href="/work-reports" className={buttonClasses({ variant: "ghost", className: "h-[2.8rem] sm:col-span-2 lg:ml-auto" })}>
          <FilterX aria-hidden="true" />
          Clear filters
        </Link>
      )}
    </FilterForm>
  );

  const list = (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<FileText aria-hidden="true" />}
        title={viewer.isAdmin ? "All reports" : "My reports"}
        description={isFiltered ? `${plural(filtered.length, "report")} match the filters, of ${reports.length}.` : `${plural(reports.length, "report")}, newest period first.`}
      />
      {filters}
      {reports.length === 0 ? (
        <EmptyState
          icon={<FilePen aria-hidden="true" />}
          title={viewer.isAdmin ? "No reports yet" : "You have not written a report yet"}
          description={
            viewer.isAdmin
              ? "Reports appear here as staff submit them. You will be notified of each one."
              : "Write a short report at the end of each week: what you did, what got in the way and what comes next."
          }
          action={
            !viewer.isAdmin && (
              <ButtonLink href="/work-reports/new">
                <Plus aria-hidden="true" />
                New report
              </ButtonLink>
            )
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FilterX aria-hidden="true" />}
          title="No reports match"
          description="Try another person, status or type, or clear the filters."
          action={
            <ButtonLink href="/work-reports" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        />
      ) : (
        <>
          <ReportRows reports={shown} people={people} showAuthor={viewer.isAdmin} highlightAwaiting={viewer.isAdmin} />
          <Pager page={page} pageSize={PAGE_SIZE} total={filtered.length} basePath="/work-reports" params={{ uid, status, period }} noun="reports" />
        </>
      )}
    </Card>
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Work reports"
        description={
          viewer.isAdmin
            ? "Daily, weekly and monthly reports from staff. Read them, leave feedback and a rating, and see who is keeping up."
            : "Your daily, weekly and monthly reports to the administrator, with their feedback. A weekly report is expected every Friday."
        }
        actions={
          <ButtonLink href="/work-reports/new" variant={viewer.isAdmin ? "secondary" : "primary"}>
            <Plus aria-hidden="true" />
            New report
          </ButtonLink>
        }
      />

      {params.deleted === "1" && <Callout tone="success" title="The report has been deleted" className="mb-6" />}

      {viewer.isAdmin ? (
        <AdminView
          reports={reports}
          awaiting={awaiting}
          people={people}
          employees={activeEmployees.map((employee) => ({ uid: employee.uid, name: employee.displayName, photoVersion: employee.photoUpdatedAt }))}
          mondays={mondays}
          today={today}
          thisMonday={thisMonday}
          reviewedThisMonth={reviewedThisMonth}
          avgRating={avgRating}
          ratedCount={rated.length}
          list={list}
        />
      ) : (
        <EmployeeView
          reports={reports}
          awaiting={awaiting}
          mondays={mondays}
          today={today}
          thisMonday={thisMonday}
          monthStart={monthStart}
          avgRating={avgRating}
          ratedCount={rated.length}
          list={list}
        />
      )}
    </div>
  );
}

function RatingValue({ value }: { value: number | null }) {
  if (value === null) return <>No ratings</>;
  return (
    <span className="inline-flex items-baseline gap-1">
      {round(value, 1).toLocaleString("en-GB")}
      <span className="text-base font-semibold text-slate">/ 5</span>
    </span>
  );
}

/* ------------------------------------------------------------------ administrator */

function AdminView({
  reports,
  awaiting,
  people,
  employees,
  mondays,
  today,
  thisMonday,
  reviewedThisMonth,
  avgRating,
  ratedCount,
  list,
}: {
  reports: WorkReport[];
  awaiting: WorkReport[];
  people: Map<string, PersonLite>;
  employees: PersonLite[];
  mondays: string[];
  today: string;
  thisMonday: string;
  reviewedThisMonth: number;
  avgRating: number | null;
  ratedCount: number;
  list: React.ReactNode;
}) {
  const queue = [...awaiting].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const covered = employees.filter((employee) => coverageState(reports.filter((report) => report.uid === employee.uid), thisMonday, today) === "covered");
  const missing = employees.filter((employee) => !covered.includes(employee));

  return (
    <>
      <section aria-label="Reports in figures" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Awaiting your review"
          value={queue.length}
          icon={<Hourglass aria-hidden="true" />}
          hint={queue.length ? `Oldest sent ${formatRelative(queue[0]!.createdAt)}` : "All caught up"}
          tone={queue.length ? "warning" : "default"}
          href={queue.length ? "/work-reports?status=submitted" : undefined}
        />
        <StatCard label="Reviewed this month" value={reviewedThisMonth} icon={<MessageSquareQuote aria-hidden="true" />} hint="Feedback given" />
        <StatCard
          label="Average rating"
          value={<RatingValue value={avgRating} />}
          icon={<Star aria-hidden="true" />}
          hint={ratedCount ? `Across ${plural(ratedCount, "rated report")}` : "Rate reports when you review them"}
        />
        <StatCard
          label="This week's reports"
          value={`${covered.length} of ${employees.length}`}
          icon={<CalendarCheck aria-hidden="true" />}
          hint={missing.length ? `Waiting for ${missing.map((person) => person.name.split(" ")[0]).join(", ")}` : "Everyone has reported"}
          tone={missing.length && addDays(thisMonday, 4) < today ? "warning" : "default"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="min-w-0 lg:col-span-2">{list}</div>
        <aside className="min-w-0 space-y-6">
          <Card className="overflow-hidden">
            <CardHeader
              icon={<Hourglass aria-hidden="true" />}
              title="Awaiting your review"
              description={queue.length ? "Oldest first. Feedback keeps reporting useful." : undefined}
            />
            {queue.length ? (
              <AwaitingReview reports={queue.slice(0, 6)} people={people} />
            ) : (
              <EmptyState icon={<MessageSquareQuote aria-hidden="true" />} title="All reports reviewed" description="New reports will appear here." className="py-8" />
            )}
            {queue.length > 6 && (
              <Link href="/work-reports?status=submitted" className="block border-t border-mist px-5 py-3 text-sm font-semibold text-blue-dark hover:bg-cloud/70">
                See all {queue.length} waiting
              </Link>
            )}
          </Card>

          <Card>
            <CardHeader icon={<Users aria-hidden="true" />} title="Weekly reporting" description="The last eight weeks for each employee, this week on the right." />
            <CardBody className="space-y-4">
              {employees.length === 0 ? (
                <p className="text-sm text-slate">No active employees.</p>
              ) : (
                employees.map((employee) => (
                  <div key={employee.uid}>
                    <Link href={`/work-reports?uid=${encodeURIComponent(employee.uid)}`} className="group mb-2 flex items-center gap-2">
                      <Avatar name={employee.name} uid={employee.uid} photoVersion={employee.photoVersion} size="xs" />
                      <span className="text-sm font-semibold text-navy group-hover:text-blue">{employee.name}</span>
                    </Link>
                    <WeeklyCoverage reports={reports.filter((report) => report.uid === employee.uid)} mondays={mondays} today={today} />
                  </div>
                ))
              )}
              <div className="border-t border-mist pt-3">
                <CoverageKey />
              </div>
            </CardBody>
          </Card>
        </aside>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ employee */

function EmployeeView({
  reports,
  awaiting,
  mondays,
  today,
  thisMonday,
  monthStart,
  avgRating,
  ratedCount,
  list,
}: {
  reports: WorkReport[];
  awaiting: WorkReport[];
  mondays: string[];
  today: string;
  thisMonday: string;
  monthStart: string;
  avgRating: number | null;
  ratedCount: number;
  list: React.ReactNode;
}) {
  const thisWeek = coverageState(reports, thisMonday, today);
  const thisMonth = reports.filter((report) => report.periodEnd >= monthStart).length;
  const coveredWeeks = mondays.filter((monday) => coverageState(reports, monday, today) === "covered").length;
  const latestFeedback = reports
    .filter((report) => report.status === "reviewed" && (report.feedback || report.rating !== null))
    .sort((a, b) => (b.reviewedAt ?? "").localeCompare(a.reviewedAt ?? ""))
    .slice(0, 3);

  return (
    <>
      {thisWeek !== "covered" && (
        <Callout
          tone={thisWeek === "missing" ? "warning" : "info"}
          title={thisWeek === "missing" ? "Last week's report is missing" : "This week's report"}
          className="mb-6"
          action={
            <ButtonLink href="/work-reports/new?period=weekly" size="sm">
              <FilePen aria-hidden="true" />
              Write it now
            </ButtonLink>
          }
        >
          {thisWeek === "missing"
            ? "You have not reported on the week just ended. It only takes a few minutes."
            : "Remember to submit your weekly report by the end of Friday."}
        </Callout>
      )}

      <section aria-label="My reporting in figures" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Reports this month" value={thisMonth} icon={<FileText aria-hidden="true" />} hint="Covering days this month" />
        <StatCard label="Awaiting review" value={awaiting.length} icon={<Hourglass aria-hidden="true" />} hint="You can still edit these" />
        <StatCard
          label="Average rating"
          value={<RatingValue value={avgRating} />}
          icon={<Star aria-hidden="true" />}
          hint={ratedCount ? `From ${plural(ratedCount, "rated report")}` : "Ratings come with feedback"}
        />
        <StatCard
          label="Weeks reported"
          value={`${coveredWeeks} of ${mondays.length}`}
          icon={<CalendarCheck aria-hidden="true" />}
          hint="Over the last eight weeks"
          tone={coveredWeeks >= mondays.length - 1 ? "good" : "default"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="min-w-0 lg:col-span-2">{list}</div>
        <aside className="min-w-0 space-y-6">
          <Card>
            <CardHeader icon={<CalendarCheck aria-hidden="true" />} title="Weekly reporting" description="The last eight weeks, this week on the right." />
            <CardBody className="space-y-3">
              <WeeklyCoverage reports={reports} mondays={mondays} today={today} />
              <CoverageKey />
            </CardBody>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader icon={<MessageSquareQuote aria-hidden="true" />} title="Latest feedback" description="What the administrator said about your recent reports." />
            {latestFeedback.length === 0 ? (
              <EmptyState title="No feedback yet" description="Feedback and ratings appear here once your reports are reviewed." className="py-8" />
            ) : (
              <ul className="divide-y divide-mist">
                {latestFeedback.map((report) => (
                  <li key={report.id}>
                    <Link href={`/work-reports/${report.id}`} className="group block px-5 py-3.5 transition-colors hover:bg-cloud/70">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-slate group-hover:text-blue">{rangeLabel(report.periodStart, report.periodEnd)}</span>
                        {report.rating !== null && <Stars value={report.rating} />}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-charcoal">
                        {report.feedback || (report.rating !== null ? `Rated ${RATING_LABELS[report.rating]?.toLowerCase()}.` : "")}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
