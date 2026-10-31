import { CalendarDays, CalendarRange, CircleCheck, Hourglass, Star, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReportPeriod, ReportStatus } from "@/lib/constants";

export const RATING_LABELS: Record<number, string> = {
  1: "Needs improvement",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

const PERIOD_SHORT: Record<ReportPeriod, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
const PERIOD_ICONS: Record<ReportPeriod, React.ReactNode> = {
  daily: <Sun aria-hidden="true" />,
  weekly: <CalendarRange aria-hidden="true" />,
  monthly: <CalendarDays aria-hidden="true" />,
};

export function PeriodBadge({ period }: { period: ReportPeriod }) {
  return (
    <Badge tone="neutral" icon={PERIOD_ICONS[period]}>
      {PERIOD_SHORT[period]}
    </Badge>
  );
}

/** Review state with an icon, so it never relies on colour alone. */
export function ReportStatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  return status === "reviewed" ? (
    <Badge tone="good" icon={<CircleCheck aria-hidden="true" />} className={className}>
      Reviewed
    </Badge>
  ) : (
    <Badge tone="blue" icon={<Hourglass aria-hidden="true" />} className={className}>
      Awaiting review
    </Badge>
  );
}

/** Read-only 1 to 5 stars with an accessible label. */
export function Stars({ value, size = "sm", className }: { value: number; size?: "sm" | "md"; className?: string }) {
  const icon = size === "md" ? "size-5" : "size-3.5";
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${value} out of 5: ${RATING_LABELS[value] ?? ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn(icon, star <= value ? "fill-blue text-blue" : "fill-mist text-mist")} strokeWidth={1.5} aria-hidden="true" />
      ))}
    </span>
  );
}
