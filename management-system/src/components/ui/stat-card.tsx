import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/charts/sparkline";

/**
 * Stat tile: label, value, optional delta against a named period and an
 * optional sparkline. Delta colour follows direction and whether up is good.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
  delta,
  trend,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  href?: string;
  delta?: { value: number; label: string; upIsGood?: boolean; format?: "number" | "percent" };
  trend?: number[];
  tone?: "default" | "danger" | "warning" | "good";
  className?: string;
}) {
  const toneRing = {
    default: "",
    danger: "before:bg-danger",
    warning: "before:bg-gold-dark",
    good: "before:bg-good",
  }[tone];
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8125rem] font-semibold text-slate">{label}</p>
        {icon && <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cloud text-navy [&_svg]:size-4">{icon}</span>}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="font-display text-[1.75rem] leading-none font-bold tracking-tight text-navy">{value}</p>
        {trend && trend.length > 1 && <Sparkline values={trend} className="h-8 w-24" label={`${label} trend`} />}
      </div>
      {(delta || hint) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {delta && <Delta {...delta} />}
          {hint && <span className="text-slate">{hint}</span>}
        </div>
      )}
    </>
  );
  const classes = cn(
    "relative block overflow-hidden rounded-card border border-mist bg-white p-4 shadow-card",
    tone !== "default" && "before:absolute before:inset-y-0 before:left-0 before:w-1",
    toneRing,
    href && "transition-shadow hover:shadow-lift focus-visible:shadow-lift",
    className,
  );
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

function Delta({ value, label, upIsGood = true, format = "number" }: { value: number; label: string; upIsGood?: boolean; format?: "number" | "percent" }) {
  if (!Number.isFinite(value)) return null;
  const up = value > 0;
  const flat = value === 0;
  const good = flat ? null : up === upIsGood;
  const text = format === "percent" ? `${Math.abs(Math.round(value * 100))} pts` : Math.abs(Math.round(value * 10) / 10).toLocaleString("en-GB");
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-semibold", good === null ? "text-slate" : good ? "text-good" : "text-danger")}>
      {!flat && (up ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : <ArrowDownRight className="size-3.5" aria-hidden="true" />)}
      <span>
        {flat ? "No change" : `${up ? "Up" : "Down"} ${text}`} <span className="font-normal text-slate">{label}</span>
      </span>
    </span>
  );
}
