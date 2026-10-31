"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * An on/off switch built on a real checkbox, so it submits with the form
 * ("on" when checked) and works with the keyboard. The state is also written
 * out as "On" or "Off", so it never relies on colour alone.
 */
export function Switch({
  name,
  checked,
  onCheckedChange,
  label,
  description,
  className,
  size = "md",
}: {
  name: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  size?: "md" | "lg";
}) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start justify-between gap-4", className)}>
      <span className="min-w-0">
        <span className={cn("block font-semibold text-navy", size === "lg" ? "text-base" : "text-sm")}>{label}</span>
        {description && <span className="mt-0.5 block text-sm text-slate">{description}</span>}
      </span>
      <span className="flex shrink-0 items-center gap-2 pt-0.5">
        <span className={cn("w-7 text-right text-xs font-semibold", checked ? "text-blue-dark" : "text-slate")} aria-hidden="true">
          {checked ? "On" : "Off"}
        </span>
        <span className="relative inline-flex">
          <input
            id={id}
            type="checkbox"
            role="switch"
            name={name}
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="h-6 w-11 rounded-full bg-mist transition-colors peer-checked:bg-blue peer-focus-visible:ring-2 peer-focus-visible:ring-blue peer-focus-visible:ring-offset-2"
          />
          <span
            aria-hidden="true"
            className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm ring-1 ring-navy/10 transition-transform peer-checked:translate-x-5"
          />
        </span>
      </span>
    </label>
  );
}
