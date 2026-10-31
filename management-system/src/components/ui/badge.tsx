import type { ReactNode } from "react";
import {
  CircleCheck,
  CircleDot,
  CirclePause,
  CircleX,
  Hourglass,
  RotateCcw,
  Circle,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUp,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TRACK_LABELS,
  type AssignmentStatus,
  type Priority,
  type Track,
} from "@/lib/constants";

export type Tone = "neutral" | "navy" | "blue" | "teal" | "gold" | "good" | "warning" | "serious" | "danger";

export const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-cloud text-slate ring-mist",
  navy: "bg-navy text-white ring-navy",
  blue: "bg-blue-tint text-blue-dark ring-blue/15",
  teal: "bg-teal-tint text-teal-dark ring-teal/20",
  gold: "bg-gold-tint text-[#8a5a00] ring-gold/30",
  good: "bg-good-tint text-good ring-good/20",
  warning: "bg-warning-tint text-warning ring-warning/20",
  serious: "bg-serious-tint text-serious ring-serious/20",
  danger: "bg-danger-tint text-danger ring-danger/20",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: Tone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset [&_svg]:size-3.5",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export const STATUS_TONES: Record<AssignmentStatus, Tone> = {
  not_started: "neutral",
  in_progress: "blue",
  under_review: "gold",
  revision: "serious",
  on_hold: "warning",
  completed: "good",
  cancelled: "neutral",
};

export const STATUS_ICONS: Record<AssignmentStatus, ReactNode> = {
  not_started: <Circle aria-hidden="true" />,
  in_progress: <CircleDot aria-hidden="true" />,
  under_review: <Hourglass aria-hidden="true" />,
  revision: <RotateCcw aria-hidden="true" />,
  on_hold: <CirclePause aria-hidden="true" />,
  completed: <CircleCheck aria-hidden="true" />,
  cancelled: <CircleX aria-hidden="true" />,
};

export function StatusBadge({ status, className }: { status: AssignmentStatus; className?: string }) {
  return (
    <Badge tone={STATUS_TONES[status]} icon={STATUS_ICONS[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

const PRIORITY_TONES: Record<Priority, Tone> = { low: "neutral", normal: "blue", high: "warning", urgent: "danger" };
const PRIORITY_ICONS: Record<Priority, ReactNode> = {
  low: <ArrowDown aria-hidden="true" />,
  normal: <Minus aria-hidden="true" />,
  high: <ArrowUp aria-hidden="true" />,
  urgent: <ChevronsUp aria-hidden="true" />,
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge tone={PRIORITY_TONES[priority]} icon={PRIORITY_ICONS[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function TrackBadge({ track, short = false }: { track: Track; short?: boolean }) {
  return (
    <Badge
      tone={track === "academic" ? "teal" : "blue"}
      icon={track === "academic" ? <GraduationCap aria-hidden="true" /> : <Briefcase aria-hidden="true" />}
    >
      {short ? (track === "academic" ? "Academic" : "Corporate") : TRACK_LABELS[track]}
    </Badge>
  );
}
