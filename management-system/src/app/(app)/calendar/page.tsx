import type { Metadata } from "next";
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listUsers } from "@/lib/data/users";
import { addDays, todayISO } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { AgendaList } from "@/components/calendar/agenda-list";
import { CalendarLegend } from "@/components/calendar/calendar-legend";
import { CalendarFilters, calendarHref, type CalendarFilterValues } from "@/components/calendar/calendar-filters";
import { MonthGrid } from "@/components/calendar/month-grid";
import { eventsFor, groupByDate, monthLabel, monthWeeks, parseMonth, shiftMonth } from "@/components/calendar/model";
import type { PersonLite } from "@/components/assignments/assignment-list";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage(props: PageProps<"/calendar">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const today = todayISO();

  // Employees only ever receive their own assignments from the data layer; the
  // staff list is only needed for the administrator's person filter and avatars.
  const [assignments, users] = await Promise.all([listAssignmentsFor(viewer), viewer.isAdmin ? listUsers() : Promise.resolve([])]);
  const employees = users.filter((user) => user.role === "employee");
  const people = new Map<string, PersonLite>(users.map((user) => [user.uid, { uid: user.uid, name: user.displayName, photoVersion: user.photoUpdatedAt }]));

  const values: CalendarFilterValues = {
    month: parseMonth(params.month, today),
    track: params.track === "corporate" || params.track === "academic" ? params.track : "",
    person: viewer.isAdmin && typeof params.person === "string" && employees.some((user) => user.uid === params.person) ? params.person : "",
    show: params.show === "open" ? "open" : "all",
  };
  const { month } = values;

  const scoped = assignments.filter(
    (assignment) => (!values.track || assignment.track === values.track) && (!values.person || assignment.assigneeIds.includes(values.person)),
  );
  const events = eventsFor(scoped, today);
  const visible = values.show === "open" ? events.filter((event) => !event.closed) : events;

  const weeks = monthWeeks(month);
  const gridStart = weeks[0]![0]!;
  const gridEnd = weeks[weeks.length - 1]![6]!;
  const byDate = groupByDate(visible.filter((event) => event.date >= gridStart && event.date <= gridEnd));
  const inMonth = visible.filter((event) => event.date.startsWith(month));

  // Month summary counts only assignment deadlines; milestones are counted separately.
  const deadlines = events.filter((event) => event.kind === "assignment" && event.date.startsWith(month));
  const milestones = events.filter((event) => event.kind === "milestone" && event.date.startsWith(month));
  const summary = [
    plural(deadlines.length, "deadline"),
    `${deadlines.filter((event) => event.done).length} completed`,
    `${deadlines.filter((event) => event.overdue).length} overdue`,
    plural(milestones.length, "milestone"),
  ].join(", ");

  // Side panel: open work due today and over the next 13 days, with anything late first.
  const horizon = addDays(today, 13);
  const upcoming = events.filter((event) => !event.closed && (event.overdue || (event.date >= today && event.date <= horizon)));

  const isCurrentMonth = month === today.slice(0, 7);

  return (
    <>
      <PageHeader
        title="Calendar"
        description={
          viewer.isAdmin
            ? "Assignment due dates and milestones across the team. Open any item to see the assignment."
            : "Due dates and milestones for your assignments. Open any item to see the assignment."
        }
        actions={
          viewer.isAdmin ? (
            <ButtonLink href="/assignments/new">
              <Plus aria-hidden="true" />
              New assignment
            </ButtonLink>
          ) : (
            <ButtonLink href="/assignments" variant="secondary">
              My assignments
            </ButtonLink>
          )
        }
      />

      <div className="mb-5">
        <CalendarFilters values={values} people={viewer.isAdmin ? employees.map((user) => ({ uid: user.uid, name: user.displayName })) : null} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <Card className="min-w-0">
          <CardHeader
            icon={<CalendarDays aria-hidden="true" />}
            title={<span aria-live="polite">{monthLabel(month)}</span>}
            description={summary}
            action={
              <nav aria-label="Change month" className="flex items-center gap-1.5">
                <ButtonLink href={calendarHref(values, { month: shiftMonth(month, -1) })} variant="secondary" size="sm" aria-label={`Previous month, ${monthLabel(shiftMonth(month, -1))}`}>
                  <ChevronLeft aria-hidden="true" />
                </ButtonLink>
                <ButtonLink
                  href={calendarHref(values, { month: today.slice(0, 7) })}
                  variant={isCurrentMonth ? "subtle" : "secondary"}
                  size="sm"
                  aria-current={isCurrentMonth ? "date" : undefined}
                >
                  Today
                </ButtonLink>
                <ButtonLink href={calendarHref(values, { month: shiftMonth(month, 1) })} variant="secondary" size="sm" aria-label={`Next month, ${monthLabel(shiftMonth(month, 1))}`}>
                  <ChevronRight aria-hidden="true" />
                </ButtonLink>
              </nav>
            }
          />
          <div className="hidden md:block">
            <MonthGrid month={month} weeks={weeks} byDate={byDate} />
          </div>
          <div className="md:hidden">
            <AgendaList
              events={inMonth}
              people={viewer.isAdmin ? people : undefined}
              empty={`Nothing due in ${monthLabel(month)}`}
              emptyDescription="Use the arrows to look at another month."
            />
          </div>
          <CardFooter className="bg-cloud/40">
            <CalendarLegend />
          </CardFooter>
        </Card>

        <Card className="min-w-0 xl:sticky xl:top-24">
          <CardHeader
            icon={<CalendarRange aria-hidden="true" />}
            title="Next 14 days"
            description={upcoming.length ? `${plural(upcoming.length, "open item")} to deliver, overdue work first.` : "Open deadlines and milestones."}
          />
          <div className="max-h-[70dvh] overflow-y-auto xl:max-h-[calc(100dvh-14rem)]">
            <AgendaList
              events={upcoming}
              people={viewer.isAdmin ? people : undefined}
              overdueFirst
              empty="Nothing due in the next 14 days"
              emptyDescription="New deadlines appear here as soon as they are set."
            />
          </div>
        </Card>
      </div>
    </>
  );
}
