import Link from "next/link";
import { CircleCheck, CircleDashed, Clock, LogOut, Monitor, Moon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelative, formatTime, isWeekday } from "@/lib/format";
import { cn } from "@/lib/utils";
import { firstSignIn, isLate, isSignedOut, lastActivity, LATE_AFTER_LABEL, LATE_AFTER_MINUTES, lusakaMinutes } from "@/components/attendance/stats";
import type { AttendanceRecord } from "@/lib/types";

export type TodayMember = { uid: string; name: string; jobTitle: string; photoVersion: string | null };

/** Present, signed out, or not in yet: one tile per employee for today. */
export function TodayPanel({
  members,
  records,
  today,
  now,
  single = false,
}: {
  members: TodayMember[];
  records: AttendanceRecord[];
  today: string;
  now: Date;
  /** One person in a narrow card: a single column, without the tile border. */
  single?: boolean;
}) {
  const workday = isWeekday(today);
  const afterStart = lusakaMinutes(now.toISOString()) > LATE_AFTER_MINUTES;
  return (
    <ul className={cn("grid grid-cols-1 gap-3", !single && "sm:grid-cols-2 xl:grid-cols-3")}>
      {members.map((member) => {
        const record = records.find((item) => item.uid === member.uid);
        return (
          <li
            key={member.uid}
            className={cn("min-w-0", !single && "rounded-xl border p-4", !single && (record ? "border-mist bg-white" : "border-dashed border-mist bg-cloud/60"))}
          >
            <div className="flex items-start justify-between gap-3">
              <Link href={`/attendance?uid=${encodeURIComponent(member.uid)}`} className="group flex min-w-0 items-center gap-2.5">
                <Avatar name={member.name} uid={member.uid} photoVersion={member.photoVersion} size="md" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-navy group-hover:text-blue">{member.name}</span>
                  <span className="block truncate text-xs text-slate">{member.jobTitle || "Employee"}</span>
                </span>
              </Link>
              {record ? (
                isSignedOut(record) ? (
                  <Badge tone="neutral" icon={<LogOut aria-hidden="true" />}>
                    Signed out
                  </Badge>
                ) : (
                  <Badge tone="good" icon={<CircleCheck aria-hidden="true" />}>
                    In the office
                  </Badge>
                )
              ) : workday ? (
                <Badge tone={afterStart ? "warning" : "neutral"} icon={<CircleDashed aria-hidden="true" />}>
                  Not signed in
                </Badge>
              ) : (
                <Badge tone="neutral" icon={<Moon aria-hidden="true" />}>
                  Weekend
                </Badge>
              )}
            </div>

            {record ? (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-slate">First sign-in</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5">
                    <span className="tabular font-semibold text-navy">{formatTime(firstSignIn(record))}</span>
                    {isLate(record) && (
                      <Badge tone="warning" icon={<Clock aria-hidden="true" />} className="px-1.5 text-[0.65rem]">
                        Late
                      </Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate">{isSignedOut(record) ? "Signed out" : "Last seen"}</dt>
                  <dd className="mt-0.5">
                    <span className="tabular font-semibold text-navy">{formatTime(lastActivity(record))}</span>
                    <span className="ml-1.5 text-xs text-slate">{formatRelative(lastActivity(record), now)}</span>
                  </dd>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 text-xs text-slate">
                  <Monitor className="size-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {record.deviceLabel || "Computer not recorded"}
                    {record.ip ? `, ${record.ip}` : ""}
                    {record.signIns > 1 ? `, ${record.signIns} sign-ins` : ""}
                  </span>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-slate">
                {workday
                  ? afterStart
                    ? `No sign-in yet today. The working day starts by ${LATE_AFTER_LABEL}.`
                    : "Not in yet. The working day has not started."
                  : "No sign-in today. It is not an office day."}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
