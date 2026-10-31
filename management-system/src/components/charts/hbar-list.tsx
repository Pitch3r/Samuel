import { cn } from "@/lib/utils";
import { seriesColor, type SeriesSlot } from "@/components/charts/scale";

/** Ranked horizontal bars with the value at the tip. Good for categories and people. */
export function HBarList({
  items,
  valueFormat = (value: number) => value.toLocaleString("en-GB"),
  className,
  title,
}: {
  items: { label: string; value: number; slot?: SeriesSlot; hint?: string }[];
  valueFormat?: (value: number) => string;
  className?: string;
  title: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <figure className={className}>
      <figcaption className="sr-only">{title}</figcaption>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-charcoal">{item.label}</span>
              <span className="tabular shrink-0 font-semibold text-navy">
                {valueFormat(item.value)}
                {item.hint && <span className="ml-1.5 font-normal text-slate">{item.hint}</span>}
              </span>
            </div>
            <div className="h-2 rounded-full bg-cloud">
              <div
                className={cn("h-2 rounded-full")}
                style={{ width: `${Math.max((item.value / max) * 100, item.value > 0 ? 2 : 0)}%`, background: seriesColor(item.slot ?? 1) }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
