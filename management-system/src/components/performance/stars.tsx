import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A 1 to 5 rating as five stars, rounded to the nearest whole star, with the
 * exact value for screen readers (and beside the stars when `showValue`).
 */
export function Stars({ value, showValue = false, className }: { value: number | null; showValue?: boolean; className?: string }) {
  if (value === null) return <span className={cn("text-xs text-slate", className)}>Not rated</span>;
  const filled = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="inline-flex" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={cn("size-3.5", i < filled ? "fill-navy text-navy" : "fill-mist text-mist")}
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ))}
      </span>
      {showValue && <span className="tabular text-xs font-semibold text-navy">{value.toFixed(1)}</span>}
    </span>
  );
}
