import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { plural } from "@/lib/utils";
import type { DeliverySummary } from "@/components/reports/scope";

/** "up 2 on the previous period", "the same as the previous period". */
function versus(current: number, previous: number, unit: (value: number) => string = formatNumber) {
  const diff = current - previous;
  if (diff === 0) return "the same as the previous period";
  return `${diff > 0 ? "up" : "down"} ${unit(Math.abs(diff))} on the previous period`;
}

/**
 * Plain-English findings for the top of the management report, built only
 * from figures shown further down so every sentence can be checked.
 */
export function buildHighlights(input: {
  current: DeliverySummary;
  before: DeliverySummary;
  newByTrack: { corporate: number; academic: number };
  workload: { total: number; overdue: number; underReview: number };
  outstanding: { total: number; count: number; topClient: { name: string; balance: number } | null };
  topCategory: { name: string; active: number } | null;
}) {
  const { current, before } = input;
  const lines: string[] = [];

  if (current.completed) {
    lines.push(
      `The team completed ${plural(current.completed, "assignment")}, ${versus(current.completed, before.completed)}, with ${formatMoney(current.revenue)} in fees.`,
    );
  } else {
    lines.push(`No assignments were completed in this period${before.completed ? ` (${before.completed} in the previous period)` : ""}.`);
  }

  if (current.timed) {
    lines.push(`${current.onTime} of ${plural(current.timed, "dated delivery", "dated deliveries")} met the due date (${formatPercent(current.onTimeRate)}).`);
  }

  if (current.avgQuality !== null) {
    lines.push(`Average quality rating was ${current.avgQuality.toFixed(1)} out of 5 across ${plural(current.rated, "rated assignment")}.`);
  }

  if (current.created) {
    lines.push(
      `${plural(current.created, "new assignment")} came in (${input.newByTrack.corporate} corporate, ${input.newByTrack.academic} academic), ${versus(current.created, before.created)}.`,
    );
  } else {
    lines.push("No new assignments were opened in this period.");
  }

  if (input.topCategory) {
    lines.push(`The busiest service line was ${input.topCategory.name}, with ${plural(input.topCategory.active, "assignment")} active.`);
  }

  const { workload } = input;
  if (workload.total) {
    const extras = [workload.overdue ? `${workload.overdue} overdue` : "", workload.underReview ? `${workload.underReview} waiting for review` : ""].filter(Boolean);
    lines.push(`Today ${plural(workload.total, "assignment is", "assignments are")} open${extras.length ? `, ${extras.join(" and ")}` : ""}.`);
  }

  if (input.outstanding.total > 0) {
    const top = input.outstanding.topClient;
    lines.push(
      `${formatMoney(input.outstanding.total)} is owed on ${plural(input.outstanding.count, "completed assignment")}${top ? `; the largest balance is ${top.name} (${formatMoney(top.balance)})` : ""}.`,
    );
  } else {
    lines.push("All completed work has been paid or settled.");
  }

  return lines;
}
