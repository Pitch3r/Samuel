import { CalendarClock, CircleCheck, Minus, TrendingUp, TriangleAlert } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/badge";
import type { TargetState, TargetStatus } from "@/components/timesheet/week";

const TONES: Record<TargetState, Tone> = {
  met: "good",
  "on-track": "blue",
  behind: "warning",
  short: "warning",
  upcoming: "neutral",
  none: "neutral",
};

const ICONS: Record<TargetState, React.ReactNode> = {
  met: <CircleCheck aria-hidden="true" />,
  "on-track": <TrendingUp aria-hidden="true" />,
  behind: <TriangleAlert aria-hidden="true" />,
  short: <TriangleAlert aria-hidden="true" />,
  upcoming: <CalendarClock aria-hidden="true" />,
  none: <Minus aria-hidden="true" />,
};

/** Weekly target state with an icon, so it never relies on colour alone. */
export function TargetBadge({ status, className }: { status: TargetStatus; className?: string }) {
  return (
    <Badge tone={TONES[status.state]} icon={ICONS[status.state]} className={className}>
      {status.label}
    </Badge>
  );
}

/** Meter colour for the week total: good once met, amber when falling behind. */
export function targetTone(status: TargetStatus) {
  if (status.state === "met") return "good" as const;
  if (status.state === "behind" || status.state === "short") return "warning" as const;
  return "blue" as const;
}
