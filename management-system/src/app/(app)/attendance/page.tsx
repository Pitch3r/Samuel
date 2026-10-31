import type { Metadata } from "next";
import { CalendarCheck, CalendarDays, CalendarX2, Clock, History, Sunrise, Timer, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listAttendance } from "@/lib/data/attendance";
import { listEmployees } from "@/lib/data/users";
import { peopleMap } from "@/lib/people";
import { resolvePeriod } from "@/lib/period";
import { addDays, formatDate, formatDateLong, formatPercent, formatWeekdayShort, isWeekday, startOfWeek, todayISO } from "@/lib/format";
import { average, sum } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { PeriodPicker } from "@/components/ui/period-picker";
import { FilterForm } from "@/components/ui/auto-submit";
import { Avatar } from "@/components/ui/avatar";
import { CalendarHeatmap } from "@/components/charts/heatmap";
import { HeatmapBox } from "@/components/timesheet/trends";
import { TodayPanel, type TodayMember } from "@/components/attendance/today-panel";
import { RegisterTable, type RegisterRow } from "@/components/attendance/register-table";
import { DailyLog } from "@/components/attendance/daily-log";
import { ArrivalPattern } from "@/components/attendance/arrival-pattern";
import { Pager, pageFrom } from "@/components/work-reports/pager";
import {
  expectedDays,
  formatClock,
  formatDuration,
  hoursByDate,
  hoursInOffice,
  isLate,
  LATE_AFTER_LABEL,
  LATE_AFTER_MINUTES,
  lusakaMinutes,
  firstSignIn,
  OFFICE_THRESHOLDS,
  summarise,
} from "@/components/attendance/stats";
import type { UserProfile } from "@/lib/types";
import type { PersonLite } from "@/components/assignments/assignment-list";

export const metadata: Metadata = { title: "Attendance" };

const LOG_PAGE_SIZE = 25;

function HowItWorks({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Callout title="How attendance is recorded" className="mb-6">
      {isAdmin
        ? "A day is opened the first time each employee signs in on an office computer, and kept current while they work. Signing out records the time they left. Arrivals after "
        : "Your day is recorded when you first sign in on your office computer, and kept current while you work. Signing out records the time you left, so please sign out at the end of the day. Arrivals after "}
      {LATE_AFTER_LABEL} count as late.
    </Callout>
  );
}

/** Heatmap window: the period, widened to at least twelve weeks so the calendar reads well. */
function heatWindow(from: string, to: string) {
  const twelveWeeksBack = addDays(startOfWeek(to), -77);
  return { from: from < twelveWeeksBack ? from : twelveWeeksBack, to };
}

