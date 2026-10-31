import {
  Circle,
  CircleCheck,
  CircleDot,
  CirclePause,
  CircleX,
  Hourglass,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { STATUS_TONES, type Tone } from "@/components/ui/badge";
import type { AssignmentStatus } from "@/lib/constants";

/*
 * Small status visuals for dense places (calendar chips, agenda rows). They
 * mirror StatusBadge: the same icon and tone per status, always shown with a
 * label (visible or for screen readers), never colour alone.
 */

export const STATUS_ICON: Record<AssignmentStatus, LucideIcon> = {
  not_started: Circle,
  in_progress: CircleDot,
  under_review: Hourglass,
  revision: RotateCcw,
  on_hold: CirclePause,
  completed: CircleCheck,
  cancelled: CircleX,
};

/** Tinted surface and icon colour for each badge tone. Text stays in navy for legibility. */
export const TONE_SURFACE: Record<Tone, { surface: string; icon: string }> = {
  neutral: { surface: "bg-cloud ring-mist", icon: "text-slate" },
  navy: { surface: "bg-navy/5 ring-navy/15", icon: "text-navy" },
  blue: { surface: "bg-blue-tint ring-blue/15", icon: "text-blue-dark" },
  teal: { surface: "bg-teal-tint ring-teal/20", icon: "text-teal-dark" },
  gold: { surface: "bg-gold-tint ring-gold/30", icon: "text-[#8a5a00]" },
  good: { surface: "bg-good-tint ring-good/20", icon: "text-good" },
  warning: { surface: "bg-warning-tint ring-warning/20", icon: "text-warning" },
  serious: { surface: "bg-serious-tint ring-serious/20", icon: "text-serious" },
  danger: { surface: "bg-danger-tint ring-danger/20", icon: "text-danger" },
};

export function statusSurface(status: AssignmentStatus) {
  return TONE_SURFACE[STATUS_TONES[status]];
}
