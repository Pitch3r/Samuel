import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress";
import { TableWrap } from "@/components/ui/misc";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatClock, formatDuration, LATE_AFTER_LABEL, LATE_AFTER_MINUTES, rateTone, type AttendanceSummary } from "@/components/attendance/stats";

export type RegisterRow = { uid: string; name: string; jobTitle: string; photoVersion: string | null; summary: AttendanceSummary };

function rateLabel(rate: number | null) {
  if (rate === null) return "No working days yet";
  if (rate >= 0.9) return "Good";
  if (rate >= 0.75) return "Fair";
  return "Low";
}

/** One row per employee: days present, rate, typical arrival, late arrivals and length of day. */
export function RegisterTable({ rows, keep }: { rows: RegisterRow[]; keep: string }) {
  return (
    <>
      <TableWrap className="hidden md:block">
        <table className="data-table min-w-[54rem]">
          <caption className="sr-only">Attendance register for the period</caption>
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col" className="text-right">
                Days present
              </th>
              <th scope="col">Attendance rate</th>
              <th scope="col" className="text-right">
                Average first sign-in
              </th>
              <th scope="col" className="text-right">
                Late arrivals
              </th>
              <th scope="col" className="text-right">
                Average day
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ uid, name, jobTitle, photoVersion, summary }) => (
              <tr key={uid}>
                <td>
                  <Link href={`/attendance?uid=${encodeURIComponent(uid)}${keep}`} className="group flex items-center gap-2.5">
                    <Avatar name={name} uid={uid} photoVersion={photoVersion} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-navy group-hover:text-blue">{name}</span>
                      <span className="block truncate text-xs text-slate">{jobTitle || "Employee"}</span>
                    </span>
                  </Link>
                </td>
                <td className="tabular text-right">
                  <span className="font-semibold text-navy">{summary.daysPresent}</span>
                  <span className="text-slate"> of {summary.expected}</span>
                  {summary.weekendDays > 0 && <p className="text-xs text-slate">plus {summary.weekendDays} at the weekend</p>}
                </td>
                <td className="w-60">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="tabular font-semibold text-navy">{formatPercent(summary.rate, "No data")}</span>
                    <span className="text-slate">{rateLabel(summary.rate)}</span>
                  </div>
                  <ProgressBar value={(summary.rate ?? 0) * 100} tone={rateTone(summary.rate)} size="sm" className="mt-1.5" label={`${name}: attendance rate`} />
                </td>
                <td className={cn("tabular text-right font-semibold", summary.avgFirstIn !== null && summary.avgFirstIn > LATE_AFTER_MINUTES ? "text-warning" : "text-navy")}>
                  {formatClock(summary.avgFirstIn)}
                </td>
                <td className="tabular text-right">
                  <span className={cn("font-semibold", summary.late ? "text-warning" : "text-navy")}>{summary.late}</span>
                  <p className="text-xs text-slate">after {LATE_AFTER_LABEL}</p>
                </td>
                <td className="tabular text-right font-semibold text-navy">{formatDuration(summary.avgHours)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      <ul className="divide-y divide-mist md:hidden">
        {rows.map(({ uid, name, jobTitle, photoVersion, summary }) => (
          <li key={uid} className="px-4 py-4">
            <Link href={`/attendance?uid=${encodeURIComponent(uid)}${keep}`} className="flex items-center gap-2.5">
              <Avatar name={name} uid={uid} photoVersion={photoVersion} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-navy">{name}</span>
                <span className="block truncate text-xs text-slate">{jobTitle || "Employee"}</span>
              </span>
              <span className="tabular text-sm font-semibold text-navy">{formatPercent(summary.rate, "No data")}</span>
            </Link>
            <ProgressBar value={(summary.rate ?? 0) * 100} tone={rateTone(summary.rate)} size="sm" className="mt-3" label={`${name}: attendance rate`} />
            <dl className="tabular mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-slate">Days present</dt>
                <dd className="font-semibold text-navy">
                  {summary.daysPresent} of {summary.expected}
                </dd>
              </div>
              <div>
                <dt className="text-slate">Average first sign-in</dt>
                <dd className="font-semibold text-navy">{formatClock(summary.avgFirstIn)}</dd>
              </div>
              <div>
                <dt className="text-slate">Late arrivals</dt>
                <dd className="font-semibold text-navy">{summary.late}</dd>
              </div>
              <div>
                <dt className="text-slate">Average day</dt>
                <dd className="font-semibold text-navy">{formatDuration(summary.avgHours)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
