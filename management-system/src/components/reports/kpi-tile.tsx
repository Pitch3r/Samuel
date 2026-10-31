import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatHours, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { cn, round } from "@/lib/utils";

export type KpiFormat = "count" | "percent" | "money" | "hours" | "days" | "rating";

/** A figure in its unit: "12", "84%", "K 48,000", "36 h", "9.5 days", "4.3 of 5". */
export function formatKpi(value: number | null, format: KpiFormat, fallback = "N/A") {
  if (value === null || !Number.isFinite(value)) return fallback;
  switch (format) {
    case "percent":
      return formatPercent(value, fallback);
    case "money":
      return formatMoney(value, { compact: true });
    case "hours":
      return formatHours(value);
    case "days":
      return `${formatNumber(round(value, 1))} ${value === 1 ? "day" : "days"}`;
    case "rating":
      return `${value.toFixed(1)} of 5`;
    default:
      return formatNumber(value);
  }
}

/** The size of a change in the figure's own unit ("12 pts" for rates). */
function formatChange(diff: number, format: KpiFormat) {
  const size = Math.abs(diff);
  switch (format) {
    case "percent":
      return `${Math.round(size * 100)} pts`;
    case "money":
      return formatMoney(size, { compact: true });
    case "hours":
      return formatHours(size);
    case "days":
      return `${formatNumber(round(size, 1))} ${round(size, 1) === 1 ? "day" : "days"}`;
    case "rating":
      return size.toFixed(1);
    default:
      return formatNumber(round(size, 1));
  }
}

/**
 * Report figure with its change against the previous period of the same
 * length. The change is coloured by whether it is good news, and always
 * spelt out in words with an arrow so colour is never the only signal.
 */
export function KpiTile({
  label,
  icon,
  value,
  previous,
  format = "count",
  upIsGood = true,
  hint,
  compare = true,
  className,
}: {
  label: string;
  icon?: ReactNode;
  value: number | null;
  previous?: number | null;
  format?: KpiFormat;
  upIsGood?: boolean;
  hint?: ReactNode;
  /** False for snapshot figures that have no previous period. */
  compare?: boolean;
  className?: string;
}) {
  let change: ReactNode = null;
  if (compare) {
    if (value === null || previous === null || previous === undefined) {
      change = <span className="text-slate">No comparison available</span>;
    } else {
      // Rates and ratings are compared after rounding, so "84% vs 84%" never reads as a change.
      const diff = format === "percent" ? Math.round(value * 100) / 100 - Math.round(previous * 100) / 100 : value - previous;
      const flat = Math.abs(diff) < (format === "percent" ? 0.005 : format === "rating" ? 0.05 : 0.0001);
      const good = flat ? null : diff > 0 === upIsGood;
      const Icon = flat ? Minus : diff > 0 ? ArrowUpRight : ArrowDownRight;
      change = (
        <span className={cn("inline-flex items-center gap-0.5 font-semibold", good === null ? "text-slate" : good ? "text-good" : "text-danger")}>
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          {flat ? "No change" : `${diff > 0 ? "Up" : "Down"} ${formatChange(diff, format)}`}
        </span>
      );
    }
  }
  return (
    <div className={cn("min-w-0 rounded-card border border-mist bg-white p-4 shadow-card print:break-inside-avoid print:shadow-none", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-semibold text-slate">{label}</p>
        {icon && <span className="no-print grid size-8 shrink-0 place-items-center rounded-lg bg-cloud text-navy [&_svg]:size-4">{icon}</span>}
      </div>
      <p className="tabular mt-2 font-display text-[1.65rem] leading-none font-bold tracking-tight text-navy">{formatKpi(value, format)}</p>
      <div className="mt-2.5 space-y-0.5 text-xs">
        {compare && (
          <p className="flex flex-wrap items-center gap-x-1.5">
            {change}
            {previous !== undefined && previous !== null && <span className="text-slate">vs {formatKpi(previous, format)} before</span>}
          </p>
        )}
        {hint && <p className="text-slate">{hint}</p>}
      </div>
    </div>
  );
}
