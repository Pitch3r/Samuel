import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card header for cards that sit under a report section heading. Looks the
 * same as the shared CardHeader but uses an h3, so the page outline reads
 * section, then card.
 */
export function PanelHeader({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-mist px-5 py-4", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <span className="no-print mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-blue-tint text-blue [&_svg]:size-[1.1rem]">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug">{title}</h3>
          {description && <p className="mt-0.5 text-[0.8125rem] text-slate">{description}</p>}
        </div>
      </div>
      {action && <div className="no-print flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

/** A labelled number in a strip of figures under a chart or table. */
export function Figure({ label, value, sub, tone = "default" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "default" | "danger" | "good" }) {
  return (
    <div className="min-w-0 bg-white px-4 py-3">
      <dt className="truncate text-[0.7rem] font-semibold tracking-wide text-slate uppercase">{label}</dt>
      <dd className={cn("tabular mt-1 font-display text-lg leading-none font-bold", tone === "danger" ? "text-danger" : tone === "good" ? "text-good" : "text-navy")}>
        {value}
      </dd>
      {sub && <dd className="mt-1 truncate text-xs text-slate">{sub}</dd>}
    </div>
  );
}

/** Classes for report cards: clipped to their rounded corners, and no shadow on paper. */
export const reportCard = "min-w-0 overflow-hidden print:shadow-none";

/** For small cards that should not be split across two printed pages. */
export const keepTogether = "print:break-inside-avoid";
