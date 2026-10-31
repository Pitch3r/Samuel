import { CircleAlert, CircleCheck, Minus, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { scoreGrade } from "@/lib/metrics";

const GRADE_ICONS = {
  good: <CircleCheck aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  danger: <CircleAlert aria-hidden="true" />,
  neutral: <Minus aria-hidden="true" />,
} as const;

/** The performance grade for a score, with an icon so it never relies on colour alone. */
export function GradeBadge({ score, className }: { score: number | null; className?: string }) {
  const grade = scoreGrade(score);
  return (
    <Badge tone={grade.tone} icon={GRADE_ICONS[grade.tone]} className={className}>
      {grade.label}
    </Badge>
  );
}
