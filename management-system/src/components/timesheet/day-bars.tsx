import { seriesColor, type SeriesSlot } from "@/components/charts/scale";
import { formatDateLong, formatHours, formatWeekdayShort } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Seven small columns, one per day, drawn in HTML so the labels stay legible
 * in a narrow card. The value sits above each column; today is labelled.
 */
export function DayBars({ values, slot, today, title }: { values: { date: string; hours: number }[]; slot: SeriesSlot; today: string; title: string }) {
  const max = Math.max(...values.map((value) => value.hours), 8);
  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <ul className="flex h-36 items-end gap-2" aria-label={title}>
        {values.map(({ date, hours }) => (
          <li key={date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" aria-label={`${formatDateLong(date)}: ${formatHours(hours)}`}>
            <span className={cn("tabular text-[0.7rem] font-semibold", hours ? "text-navy" : "text-slate/60")} aria-hidden="true">
              {hours ? formatHours(hours).replace(" h", "") : "0"}
            </span>
            <span className="flex w-full max-w-7 flex-1 items-end rounded-md bg-cloud" aria-hidden="true">
              <span
                className="block w-full rounded-md"
                style={{ height: `${hours ? Math.max((hours / max) * 100, 4) : 0}%`, background: seriesColor(slot) }}
              />
            </span>
            <span className={cn("text-[0.7rem]", date === today ? "font-bold text-navy" : "text-slate")} aria-hidden="true">
              {formatWeekdayShort(date)}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
