import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Line icon in a soft tile. Brand rule: simple line icons, 1.5 to 2px stroke, navy or white. */
export function IconTile({
  icon: Icon,
  tone = "light",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: "light" | "dark" | "blue";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-2xl border transition-colors duration-300",
        size === "sm" && "size-10 rounded-xl",
        size === "md" && "size-12",
        size === "lg" && "size-14",
        tone === "light" && "border-mist bg-cloud text-navy",
        tone === "dark" && "border-white/10 bg-white/5 text-white",
        tone === "blue" && "border-blue/15 bg-blue-tint text-navy",
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        strokeWidth={1.75}
        className={cn(size === "sm" ? "size-[1.15rem]" : size === "md" ? "size-[1.35rem]" : "size-6")}
      />
    </span>
  );
}

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: "default" | "blue" | "gold" | "teal" | "dark" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "default" && "bg-cloud text-slate ring-1 ring-mist ring-inset",
        tone === "blue" && "bg-blue-tint text-blue-dark",
        tone === "gold" && "bg-gold-tint text-navy",
        tone === "teal" && "bg-teal-tint text-teal-dark",
        tone === "dark" && "bg-white/10 text-white ring-1 ring-white/15 ring-inset",
        tone === "danger" && "bg-danger-tint text-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}
