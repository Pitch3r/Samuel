import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Places the supplied logo artwork from the brand kit. The brand rules forbid
 * redrawing, recolouring or re-typing the logo, so this component only ever
 * renders the original SVG files from /public/brand.
 */
const RATIOS = {
  horizontal: 542.741 / 120.96,
  stacked: 386.178 / 201.729,
  mark: 85.96 / 120.96,
  wordmark: 440.581 / 89.042,
} as const;

type Layout = keyof typeof RATIOS;
type Variant = "color" | "reversed" | "white" | "navy";

const AVAILABLE: Record<Layout, Variant[]> = {
  horizontal: ["color", "reversed", "white", "navy"],
  stacked: ["color", "reversed", "white", "navy"],
  mark: ["color", "reversed", "white", "navy"],
  wordmark: ["color", "white", "navy"],
};

export function Logo({
  layout = "horizontal",
  variant = "color",
  width = 188,
  className,
  priority = false,
}: {
  layout?: Layout;
  variant?: Variant;
  /** Rendered width in px. Horizontal lockup minimum is 140px, mark minimum is 24px. */
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  const safeVariant = AVAILABLE[layout].includes(variant) ? variant : "white";
  const height = Math.round(width / RATIOS[layout]);

  return (
    <Image
      src={`/brand/logo-${layout}-${safeVariant}.svg`}
      alt="Primeresearch Consultants"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn("block h-auto select-none", className)}
      draggable={false}
    />
  );
}
