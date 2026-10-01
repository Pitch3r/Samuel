"use client";

import { cn } from "@/lib/utils";

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[1.75rem] font-bold text-navy">{title}</h1>
        {description && <p className="mt-1 text-slate">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-mist bg-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 border-b border-mist px-6 py-4">
          {title && <h2 className="font-display text-base font-bold text-navy">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}

/** Stat tile: label, value with proportional figures, optional context line. */
export function StatTile({ label, value, context }: { label: string; value: number | string; context?: string }) {
  return (
    <div className="rounded-2xl border border-mist bg-white p-5">
      <p className="text-sm text-slate">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-navy">{typeof value === "number" ? value.toLocaleString("en-GB") : value}</p>
      {context && <p className="mt-1 text-xs text-slate">{context}</p>}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  new: "bg-gold-tint text-navy ring-gold/40",
  in_progress: "bg-blue-tint text-blue-dark ring-blue/20",
  responded: "bg-teal-tint text-teal-dark ring-teal/25",
  closed: "bg-cloud text-slate ring-mist",
  published: "bg-teal-tint text-teal-dark ring-teal/25",
  draft: "bg-cloud text-slate ring-mist",
  active: "bg-teal-tint text-teal-dark ring-teal/25",
  unsubscribed: "bg-cloud text-slate ring-mist",
};

/** Status always carries a text label, never colour alone. */
export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", statusStyles[status] ?? statusStyles.closed)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

export function ConfirmButton({
  message,
  children,
  className,
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={className}
    >
      {children}
    </button>
  );
}
