"use client";

import { useId, useState } from "react";
import { useWidth } from "@/components/charts/use-width";
import { cn } from "@/lib/utils";
import { formatTick, niceTicks, seriesColor, type SeriesSlot } from "@/components/charts/scale";
import { Legend } from "@/components/charts/legend";

export type BarSeries = { key: string; label: string; slot: SeriesSlot };
export type BarRow = { label: string; sublabel?: string; values: Record<string, number> };

/**
 * Column chart: one or more series, grouped or stacked. Columns are capped at
 * 24px with 4px rounded data-ends, a 2px surface gap between touching marks,
 * hairline gridlines, a hover tooltip per column and a table for screen readers.
 */
export function BarChart({
  rows,
  series,
  stacked = false,
  height = 220,
  valueFormat = (value: number) => value.toLocaleString("en-GB"),
  title,
  className,
  highlightLast = false,
  integer = false,
}: {
  rows: BarRow[];
  series: BarSeries[];
  stacked?: boolean;
  height?: number;
  valueFormat?: (value: number) => string;
  title: string;
  className?: string;
  highlightLast?: boolean;
  /** Whole-number axis ticks, for counts. */
  integer?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [frameRef, width] = useWidth<HTMLElement>();
  const id = useId();
  const totals = rows.map((row) => series.reduce((total, s) => total + (row.values[s.key] ?? 0), 0));
  const peak = stacked ? Math.max(...totals, 0) : Math.max(...rows.flatMap((row) => series.map((s) => row.values[s.key] ?? 0)), 0);
  const { max, ticks } = niceTicks(peak, 4, { integer });

  const padLeft = 36;
  const padBottom = 28;
  const padTop = 12;
  const plotW = width - padLeft - 8;
  const plotH = height - padBottom - padTop;
  const band = plotW / Math.max(rows.length, 1);
  const groupCount = stacked ? 1 : series.length;
  const barW = Math.min(24, (band * 0.7) / groupCount - (groupCount > 1 ? 2 : 0));
  const y = (value: number) => padTop + plotH - (value / max) * plotH;
  // Skip some axis labels when the columns are too narrow to fit them all.
  const labelEvery = Math.max(1, Math.ceil(40 / Math.max(band, 1)));

  return (
    <figure ref={frameRef} className={cn("relative", className)}>
      {series.length > 1 && <Legend className="mb-3" items={series.map((s) => ({ label: s.label, color: seriesColor(s.slot) }))} />}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" role="img" aria-labelledby={`${id}-title`} onMouseLeave={() => setActive(null)}>
        <title id={`${id}-title`}>{title}</title>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padLeft} x2={width - 8} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "#c9d1dc" : "#e9edf2"} strokeWidth="1" />
            <text x={padLeft - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-slate text-[11px] tabular">
              {formatTick(tick)}
            </text>
          </g>
        ))}
        {rows.map((row, i) => {
          const center = padLeft + band * i + band / 2;
          const isActive = active === i;
          let stackBase = 0;
          return (
            <g key={row.label + i} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} tabIndex={0} aria-label={`${row.label}: ${series.map((s) => `${s.label} ${valueFormat(row.values[s.key] ?? 0)}`).join(", ")}`}>
              <rect x={padLeft + band * i} y={padTop} width={band} height={plotH} fill={isActive ? "rgb(11 36 71 / 0.04)" : "transparent"} />
              {series.map((s, si) => {
                const value = row.values[s.key] ?? 0;
                if (value <= 0) return null;
                const h = (value / max) * plotH;
                const x = stacked ? center - barW / 2 : center - (groupCount * (barW + 2)) / 2 + si * (barW + 2) + 1;
                const top = stacked ? y(stackBase + value) : y(value);
                const isTop = stacked ? si === series.length - 1 || series.slice(si + 1).every((next) => !(row.values[next.key] > 0)) : true;
                const gap = stacked && stackBase > 0 ? 2 : 0;
                stackBase += value;
                const barH = Math.max(h - gap, 1);
                const r = Math.min(4, barW / 2, barH);
                return (
                  <path
                    key={s.key}
                    d={roundedTop(x, top, barW, barH, isTop ? r : 0)}
                    fill={seriesColor(s.slot)}
                    opacity={highlightLast && i !== rows.length - 1 && !isActive ? 0.55 : 1}
                  />
                );
              })}
              {(i % labelEvery === 0 || isActive) && (
                <text x={center} y={height - 8} textAnchor="middle" className={cn("text-[11px]", isActive ? "fill-navy font-semibold" : "fill-slate")}>
                  {row.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {active !== null && rows[active] && (
        <div
          className="pointer-events-none absolute top-6 z-10 min-w-36 -translate-x-1/2 rounded-xl border border-mist bg-white px-3 py-2 text-xs shadow-lift"
          style={{ left: `${((padLeft + band * active + band / 2) / width) * 100}%` }}
        >
          <p className="font-semibold text-navy">{rows[active].sublabel ?? rows[active].label}</p>
          <ul className="mt-1 space-y-0.5">
            {series.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-slate">
                  <span className="size-2 rounded-[2px]" style={{ background: seriesColor(s.slot) }} />
                  {s.label}
                </span>
                <span className="tabular font-semibold text-navy">{valueFormat(rows[active]!.values[s.key] ?? 0)}</span>
              </li>
            ))}
            {stacked && series.length > 1 && (
              <li className="flex justify-between gap-3 border-t border-mist pt-0.5">
                <span className="text-slate">Total</span>
                <span className="tabular font-semibold text-navy">{valueFormat(totals[active] ?? 0)}</span>
              </li>
            )}
          </ul>
        </div>
      )}
      <div className="sr-only">
      <table>
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label + i}>
              <th scope="row">{row.sublabel ?? row.label}</th>
              {series.map((s) => (
                <td key={s.key}>{valueFormat(row.values[s.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

/** Rectangle with rounded top corners only (square at the baseline). */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  if (r <= 0) return `M${x},${y}h${w}v${h}h${-w}Z`;
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}
