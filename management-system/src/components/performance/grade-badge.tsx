import { CircleAlert, CircleCheck, Minus, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { scoreGrade } from "@/lib/metrics";

const GRADE_ICONS = {
  good: <CircleCheck aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  danger: <CircleAlert aria-hidden="true" />,
  neutral: <Minus aria-hidden="true" />,
} as const;

/** The grade for a performance score, with an icon so it never relies on colour alone. */
export function GradeBadge({ score, className }: { score: number | null; className?: string }) {
  const grade = scoreGrade(score);
  return (
    <Badge tone={grade.tone} icon={GRADE_ICONS[grade.tone]} className={className}>
      {grade.label}
    </Badge>
  );
}

/** Score with its grade, for tables: side by side, or the grade under the score where columns are tight. */
export function ScoreCell({ score, stacked = false }: { score: number | null; stacked?: boolean }) {
  if (stacked) {
    return (
      <span className="inline-flex flex-col items-start gap-1">
        <span className="tabular font-display text-lg leading-none font-bold text-navy">{score ?? "N/A"}</span>
        <GradeBadge score={score} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="tabular w-8 text-right font-display text-base font-bold text-navy">{score ?? "N/A"}</span>
      <GradeBadge score={score} />
    </span>
  );
}
