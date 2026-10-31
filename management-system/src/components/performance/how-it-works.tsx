import { CircleHelp } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { GradeBadge } from "@/components/performance/grade-badge";
import { PART_INFO, PART_ORDER } from "@/components/performance/score-parts";
import { DEFAULT_TARGETS, SCORE_WEIGHTS } from "@/lib/constants";

const BANDS = [
  { score: 85, range: "85 and above" },
  { score: 70, range: "70 to 84" },
  { score: 55, range: "55 to 69" },
  { score: 0, range: "Below 55" },
];

/** Plain explanation of the composite score, its weights, targets and grades. */
export function HowScoreWorks({ viewerIsAdmin }: { viewerIsAdmin: boolean }) {
  const total = PART_ORDER.reduce((acc, key) => acc + SCORE_WEIGHTS[key], 0);
  return (
    <Card className="min-w-0 overflow-hidden print:break-inside-avoid print:shadow-none">
      <CardHeader icon={<CircleHelp aria-hidden="true" />} title="How the score works" description="One number from 0 to 100, built from four parts of the work." />
      <CardBody className="space-y-5 text-sm">
        <ul className="space-y-3">
          {PART_ORDER.map((key) => (
            <li key={key} className="flex gap-3">
              <span className="tabular grid h-7 w-11 shrink-0 place-items-center rounded-lg bg-blue-tint text-xs font-bold text-blue-dark">{SCORE_WEIGHTS[key]}%</span>
              <div className="min-w-0">
                <p className="font-semibold text-navy">{PART_INFO[key].label}</p>
                <p className="text-slate">{PART_INFO[key].explains}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-2 rounded-xl bg-cloud px-4 py-3 text-charcoal">
          <p>
            The weights add up to {total}. When a part has no data in the period (for example, nothing with a due date was completed), it is left out and
            the other parts are re-weighted so they still add up to {total}.
          </p>
          <p>
            Targets are set for each person on their staff profile: by default {DEFAULT_TARGETS.monthlyAssignments} completed assignments a month and{" "}
            {DEFAULT_TARGETS.weeklyHours} hours a week.{" "}
            {viewerIsAdmin ? "Adjust them from each person's profile under Team." : "Speak to the administrator if your targets need to change."}
          </p>
          <p>Hours and attendance are shown for context but do not count towards the score.</p>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-slate uppercase">Grades</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {BANDS.map((band) => (
              <li key={band.range} className="flex items-center justify-between gap-2 rounded-lg border border-mist px-3 py-2">
                <GradeBadge score={band.score} />
                <span className="tabular text-xs text-slate">{band.range}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
