/**
 * Wording for the status buttons on an assignment. The data layer decides
 * which moves are allowed (allowedTransitions); this only names them.
 */

import type { ButtonVariant } from "@/components/ui/button";
import { STATUS_LABELS, type AssignmentStatus } from "@/lib/constants";

export type TransitionButton = {
  to: AssignmentStatus;
  label: string;
  variant: ButtonVariant;
  /** Shown before the change is sent, for moves that are hard to undo. */
  confirm?: string;
  /** Main buttons are always visible; the rest sit behind "Other status changes". */
  primary: boolean;
};

const EMPLOYEE_LABELS: Partial<Record<AssignmentStatus, Partial<Record<AssignmentStatus, string>>>> = {
  not_started: { in_progress: "Start work" },
  in_progress: { under_review: "Submit for review", on_hold: "Put on hold" },
  under_review: { in_progress: "Withdraw submission" },
  revision: { in_progress: "Start revisions", under_review: "Resubmit for review" },
  on_hold: { in_progress: "Resume work" },
};

/** The step the administrator most likely wants next, by current status. */
const ADMIN_NEXT: Record<AssignmentStatus, AssignmentStatus[]> = {
  not_started: ["in_progress"],
  in_progress: ["under_review", "completed"],
  under_review: [],
  revision: ["in_progress"],
  on_hold: ["in_progress"],
  completed: ["in_progress"],
  cancelled: ["in_progress"],
};

function adminLabel(from: AssignmentStatus, to: AssignmentStatus) {
  switch (to) {
    case "not_started":
      return "Reset to not started";
    case "in_progress":
      if (from === "completed" || from === "cancelled") return "Reopen assignment";
      if (from === "on_hold") return "Resume work";
      if (from === "not_started") return "Start work";
      if (from === "revision") return "Start revisions";
      return "Move back to in progress";
    case "under_review":
      return "Mark as submitted for review";
    case "revision":
      return "Request a revision";
    case "on_hold":
      return "Put on hold";
    case "completed":
      return "Mark as completed";
    case "cancelled":
      return "Cancel assignment";
  }
}

const POSITIVE: AssignmentStatus[] = ["in_progress", "under_review", "completed"];

export function transitionButtons(from: AssignmentStatus, allowed: AssignmentStatus[], isAdmin: boolean): TransitionButton[] {
  const buttons = allowed.map((to): TransitionButton => {
    if (!isAdmin) {
      const label = EMPLOYEE_LABELS[from]?.[to] ?? `Move to ${STATUS_LABELS[to].toLowerCase()}`;
      return { to, label, variant: to === "on_hold" || (from === "under_review" && to === "in_progress") ? "secondary" : "primary", primary: true };
    }
    const primary = ADMIN_NEXT[from].includes(to);
    return {
      to,
      label: adminLabel(from, to),
      variant: to === "cancelled" ? "danger" : primary && POSITIVE.includes(to) ? "primary" : "secondary",
      primary,
      confirm:
        to === "cancelled"
          ? "Cancel this assignment? It will stop counting as open work and the team will be told."
          : to === "completed"
            ? "Mark this assignment as completed without a review? You can rate it from the review panel instead."
            : undefined,
    };
  });
  // Main steps first, the cancel button always last, and only one filled button.
  buttons.sort((a, b) => Number(b.primary) - Number(a.primary) || Number(a.to === "cancelled") - Number(b.to === "cancelled"));
  let filled = false;
  return buttons.map((button) => {
    if (button.variant !== "primary") return button;
    if (filled) return { ...button, variant: "secondary" };
    filled = true;
    return button;
  });
}
