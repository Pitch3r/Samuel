import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CircleAlert, CircleCheck, Minus, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/progress";
import { scoreGrade } from "@/lib/metrics";
import { cn } from "@/lib/utils";

/** Small "see more" link for card headers. */
export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.8125rem] font-semibold whitespace-nowrap text-blue-dark transition-colors hover:bg-blue-tint"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

const GRADE_ICONS = {
  good: <CircleCheck aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
  danger: <CircleAlert aria-hidden="true" />,
  neutral: <Minus aria-hidden="true" />,
} as const;

/** The performance grade for a score, with an icon so it never relies on colour. */
export function GradeBadge({ score, className }: { score: number | null; className?: string }) {
  const grade = scoreGrade(score);
  return (
    <Badge tone={grade.tone} icon={GRADE_ICONS[grade.tone]} className={className}>
      {grade.label}
    </Badge>
  );
}

/** Stat tile with a score ring, sized to sit in a row of StatCards. */
export function ScoreTile({ score, label, hint, href }: { score: number | null; label: string; hint?: ReactNode; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-card border border-mist bg-white p-4 shadow-card transition-shadow hover:shadow-lift focus-visible:shadow-lift"
    >
      <ScoreRing value={score} size={76} stroke={7} label={label} sublabel="Score" />
      <div className="min-w-0">
        <p className="text-[0.8125rem] font-semibold text-slate">{label}</p>
        <GradeBadge score={score} className="mt-1.5" />
        {hint && <p className="mt-1.5 text-xs text-slate">{hint}</p>}
      </div>
    </Link>
  );
}

/** A labelled number in a strip of figures. */
export function Figure({
  label,
  value,
  sub,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "danger" | "good";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 bg-white px-4 py-3", className)}>
      <dt className="truncate text-[0.7rem] font-semibold tracking-wide text-slate uppercase">{label}</dt>
      <dd className={cn("tabular mt-1 font-display text-lg leading-none font-bold", tone === "danger" ? "text-danger" : tone === "good" ? "text-good" : "text-navy")}>
        {value}
      </dd>
      {sub && <dd className="mt-1 truncate text-xs text-slate">{sub}</dd>}
    </div>
  );
}

/**
 * Wrapper for the shared charts. They draw at their real width, so this only
 * scrolls sideways on very narrow screens (below 17rem, or `minWidth` if smaller).
 */
export function ChartFrame({ children, className, minWidth = "34rem" }: { children: ReactNode; className?: string; minWidth?: string }) {
  return (
    <div className={cn("-mx-1 min-w-0 overflow-x-auto px-1 pb-1", className)}>
      {/* Charts draw at their real width now, so only scroll on very narrow screens. */}
      <div style={{ minWidth: `min(${minWidth}, 17rem)` }}>{children}</div>
    </div>
  );
}
