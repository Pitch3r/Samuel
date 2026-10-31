import Image from "next/image";
import { cn } from "@/lib/utils";

/** Places the supplied Primeresearch logo artwork unchanged (never redrawn or recoloured). */
const RATIOS = { horizontal: 542.741 / 120.96, stacked: 386.178 / 201.729, mark: 85.96 / 120.96 } as const;

export function Logo({
  layout = "horizontal",
  variant = "color",
  width = 168,
  className,
  priority = false,
}: {
  layout?: keyof typeof RATIOS;
  variant?: "color" | "reversed";
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={`/brand/logo-${layout}-${variant}.svg`}
      alt="Primeresearch Consultants"
      width={width}
      height={Math.round(width / RATIOS[layout])}
      priority={priority}
      unoptimized
      className={cn("h-auto select-none", className)}
    />
  );
}
