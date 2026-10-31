import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress";
import { TableWrap } from "@/components/ui/misc";
import { Sparkline } from "@/components/charts/sparkline";
import { seriesColor } from "@/components/charts/scale";
import { ScoreCell } from "@/components/performance/grade-badge";
import { PART_INFO, PART_ORDER } from "@/components/performance/score-parts";
import { formatHours, formatPercent } from "@/lib/format";
import type { Scorecard } from "@/app/(app)/performance/performance-data";

/** The four parts of one person's score as a compact two-by-two grid of labelled meters. */
function PartsGrid({ card }: { card: Scorecard }) {
  return (
    <dl className="grid min-w-[13.5rem] grid-cols-2 gap-x-3 gap-y-2">
      {PART_ORDER.map((key) => {
        const value = card.metrics.parts[key];
        return (
          <div key={key} className="min-w-0">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <dt className="text-slate">{PART_INFO[key].short}</dt>
              <dd className="tabular font-semibold text-navy">{value === null ? <span className="font-normal text-slate">Left out</span> : formatPercent(value)}</dd>
            </div>
            <ProgressBar value={value === null ? 0 : value * 100} size="sm" tone="blue" label={`${card.person.name}, ${PART_INFO[key].label.toLowerCase()}`} className="mt-1" />
          </div>
        );
      })}
    </dl>
  );
}

/** Every active employee side by side: score and trend, its four parts and the effort behind it. */
export function ComparisonTable({ cards, focusHref }: { cards: Scorecard[]; focusHref: (uid: string) => string }) {
  return (
    <Card className="min-w-0 overflow-hidden print:shadow-none">
      <CardHeader icon={<Users aria-hidden="true" />} title="Team comparison" description="Scores and their parts for the period. Open a name for the full scorecard." />
      <TableWrap>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Employee</th>
              <th scope="col">Score and six-month trend</th>
              <th scope="col">Parts of the score</th>
              <th scope="col" className="text-right">
                Completed
              </th>
              <th scope="col" className="text-right">
                Hours
              </th>
              <th scope="col" className="text-right">
                Office days
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => {
              const { person, metrics, trend } = card;
              const scores = trend.map((point) => point.score).filter((score): score is number => score !== null);
              return (
                <tr key={person.uid}>
                  <td className="min-w-[11rem]">
                    <div className="flex items-center gap-3">
                      <span className="relative shrink-0">
                        <Avatar name={person.name} uid={person.uid} photoVersion={person.photoVersion} size="sm" />
                        <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-white" style={{ background: seriesColor(person.slot) }} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <Link href={focusHref(person.uid)} className="font-semibold text-navy hover:text-blue hover:underline">
                          {person.name}
                        </Link>
                        <p className="truncate text-xs text-slate">{person.jobTitle || "Employee"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <ScoreCell score={metrics.score} stacked />
                      {scores.length >= 2 ? (
                        <Sparkline values={scores} className="h-8 w-16 shrink-0" label={`${person.name}, monthly scores`} />
                      ) : (
                        <span className="text-xs text-slate">No trend yet</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <PartsGrid card={card} />
                  </td>
                  <td className="tabular text-right whitespace-nowrap">
                    <span className="font-semibold text-navy">{metrics.completedInPeriod}</span>
                    <span className="block text-xs text-slate">target {metrics.completedTarget}</span>
                  </td>
                  <td className="tabular text-right whitespace-nowrap">
                    <span className="font-semibold text-navy">{formatHours(metrics.hoursLogged)}</span>
                    <span className="block text-xs text-slate">of {formatHours(metrics.hoursTarget)}</span>
                  </td>
                  <td className="tabular text-right whitespace-nowrap">
                    <span className="font-semibold text-navy">
                      {metrics.attendanceDays} of {metrics.workingDays}
                    </span>
                    <span className="block text-xs text-slate">working days</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
      <CardFooter className="text-xs text-slate">
        Parts marked &ldquo;left out&rdquo; had no data in the period, and the score re-weights the others. Completed work and hours are measured against
        each person&apos;s own targets.
      </CardFooter>
    </Card>
  );
}