export default async function AttendancePage(props: PageProps<"/attendance">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const today = todayISO();
  const now = new Date();
  const { preset, period, label } = resolvePeriod(params, "this-month");
  const periodEnd = period.to < today ? period.to : today;
  const heat = heatWindow(period.from, periodEnd);
  const keep = { period: preset, from: preset === "custom" ? period.from : undefined, to: preset === "custom" ? period.to : undefined };
  const keepQuery = `&period=${preset}${preset === "custom" ? `&from=${period.from}&to=${period.to}` : ""}`;
  const page = pageFrom(params.page);

  // Employees only ever see their own attendance; the administrator sees everyone or picks one person.
  const employees = viewer.isAdmin ? await listEmployees() : [];
  const requested = typeof params.uid === "string" ? params.uid : "";
  const subject: UserProfile | null = viewer.isAdmin ? (employees.find((employee) => employee.uid === requested) ?? null) : viewer.profile;

  const toolbar = (
    <div className="no-print mb-6 flex flex-col gap-3 rounded-card border border-mist bg-white p-3 shadow-card sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <PeriodPicker preset={preset} period={period} keep={{ uid: subject && viewer.isAdmin ? subject.uid : undefined }} />
      {viewer.isAdmin && (
        <FilterForm className="flex items-end gap-2" action="/attendance">
          {Object.entries(keep).map(([key, value]) => (value ? <input key={key} type="hidden" name={key} value={value} /> : null))}
          <label className="text-xs font-semibold text-slate">
            <span className="mb-1 block">Person</span>
            <select name="uid" defaultValue={subject?.uid ?? ""} className="field-input h-10 w-56 py-0 text-sm">
              <option value="">All team</option>
              {employees.map((employee) => (
                <option key={employee.uid} value={employee.uid}>
                  {employee.displayName}
                  {employee.status === "suspended" ? " (suspended)" : ""}
                </option>
              ))}
            </select>
          </label>
        </FilterForm>
      )}
    </div>
  );

  /* ------------------------------------------------------------ whole team (administrator) */
  if (!subject) {
    const active = employees.filter((employee) => employee.status === "active");
    const ids = new Set(employees.map((employee) => employee.uid));
    const [allRecords, todayRecords, people] = await Promise.all([
      listAttendance(viewer, { from: heat.from, to: periodEnd }),
      listAttendance(viewer, { from: today, to: today }),
      peopleMap(),
    ]);
    const records = allRecords.filter((record) => ids.has(record.uid));
    const inPeriod = records.filter((record) => record.date >= period.from && record.date <= period.to);

    const rows: RegisterRow[] = active.map((employee) => {
      const mine = inPeriod.filter((record) => record.uid === employee.uid);
      const expected = expectedDays(period, today, employee.startDate, mine.some((record) => record.date === today));
      return {
        uid: employee.uid,
        name: employee.displayName,
        jobTitle: employee.jobTitle,
        photoVersion: employee.photoUpdatedAt,
        summary: summarise(mine, expected),
      };
    });
    const present = sum(rows.map((row) => row.summary.daysPresent));
    const expected = sum(rows.map((row) => row.summary.expected));
    const workingDays = inPeriod.filter((record) => isWeekday(record.date));
    const avgIn = average(workingDays.map((record) => lusakaMinutes(firstSignIn(record))));
    const late = inPeriod.filter(isLate).length;
    const lengths = workingDays.map(hoursInOffice).filter((hours) => hours > 0);
    const avgDay = average(lengths);
    const inToday = todayRecords.filter((record) => active.some((employee) => employee.uid === record.uid));
    const members: TodayMember[] = active.map((employee) => ({
      uid: employee.uid,
      name: employee.displayName,
      jobTitle: employee.jobTitle,
      photoVersion: employee.photoUpdatedAt,
    }));
    const log = [...inPeriod].sort((a, b) => b.date.localeCompare(a.date) || a.firstSignInAt.localeCompare(b.firstSignInAt));
    const logPage = Math.min(page, Math.max(Math.ceil(log.length / LOG_PAGE_SIZE), 1));

    return (
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Attendance"
          description="Who is in the office today, and each employee's attendance over the period, from their sign-ins on the office computers."
        />
        {toolbar}
        <HowItWorks isAdmin />

        <Card className="mb-6">
          <CardHeader
            icon={<Sunrise aria-hidden="true" />}
            title={`Today, ${formatDateLong(today)}`}
            description={`${inToday.length} of ${active.length} employees signed in so far.`}
          />
          <CardBody>
            {members.length ? (
              <TodayPanel members={members} records={inToday} today={today} now={now} />
            ) : (
              <EmptyState icon={<Users aria-hidden="true" />} title="No active employees" description="Add staff on the Team page." className="py-6" />
            )}
          </CardBody>
        </Card>

        <section aria-label={`Attendance, ${label}`} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Attendance rate"
            value={formatPercent(expected ? present / expected : null, "No data")}
            icon={<CalendarCheck aria-hidden="true" />}
            hint={`${present} of ${expected} working days, ${label.toLowerCase()}`}
          />
          <StatCard
            label="Average first sign-in"
            value={formatClock(avgIn)}
            icon={<Clock aria-hidden="true" />}
            hint={`Working day starts by ${LATE_AFTER_LABEL}`}
            tone={avgIn !== null && avgIn > LATE_AFTER_MINUTES ? "warning" : "default"}
          />
          <StatCard
            label="Late arrivals"
            value={late}
            icon={<Timer aria-hidden="true" />}
            hint={`Signed in after ${LATE_AFTER_LABEL}`}
            tone={late ? "warning" : "default"}
          />
          <StatCard label="Average day in the office" value={formatDuration(avgDay)} icon={<History aria-hidden="true" />} hint="First sign-in to last seen" />
        </section>

        <Card className="mb-6 overflow-hidden">
          <CardHeader
            icon={<Users aria-hidden="true" />}
            title="Register"
            description={`${label}: ${formatDate(period.from)} to ${formatDate(periodEnd)}. Select a name for their calendar and daily log.`}
          />
          {rows.length ? <RegisterTable rows={rows} keep={keepQuery} /> : <EmptyState title="No active employees" className="py-8" />}
        </Card>

        {active.length > 0 && (
          <Card className="mb-6">
            <CardHeader
              icon={<CalendarDays aria-hidden="true" />}
              title="Presence calendar"
              description={`Days in the office from ${formatDate(heat.from)}, shaded by hours from first sign-in to last seen.`}
            />
            <CardBody className="grid gap-8 md:grid-cols-2">
              {active.map((employee) => (
                <div key={employee.uid} className="min-w-0">
                  <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy">
                    <Avatar name={employee.displayName} uid={employee.uid} photoVersion={employee.photoUpdatedAt} size="xs" />
                    {employee.displayName}
                  </p>
                  <HeatmapBox from={heat.from} to={heat.to}>
                    <CalendarHeatmap
                      values={hoursByDate(records.filter((record) => record.uid === employee.uid))}
                      from={heat.from}
                      to={heat.to}
                      unit="h in the office"
                      thresholds={OFFICE_THRESHOLDS}
                      title={`Days ${employee.displayName} was in the office, by hours`}
                    />
                  </HeatmapBox>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader icon={<History aria-hidden="true" />} title="Daily log" description="Every sign-in day in the period, newest first." />
          {log.length ? (
            <>
              <DailyLog records={log.slice((logPage - 1) * LOG_PAGE_SIZE, logPage * LOG_PAGE_SIZE)} people={people} showPerson />
              <Pager page={logPage} pageSize={LOG_PAGE_SIZE} total={log.length} basePath="/attendance" params={keep} noun="days" />
            </>
          ) : (
            <EmptyState icon={<CalendarX2 aria-hidden="true" />} title="No sign-ins in this period" description="Choose a longer period, or check back once staff have signed in." className="py-10" />
          )}
        </Card>
      </div>
    );
  }

  /* ------------------------------------------------------------ one person */
  const isSelf = subject.uid === viewer.uid;
  const records = await listAttendance(viewer, { uid: subject.uid, from: heat.from, to: periodEnd });
  const people = new Map<string, PersonLite>();
  const inPeriod = records.filter((record) => record.date >= period.from && record.date <= period.to);
  const todayRecord = records.find((record) => record.date === today);
  const expected = expectedDays(period, today, subject.startDate, Boolean(todayRecord));
  const summary = summarise(inPeriod, expected);
  const logPage = Math.min(page, Math.max(Math.ceil(inPeriod.length / LOG_PAGE_SIZE), 1));
  const name = isSelf ? "You" : subject.displayName;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        back={viewer.isAdmin ? { href: `/attendance?${keepQuery.slice(1)}`, label: "All team" } : undefined}
        eyebrow={viewer.isAdmin ? "Attendance" : undefined}
        title={isSelf ? "My attendance" : subject.displayName}
        description={
          isSelf
            ? "Your office days, sign-in times and hours in the office, as recorded by your sign-ins."
            : `${subject.jobTitle || "Employee"}. Office days, sign-in times and hours in the office.`
        }
      />
      {toolbar}
      <HowItWorks isAdmin={viewer.isAdmin} />

      <section aria-label={`Attendance, ${label}`} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Days present"
          value={`${summary.daysPresent} of ${summary.expected}`}
          icon={<CalendarCheck aria-hidden="true" />}
          hint={`${formatPercent(summary.rate, "No working days yet")} attendance${summary.weekendDays ? `, plus ${summary.weekendDays} at the weekend` : ""}`}
          tone={summary.rate !== null && summary.rate < 0.75 ? "warning" : "default"}
        />
        <StatCard
          label="Average first sign-in"
          value={formatClock(summary.avgFirstIn)}
          icon={<Clock aria-hidden="true" />}
          hint={`Working day starts by ${LATE_AFTER_LABEL}`}
          tone={summary.avgFirstIn !== null && summary.avgFirstIn > LATE_AFTER_MINUTES ? "warning" : "default"}
        />
        <StatCard
          label="Late arrivals"
          value={summary.late}
          icon={<Timer aria-hidden="true" />}
          hint={`Days signed in after ${LATE_AFTER_LABEL}`}
          tone={summary.late ? "warning" : "default"}
        />
        <StatCard label="Average day in the office" value={formatDuration(summary.avgHours)} icon={<History aria-hidden="true" />} hint="First sign-in to last seen" />
      </section>

      <div className="mb-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader
            icon={<CalendarDays aria-hidden="true" />}
            title="Presence calendar"
            description={`Days in the office from ${formatDate(heat.from)}, shaded by hours from first sign-in to last seen.`}
          />
          <CardBody className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] md:items-start">
            <HeatmapBox from={heat.from} to={heat.to}>
              <CalendarHeatmap
                values={hoursByDate(records)}
                from={heat.from}
                to={heat.to}
                unit="h in the office"
                thresholds={OFFICE_THRESHOLDS}
                title={`Days ${isSelf ? "you were" : `${subject.displayName} was`} in the office, by hours`}
              />
            </HeatmapBox>
            <div>
              <p className="text-[0.8125rem] font-semibold text-navy">Typical arrival by weekday</p>
              <p className="mb-3 text-xs text-slate">Average first sign-in in the period. The line marks {LATE_AFTER_LABEL}.</p>
              <ArrivalPattern records={inPeriod} />
            </div>
          </CardBody>
        </Card>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader icon={<Sunrise aria-hidden="true" />} title="Today" description={formatDateLong(today)} />
            <CardBody>
              <TodayPanel
                members={[{ uid: subject.uid, name: subject.displayName, jobTitle: subject.jobTitle, photoVersion: subject.photoUpdatedAt }]}
                records={todayRecord ? [todayRecord] : []}
                today={today}
                now={now}
                single
              />
            </CardBody>
          </Card>
          <Card>
            <CardHeader
              icon={<CalendarX2 aria-hidden="true" />}
              title="Working days without a sign-in"
              description={summary.missed.length ? `${summary.missed.length} in the period, most recent first.` : undefined}
            />
            <CardBody>
              {summary.missed.length === 0 ? (
                <p className="text-sm text-slate">{summary.expected ? `${name} signed in on every working day in the period.` : "No working days have passed in this period yet."}</p>
              ) : (
                <ul className="flex flex-wrap gap-1.5">
                  {summary.missed.slice(0, 18).map((day) => (
                    <li key={day} className="tabular rounded-lg bg-cloud px-2 py-1 text-xs font-semibold text-navy ring-1 ring-mist ring-inset">
                      {formatWeekdayShort(day)} {formatDate(day)}
                    </li>
                  ))}
                  {summary.missed.length > 18 && <li className="px-1 py-1 text-xs text-slate">and {summary.missed.length - 18} more</li>}
                </ul>
              )}
              <p className="mt-3 text-xs text-slate">Leave and days out of the office on client work also show here.</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader icon={<History aria-hidden="true" />} title="Daily log" description={`${label}: ${formatDate(period.from)} to ${formatDate(periodEnd)}, newest first.`} />
        {inPeriod.length ? (
          <>
            <DailyLog records={inPeriod.slice((logPage - 1) * LOG_PAGE_SIZE, logPage * LOG_PAGE_SIZE)} people={people} showPerson={false} />
            <Pager
              page={logPage}
              pageSize={LOG_PAGE_SIZE}
              total={inPeriod.length}
              basePath="/attendance"
              params={{ ...keep, uid: viewer.isAdmin ? subject.uid : undefined }}
              noun="days"
            />
          </>
        ) : (
          <EmptyState icon={<CalendarX2 aria-hidden="true" />} title="No sign-ins in this period" description="Try a longer period." className="py-10" />
        )}
      </Card>
    </div>
  );
}
