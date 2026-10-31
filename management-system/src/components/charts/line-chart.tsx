"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { formatTick, niceTicks, seriesColor, type SeriesSlot } from "@/components/charts/scale";
import { Legend } from "@/components/charts/legend";

export type LineSeries = { key: string; label: string; slot: SeriesSlot; values: number[] };

/** 2px lines with a 10% area wash for a single series, crosshair tooltip and end labels. */
export function LineChart({
  labels,
  series,
  height = 220,
  valueFormat = (value: number) => value.toLocaleString("en-GB"),
  title,
  className,
  maxValue,
}: {
  labels: string[];
  series: LineSeries[];
  height?: number;
  valueFormat?: (value: number) => string;
  title: string;
  className?: string;
  maxValue?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const id = useId();
  const peak = maxValue ?? Math.max(...series.flatMap((s) => s.values), 0);
  const { max, ticks } = niceTicks(peak);
  const width = 640;
  const padLeft = 36;
  const padRight = 16;
  const padTop = 12;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const x = (i: number) => padLeft + (labels.length <= 1 ? plotW / 2 : (i / (labels.length - 1)) * plotW);
  const y = (value: number) => padTop + plotH - (value / max) * plotH;
  const labelEvery = Math.ceil(labels.length / 8);

  return (
    <figure className={cn("relative", className)}>
      {series.length > 1 && <Legend className="mb-3" items={series.map((s) => ({ label: s.label, color: seriesColor(s.slot) }))} />}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        role="img"
        aria-labelledby={`${id}-title`}
        onMouseLeave={() => setActive(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const px = ((event.clientX - rect.left) / rect.width) * width;
          const i = Math.round(((px - padLeft) / plotW) * (labels.length - 1));
          setActive(Math.min(Math.max(i, 0), labels.length - 1));
        }}
      >
        <title id={`${id}-title`}>{title}</title>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padLeft} x2={width - padRight} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "#c9d1dc" : "#e9edf2"} strokeWidth="1" />
            <text x={padLeft - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-slate text-[11px] tabular">
              {formatTick(tick)}
            </text>
          </g>
        ))}
        {labels.map((label, i) =>
          i % labelEvery === 0 || i === labels.length - 1 ? (
            <text key={label + i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-slate text-[11px]">
              {label}
            </text>
          ) : null,
        )}
        {series.length === 1 && series[0]!.values.length > 1 && (
          <path
            d={`M${x(0)},${y(0)} ${series[0]!.values.map((v, i) => `L${x(i)},${y(v)}`).join(" ")} L${x(series[0]!.values.length - 1)},${y(0)}Z`}
            fill={seriesColor(series[0]!.slot)}
            opacity="0.1"
          />
        )}
        {series.map((s) => (
          <polyline
            key={s.key}
            points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
            fill="none"
            stroke={seriesColor(s.slot)}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {active !== null && <line x1={x(active)} x2={x(active)} y1={padTop} y2={padTop + plotH} stroke="#9aa6b5" strokeWidth="1" />}
        {series.map((s) => {
          const i = active ?? s.values.length - 1;
          const v = s.values[i];
          if (v === undefined) return null;
          return <circle key={s.key} cx={x(i)} cy={y(v)} r="4.5" fill={seriesColor(s.slot)} stroke="white" strokeWidth="2" />;
        })}
      </svg>
      {active !== null && (
        <div
          className="pointer-events-none absolute top-6 z-10 min-w-36 -translate-x-1/2 rounded-xl border border-mist bg-white px-3 py-2 text-xs shadow-lift"
          style={{ left: `${(x(active) / width) * 100}%` }}
        >
          <p className="font-semibold text-navy">{labels[active]}</p>
          <ul className="mt-1 space-y-0.5">
            {series.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 text-slate">
                  <span className="h-0.5 w-3 rounded" style={{ background: seriesColor(s.slot) }} />
                  {s.label}
                </span>
                <span className="tabular font-semibold text-navy">{valueFormat(s.values[active] ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <table className="sr-only">
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
          {labels.map((label, i) => (
            <tr key={label + i}>
              <th scope="row">{label}</th>
              {series.map((s) => (
                <td key={s.key}>{valueFormat(s.values[i] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
