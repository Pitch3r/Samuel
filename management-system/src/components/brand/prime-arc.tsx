import { cn } from "@/lib/utils";

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(r: number, start: number, end: number) {
  const a = polar(100, 100, r, start);
  const b = polar(100, 100, r, end);
  return `M ${a.x.toFixed(3)} ${a.y.toFixed(3)} A ${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${b.x.toFixed(3)} ${b.y.toFixed(3)}`;
}

/**
 * The Prime arc: the brand's single graphic device. A faint ring with a gold
 * segment, always cropped by the layout edge. Content never sits on the gold.
 */
export function PrimeArc({ className, segmentStart = 18, segmentSweep = 58, thickness = 15 }: { className?: string; segmentStart?: number; segmentSweep?: number; thickness?: number }) {
  const r = 100 - thickness / 2 - 14;
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute select-none", className)}>
      <svg viewBox="0 0 200 200" className="h-full w-full overflow-visible">
        <circle cx="100" cy="100" r="99.4" fill="none" stroke="rgb(255 255 255 / 0.10)" strokeWidth="0.35" />
        <circle cx="100" cy="100" r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth={thickness} />
        {segmentSweep > 0 && <path d={arcPath(r, segmentStart, segmentStart + segmentSweep)} fill="none" stroke="#E4AC3F" strokeWidth={thickness} />}
      </svg>
    </div>
  );
}
