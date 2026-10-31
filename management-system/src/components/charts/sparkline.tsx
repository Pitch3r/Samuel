import { cn } from "@/lib/utils";

/** De-emphasised 2px trend line with the latest point marked in the accent. */
export function Sparkline({ values, className, label }: { values: number[]; className?: string; label: string }) {
  const width = 96;
  const height = 32;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const points = values.map((value, i) => [
    (i / Math.max(values.length - 1, 1)) * (width - 6) + 3,
    height - 4 - ((value - min) / span) * (height - 8),
  ]);
  const last = points[points.length - 1]!;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("overflow-visible", className)} role="img" aria-label={`${label}: ${values.join(", ")}`}>
      <polyline
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="var(--color-mist)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: "color-mix(in srgb, var(--color-slate) 45%, white)" }}
      />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--color-series-1)" stroke="white" strokeWidth="2" />
    </svg>
  );
}
