import { cn } from "@/lib/utils";

export function Legend({ items, className }: { items: { label: string; color: string; value?: string }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate", className)}>
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: item.color }} aria-hidden="true" />
          <span className="text-charcoal">{item.label}</span>
          {item.value && <span className="tabular font-semibold text-navy">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
