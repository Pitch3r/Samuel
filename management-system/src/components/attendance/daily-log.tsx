import { Clock, LogOut, Monitor } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TableWrap } from "@/components/ui/misc";
import { formatDate, formatTime, formatWeekdayShort, isWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { firstSignIn, formatDuration, hoursInOffice, isLate, isSignedOut, lastActivity } from "@/components/attendance/stats";
import type { AttendanceRecord } from "@/lib/types";
import type { PersonLite } from "@/components/assignments/assignment-list";

function LateBadge() {
  return (
    <Badge tone="warning" icon={<Clock aria-hidden="true" />} className="px-1.5 text-[0.65rem]">
      Late
    </Badge>
  );
}

/** Day-by-day sign-in records, newest first. */
export function DailyLog({ records, people, showPerson }: { records: AttendanceRecord[]; people: Map<string, PersonLite>; showPerson: boolean }) {
  return (
    <>
      <TableWrap className="hidden md:block">
        <table className="data-table min-w-[56rem]">
          <caption className="sr-only">Daily attendance log</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              {showPerson && <th scope="col">Employee</th>}
              <th scope="col">First sign-in</th>
              <th scope="col">Last seen</th>
              <th scope="col">Signed out</th>
              <th scope="col" className="text-right">
                In the office
              </th>
              <th scope="col">Computer</th>
              <th scope="col">IP address</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const person = people.get(record.uid);
              return (
                <tr key={record.id}>
                  <td className="whitespace-nowrap">
                    <span className={cn("tabular font-semibold", isWeekday(record.date) ? "text-navy" : "text-slate")}>
                      {formatWeekdayShort(record.date)} {formatDate(record.date)}
                    </span>
                  </td>
                  {showPerson && (
                    <td className="whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <Avatar name={person?.name ?? "Former staff"} uid={record.uid} photoVersion={person?.photoVersion} size="xs" />
                        <span className="font-semibold text-navy">{person?.name ?? "Former staff"}</span>
                      </span>
                    </td>
                  )}
                  <td className="whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span className="tabular font-semibold text-navy">{formatTime(firstSignIn(record))}</span>
                      {isLate(record) && <LateBadge />}
                    </span>
                  </td>
                  <td className="tabular text-charcoal">{formatTime(record.lastSeenAt)}</td>
                  <td className="tabular text-charcoal">{record.lastSignOutAt ? formatTime(record.lastSignOutAt) : <span className="text-slate">Not signed out</span>}</td>
                  <td className="tabular text-right font-semibold text-navy">{formatDuration(hoursInOffice(record), "Under a minute")}</td>
                  <td className="max-w-48 truncate text-charcoal">{record.deviceLabel || <span className="text-slate">Not recorded</span>}</td>
                  <td className="tabular text-slate">{record.ip || "Not recorded"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>

      <ul className="divide-y divide-mist md:hidden">
        {records.map((record) => {
          const person = people.get(record.uid);
          return (
            <li key={record.id} className="px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="tabular text-sm font-semibold text-navy">
                  {formatWeekdayShort(record.date)} {formatDate(record.date)}
                </p>
                <span className="tabular text-xs font-semibold text-slate">{formatDuration(hoursInOffice(record), "Under a minute")}</span>
              </div>
              {showPerson && <p className="mt-0.5 text-xs text-slate">{person?.name ?? "Former staff"}</p>}
              <p className="tabular mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-charcoal">
                <span className="inline-flex items-center gap-1.5">
                  In {formatTime(firstSignIn(record))}
                  {isLate(record) && <LateBadge />}
                </span>
                <span className="inline-flex items-center gap-1">
                  {isSignedOut(record) && <LogOut className="size-3.5 text-slate" aria-hidden="true" />}
                  {isSignedOut(record) ? "Out" : "Last seen"} {formatTime(lastActivity(record))}
                </span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate">
                <Monitor className="size-3.5 shrink-0" aria-hidden="true" />
                {record.deviceLabel || "Computer not recorded"}
                {record.ip ? `, ${record.ip}` : ""}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
