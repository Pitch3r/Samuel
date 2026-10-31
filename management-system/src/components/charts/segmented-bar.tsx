import { Legend } from "@/components/charts/legend";

/** One whole split into parts, separated by 2px surface gaps, with a legend carrying the values. */
export function SegmentedBar({
  parts,
  title,
  height = 14,
  legend = true,
}: {
  parts: { label: string; value: number; color: string }[];
  title: string;
  height?: number;
  /** Turn off when the values are listed beside the bar anyway. */
  legend?: boolean;
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  const visible = parts.filter((part) => part.value > 0);
  return (
    <figure>
      <figcaption className="sr-only">
        {title}: {parts.map((part) => `${part.label} ${part.value}`).join(", ")}
      </figcaption>
      <div className="flex w-full gap-[2px] overflow-hidden rounded-full bg-cloud" style={{ height }} aria-hidden="true">
        {total === 0 ? null : visible.map((part) => (
          <div key={part.label} title={`${part.label}: ${part.value}`} style={{ flexGrow: part.value, background: part.color }} />
        ))}
      </div>
      {legend && <Legend className="mt-3" items={parts.map((part) => ({ label: part.label, color: part.color, value: String(part.value) }))} />}
    </figure>
  );
}
