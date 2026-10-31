import { Legend } from "@/components/charts/legend";

/**
 * One whole split into parts, like the shared SegmentedBar, but with each
 * part's value already formatted (money, hours) in the legend.
 */
export function SplitBar({
  parts,
  title,
  height = 14,
}: {
  parts: { label: string; value: number; display: string; color: string }[];
  title: string;
  height?: number;
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  return (
    <figure>
      <figcaption className="sr-only">
        {title}: {parts.map((part) => `${part.label} ${part.display}`).join(", ")}
      </figcaption>
      <div className="flex w-full gap-[2px] overflow-hidden rounded-full bg-cloud [print-color-adjust:exact]" style={{ height }} aria-hidden="true">
        {total > 0 &&
          parts
            .filter((part) => part.value > 0)
            .map((part) => <div key={part.label} title={`${part.label}: ${part.display}`} style={{ flexGrow: part.value, background: part.color }} />)}
      </div>
      <Legend className="mt-3" items={parts.map((part) => ({ label: part.label, color: part.color, value: part.display }))} />
    </figure>
  );
}
