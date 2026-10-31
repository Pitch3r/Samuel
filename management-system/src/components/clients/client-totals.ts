import { isOpenStatus } from "@/lib/constants";
import { outstandingFees } from "@/lib/metrics";
import { sum } from "@/lib/utils";
import type { Assignment } from "@/lib/types";

export type ClientTotals = {
  count: number;
  open: number;
  completed: number;
  /** Agreed fees on work that was not cancelled. */
  fees: number;
  /** Payments received on work that was not cancelled. */
  paid: number;
  /** Fees on completed work not yet fully paid. */
  outstanding: number;
  /** Fees on completed work. */
  revenue: number;
  /** Most recent change to any of the client's assignments. */
  lastActivity: string | null;
};

/** Work and money figures for one client's assignments. */
export function clientTotals(assignments: Assignment[]): ClientTotals {
  const live = assignments.filter((assignment) => assignment.status !== "cancelled");
  const completed = assignments.filter((assignment) => assignment.status === "completed");
  const lastActivity = assignments.reduce<string | null>((latest, assignment) => (!latest || assignment.updatedAt > latest ? assignment.updatedAt : latest), null);
  return {
    count: assignments.length,
    open: assignments.filter((assignment) => isOpenStatus(assignment.status)).length,
    completed: completed.length,
    fees: sum(live.map((assignment) => assignment.fee ?? 0)),
    paid: sum(live.map((assignment) => assignment.amountPaid ?? 0)),
    outstanding: outstandingFees(assignments),
    revenue: sum(completed.map((assignment) => assignment.fee ?? 0)),
    lastActivity,
  };
}
