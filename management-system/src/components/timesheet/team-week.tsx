import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmForm } from "@/components/ui/form";
import { TableWrap } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress";
import { TargetBadge, targetTone } from "@/components/timesheet/target-badge";
import { targetStatus } from "@/components/timesheet/week";
import { timesheetHref } from "@/components/timesheet/week-toolbar";
import { formatDayMonth, formatHours, formatWeekdayShort, isWeekday } from "@/lib/format";
import { cn, round, sum } from "@/lib/utils";
import type { ActionResult, TimeLog } from "@/lib/types";
import type { PersonLite } from "@/components/assignments/assignment-list";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export type TeamMember = { uid: string; name: string; jobTitle: string; weeklyHours: number; photoVersion: string | null };

function cell(hours: number) {
  return hours ? formatHours(hours).replace(" h", "") : "";
}

/** Employees down, days across: hours per day, the week total and where it stands against target. */
export function TeamWeekTable({
  members,
  logs,
  days,
  today,
  monday,
}: {
  members: TeamMember[];
  logs: TimeLog[];
  days: string[];
  today: string;
  monday: string;
}) {
  const hours = (uid: string, date?: string) =>
    round(sum(logs.filter((log) => log.uid === uid && (!date || log.date === date)).map((log) => log.hours)), 2);
  const dayTotal = (date: string) =>
    round(sum(logs.filter((log) => log.date === date && members.some((member) => member.uid === log.uid)).map((log) => log.hours)), 2);
  const teamTotal = round(sum(members.map((member) => hours(member.uid))), 2);
  const teamTarget = sum(members.map((member) => member.weeklyHours));

  if (!members.length) return <EmptyState title="No active employees" description="Add staff on the Team page to see their timesheets here." />;

  return (
    <TableWrap>
      <table className="data-table min-w-[60rem]">
        <caption className="sr-only">Hours logged per employee per day, with weekly totals</caption>
        <thead>
          <tr>
            <th scope="col">Employee</th>
            {days.map((day) => (
              <th key={day} scope="col" className={cn("text-right", day === today && "text-blue-dark")}>
                <span className="block">{formatWeekdayShort(day)}</span>
                <span className="block font-normal tracking-normal normal-case">{formatDayMonth(day)}</span>
              </th>
            ))}
            <th scope="col" className="text-right">
              Total
            </th>
            <th scope="col">Against target</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const total = hours(member.uid);
            const status = targetStatus(total, member.weeklyHours, monday, today);
            return (
              <tr key={member.uid}>
                <td>
                  <Link href={timesheetHref({ week: monday, uid: member.uid })} className="group flex items-center gap-2.5">
                    <Avatar name={member.name} uid={member.uid} photoVersion={member.photoVersion} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-navy group-hover:text-blue">{member.name}</span>
                      <span className="block truncate text-xs text-slate">{member.jobTitle || "Employee"}</span>
                    </span>
                  </Link>
                </td>
                {days.map((day) => {
                  const value = hours(member.uid, day);
                  return (
                    <td
                      key={day}
                      className={cn(
                        "tabular text-right",
                        !isWeekday(day) && "bg-cloud/60",
                        day === today && "bg-blue-tint/40",
                        value ? "font-semibold text-navy" : "text-slate/60",
                      )}
                    >
                      {cell(value) || <span aria-label="No time">0</span>}
                    </td>
                  );
                })}
                <td className="tabular text-right font-bold text-navy">{formatHours(total)}</td>
                <td className="w-56">
                  <div className="flex items-center gap-2">
                    <TargetBadge status={status} />
                  </div>
                  <ProgressBar
                    value={member.weeklyHours ? (total / member.weeklyHours) * 100 : 0}
                    tone={targetTone(status)}
                    size="sm"
                    className="mt-1.5"
                    label={`${member.name}: hours against the weekly target of ${member.weeklyHours}`}
                  />
                  <p className="tabular mt-1 text-xs text-slate">of {formatHours(member.weeklyHours)}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-cloud">
            <th scope="row" className="border-t border-mist px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate uppercase">
              Team total
            </th>
            {days.map((day) => (
              <td key={day} className="tabular border-t border-mist px-4 py-3 text-right text-sm font-semibold text-navy">
                {cell(dayTotal(day)) || <span className="text-slate/60">0</span>}
              </td>
            ))}
            <td className="tabular border-t border-mist px-4 py-3 text-right text-sm font-bold text-navy">{formatHours(teamTotal)}</td>
            <td className="tabular border-t border-mist px-4 py-3 text-xs text-slate">of {formatHours(teamTarget)} combined target</td>
          </tr>
        </tfoot>
      </table>
    </TableWrap>
  );
}

/** Every entry in the week, newest day first, for the administrator to check and correct. */
export function TeamEntries({
  logs,
  people,
  deleteAction,
}: {
  logs: TimeLog[];
  people: Map<string, PersonLite>;
  deleteAction: Action;
}) {
  if (!logs.length) return <EmptyState title="No time logged this week" description="Entries appear here as staff log their hours." className="py-10" />;
  return (
    <>
      <TableWrap className="hidden md:block">
        <table className="data-table min-w-[40rem]">
          <caption className="sr-only">Time entries this week</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Employee</th>
              <th scope="col">Worked on</th>
              <th scope="col" className="text-right">
                Hours
              </th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const person = people.get(log.uid);
              return (
                <tr key={log.id}>
                  <td className="tabular whitespace-nowrap text-slate">
                    {formatWeekdayShort(log.date)} {formatDayMonth(log.date)}
                  </td>
                  <td className="whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <Avatar name={person?.name ?? "Former staff"} uid={log.uid} photoVersion={person?.photoVersion} size="xs" />
                      <span className="font-semibold text-navy">{person?.name ?? "Former staff"}</span>
                    </span>
                  </td>
                  <td className="max-w-80">
                    {log.assignmentId ? (
                      <Link href={`/assignments/${log.assignmentId}`} className="group block">
                        <span className="tabular block text-xs font-semibold text-slate">{log.assignmentRef}</span>
                        <span className="block truncate font-semibold text-navy group-hover:text-blue">{log.assignmentTitle}</span>
                      </Link>
                    ) : (
                      <span className="block font-semibold text-navy">General office work</span>
                    )}
                    {log.note && (
                      <span className="mt-0.5 block truncate text-xs text-slate" title={log.note}>
                        {log.note}
                      </span>
                    )}
                  </td>
                  <td className="tabular text-right font-semibold text-navy">{formatHours(log.hours)}</td>
                  <td className="w-12 text-right">
                    <ConfirmForm action={deleteAction} confirm={`Delete ${person?.name ?? "this"}'s entry of ${formatHours(log.hours)} on ${formatDayMonth(log.date)}?`} hidden={{ id: log.id }}>
                      <button
                        type="submit"
                        className="grid size-8 place-items-center rounded-lg text-slate transition-colors hover:bg-danger-tint hover:text-danger"
                        aria-label={`Delete ${person?.name ?? "this"} entry of ${formatHours(log.hours)} on ${formatDayMonth(log.date)}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </ConfirmForm>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
      <ul className="divide-y divide-mist md:hidden">
        {logs.map((log) => {
          const person = people.get(log.uid);
          return (
            <li key={log.id} className="flex items-start gap-3 px-4 py-3">
              <Avatar name={person?.name ?? "Former staff"} uid={log.uid} photoVersion={person?.photoVersion} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate">
                  <span className="font-semibold text-navy">{person?.name ?? "Former staff"}</span>, {formatWeekdayShort(log.date)} {formatDayMonth(log.date)}
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-navy">
                  {log.assignmentId ? `${log.assignmentRef} ${log.assignmentTitle}` : "General office work"}
                </p>
                {log.note && <p className="truncate text-xs text-slate">{log.note}</p>}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="tabular text-sm font-bold text-navy">{formatHours(log.hours)}</span>
                <ConfirmForm action={deleteAction} confirm={`Delete this entry of ${formatHours(log.hours)}?`} hidden={{ id: log.id }}>
                  <button type="submit" className="text-xs font-semibold text-slate hover:text-danger">
                    Delete
                  </button>
                </ConfirmForm>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
