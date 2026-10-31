import { cn } from "@/lib/utils";

/** A meter. The fill carries the state; the track is a lighter step of the same hue. */
export function ProgressBar({
  value,
  tone = "blue",
  label,
  showValue = false,
  className,
  size = "md",
}: {
  value: number;
  tone?: "blue" | "teal" | "good" | "warning" | "danger" | "navy";
  label?: string;
  showValue?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const pct = Math.min(Math.max(Math.round(value), 0), 100);
  const fills = {
    blue: ["bg-blue", "bg-blue-tint"],
    teal: ["bg-teal", "bg-teal-tint"],
    good: ["bg-good", "bg-good-tint"],
    warning: ["bg-gold-dark", "bg-gold-tint"],
    danger: ["bg-danger", "bg-danger-tint"],
    navy: ["bg-navy", "bg-mist"],
  } as const;
  const [fill, track] = fills[tone];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className={cn("relative w-full overflow-hidden rounded-full", track, size === "sm" ? "h-1.5" : "h-2")}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-500", fill)} style={{ width: `${pct}%` }} />
      </div>
      {showValue && <span className="tabular w-9 shrink-0 text-right text-xs font-semibold text-navy">{pct}%</span>}
    </div>
  );
}

/** Circular meter for a 0 to 100 score. */
export function ScoreRing({
  value,
  size = 88,
  stroke = 8,
  label,
  sublabel,
  valueClassName,
}: {
  value: number | null;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  /** Larger rings can use a larger number, e.g. "text-4xl". */
  valueClassName?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value === null ? 0 : Math.min(Math.max(value, 0), 100);
  const color = value === null ? "var(--color-mist)" : pct >= 70 ? "var(--color-teal)" : pct >= 55 ? "var(--color-gold-dark)" : "var(--color-danger)";
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? "Score"}: ${value ?? "not enough data"}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-mist)" strokeWidth={stroke} />
        {pct > 0 && <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className={cn("font-display text-xl leading-none font-bold text-navy", valueClassName)}>{value ?? "N/A"}</div>
          {sublabel && <div className="mt-0.5 text-[0.65rem] font-semibold tracking-wide text-slate uppercase">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
