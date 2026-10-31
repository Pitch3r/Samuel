import { PencilLine, Target } from "lucide-react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { formatHours } from "@/lib/format";
import { plural } from "@/lib/utils";
import type { Scorecard } from "@/app/(app)/performance/performance-data";

/** Each employee's targets, which the throughput part and the hours figures are measured against. */
export function TargetsCard({ cards }: { cards: Scorecard[] }) {
  return (
    <Card className="min-w-0 overflow-hidden print:shadow-none">
      <CardHeader icon={<Target aria-hidden="true" />} title="Targets" description="Set per person on their staff profile. Throughput and hours are measured against them." />
      <ul className="divide-y divide-mist">
        {cards.map(({ person, metrics }) => (
          <li key={person.uid} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={person.name} uid={person.uid} photoVersion={person.photoVersion} size="sm" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy">{person.name}</p>
                <p className="text-xs text-slate">
                  {plural(person.targets.monthlyAssignments, "assignment")} a month, {formatHours(person.targets.weeklyHours)} a week
                </p>
                <p className="text-xs text-slate">
                  For this period: {metrics.completedTarget} completed, {formatHours(metrics.hoursTarget)}
                </p>
              </div>
            </div>
            <ButtonLink href={`/team/${encodeURIComponent(person.uid)}?tab=edit`} variant="secondary" size="sm" className="no-print">
              <PencilLine aria-hidden="true" />
              Adjust
            </ButtonLink>
          </li>
        ))}
      </ul>
      <CardFooter className="text-xs text-slate">For a period, the monthly target is scaled to its length and the weekly hours to its working days.</CardFooter>
    </Card>
  );
}
