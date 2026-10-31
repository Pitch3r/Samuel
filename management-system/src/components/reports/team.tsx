import Link from "next/link";
import type { ReactNode } from "react";
import { UserPlus, Users } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap } from "@/components/ui/misc";
import { seriesColor, type SeriesSlot } from "@/components/charts/scale";
import { PanelHeader, reportCard } from "@/components/reports/panel";
import { ScoreCell } from "@/components/performance/grade-badge";
import { Stars } from "@/components/performance/stars";
import { formatHours, formatPercent } from "@/lib/format";
import type { EmployeeMetrics } from "@/lib/metrics";

export type TeamRow = {
  uid: string;
  name: string;
  jobTitle: string;
  photoVersion: string | null;
  slot: SeriesSlot;
  metrics: EmployeeMetrics;
};

function attendanceRate(metrics: EmployeeMetrics) {
  return metrics.workingDays ? metrics.attendanceDays / metrics.workingDays : null;
}

/** Avatar with the person's chart colour as a dot, name linking to their scorecard, and job title. */
function Person({ row }: { row: TeamRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative shrink-0">
        <Avatar name={row.name} uid={row.uid} photoVersion={row.photoVersion} size="sm" />
        <span
          className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-white [print-color-adjust:exact]"
          style={{ background: seriesColor(row.slot) }}
          aria-hidden="true"
        />
      </span>
      <div className="min-w-0">
        <Link href={`/performance?uid=${encodeURIComponent(row.uid)}`} className="font-semibold text-navy hover:text-blue hover:underline">
          {row.name}
        </Link>
        <p className="truncate text-xs text-slate">{row.jobTitle || "Employee"}</p>
      </div>
    </div>
  );
}

function Fact({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.7rem] font-semibold tracking-wide text-slate uppercase">{label}</dt>
      <dd className="tabular mt-0.5 text-sm font-semibold text-navy">{value}</dd>
      {sub && <dd className="text-xs text-slate">{sub}</dd>}
    </div>
  );
}

/** Each active employee's delivery, effort and score for the period: a table, or cards on a phone. */
export function TeamSection({ rows, hasEmployees, performanceHref }: { rows: TeamRow[]; hasEmployees: boolean; performanceHref: string }) {
  return (
    <Card className={reportCard}>
      <PanelHeader
        icon={<Users aria-hidden="true" />}
        title="Team performance"
        description="Delivery, effort and reporting for each active employee in the period, with their composite score."
      />
      {rows.length ? (
        <>
          {/* Phones and paper: one card per person. */}
          <ul className="divide-y divide-mist md:hidden print:block">
            {rows.map((row) => {
              const { metrics } = row;
              return (
                <li key={row.uid} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <Person row={row} />
                    <ScoreCell score={metrics.score} stacked />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 print:grid-cols-6">
                    <Fact label="Completed" value={metrics.completedInPeriod} sub={`target ${metrics.completedTarget}`} />
                    <Fact label="On time" value={formatPercent(metrics.onTimeRate, "N/A")} sub={`${metrics.completedOnTime} on time, ${metrics.completedLate} late`} />
                    <Fact label="Avg quality" value={<Stars value={metrics.avgQuality} showValue />} />
                    <Fact label="Hours" value={formatHours(metrics.hoursLogged)} sub={`of ${formatHours(metrics.hoursTarget)}`} />
                    <Fact label="Reports" value={`${metrics.reportWeeksCovered} of ${metrics.reportWeeksExpected}`} sub="weeks covered" />
                    <Fact
                      label="Attendance"
                      value={formatPercent(attendanceRate(metrics), "N/A")}
                      sub={`${metrics.attendanceDays} of ${metrics.workingDays} days`}
                    />
                  </dl>
                </li>
              );
            })}
          </ul>

          <TableWrap className="hidden md:block print:hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Employee</th>
                  <th scope="col" className="text-right">
                    Completed
                  </th>
                  <th scope="col" className="text-right">
                    On time
                  </th>
                  <th scope="col">Avg quality</th>
                  <th scope="col" className="text-right">
                    Hours
                  </th>
                  <th scope="col" className="text-right">
                    Reports
                  </th>
                  <th scope="col" className="text-right">
                    Attendance
                  </th>
                  <th scope="col">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const { metrics } = row;
                  const attendance = attendanceRate(metrics);
                  return (
                    <tr key={row.uid}>
                      <td className="min-w-[12rem]">
                        <Person row={row} />
                      </td>
                      <td className="tabular text-right">
                        <span className="font-semibold text-navy">{metrics.completedInPeriod}</span>
                        <span className="block text-xs whitespace-nowrap text-slate">target {metrics.completedTarget}</span>
                      </td>
                      <td className="tabular text-right">
                        <span className="font-semibold text-navy">{formatPercent(metrics.onTimeRate, "N/A")}</span>
                        <span className="block text-xs whitespace-nowrap text-slate">
                          {metrics.completedOnTime} on time, {metrics.completedLate} late
                        </span>
                      </td>
                      <td>
                        <Stars value={metrics.avgQuality} showValue />
                      </td>
                      <td className="tabular text-right whitespace-nowrap">
                        <span className="font-semibold text-navy">{formatHours(metrics.hoursLogged)}</span>
                        <span className="block text-xs text-slate">of {formatHours(metrics.hoursTarget)}</span>
                      </td>
                      <td className="tabular text-right whitespace-nowrap">
                        <span className="font-semibold text-navy">
                          {metrics.reportWeeksCovered} of {metrics.reportWeeksExpected}
                        </span>
                        <span className="block text-xs text-slate">weeks covered</span>
                      </td>
                      <td className="tabular text-right whitespace-nowrap">
                        <span className="font-semibold text-navy">{formatPercent(attendance, "N/A")}</span>
                        <span className="block text-xs text-slate">
                          {metrics.attendanceDays} of {metrics.workingDays} days
                        </span>
                      </td>
                      <td>
                        <ScoreCell score={metrics.score} stacked />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
        </>
      ) : (
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title={hasEmployees ? "No active employees" : "No employees yet"}
          description="Add staff so their work and performance can be reported."
          action={
            <ButtonLink href="/team/new" size="sm">
              <UserPlus aria-hidden="true" />
              Add employee
            </ButtonLink>
          }
        />
      )}
      {rows.length > 0 && (
        <CardFooter className="no-print flex flex-wrap items-center justify-between gap-3 text-xs text-slate">
          <span>Attendance counts days with an office sign-in. Hours and completion targets come from each person&apos;s profile.</span>
          <Link href={performanceHref} className="font-semibold text-blue-dark hover:underline">
            Full scorecards
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
