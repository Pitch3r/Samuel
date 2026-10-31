import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

/** Read-only 1 to 5 stars. */
export function StarRating({ value, size = "md", className }: { value: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const iconSize = { sm: "size-3.5", md: "size-4.5", lg: "size-6" }[size];
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`Rated ${value} out of 5, ${RATING_LABELS[value] ?? ""}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(iconSize, star <= value ? "fill-blue text-blue" : "fill-mist text-mist")}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
