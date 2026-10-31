import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Horizontally scrollable wrapper for wide tables on small screens. */
export function TableWrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}>{children}</div>;
}

/** Link-based tabs for server-rendered pages. */
export function TabLinks({ items, className }: { items: { href: string; label: ReactNode; active: boolean; count?: number }[]; className?: string }) {
  return (
    <nav className={cn("no-print -mx-1 mb-5 flex gap-1 overflow-x-auto border-b border-mist px-1", className)} aria-label="Sections">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
            item.active ? "border-blue text-navy" : "border-transparent text-slate hover:text-navy",
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span className={cn("rounded-full px-1.5 py-px text-[0.7rem]", item.active ? "bg-blue-tint text-blue-dark" : "bg-cloud text-slate")}>{item.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export function DescriptionList({ items, className }: { items: { label: string; value: ReactNode }[]; className?: string }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4 sm:grid-cols-2", className)}>
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-xs font-semibold tracking-wide text-slate uppercase">{item.label}</dt>
          <dd className="mt-1 text-sm break-words text-charcoal">{item.value || <span className="text-slate">Not set</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionTitle({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="text-base font-bold">{children}</h2>
      {action}
    </div>
  );
}

/** Small "label: value" pill used in headers. */
export function Meta({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate [&_svg]:size-4 [&_svg]:text-slate/80">
      {icon}
      {children}
    </span>
  );
}
