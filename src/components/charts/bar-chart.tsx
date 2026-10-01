"use client";

import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type BarDatum = { label: string; value: number; highlight?: boolean; detail?: string };

const NAVY = "#0B2447";
const GOLD = "#E4AC3F";
const MIST = "#E3E8EF";
const SLATE = "#5B6B7F";

/** Clean tick values: steps of 1, 2 or 5 times a power of ten, whole numbers for whole-number data. */
export function niceTicks(maxValue: number, integer = true, target = 4) {
  if (!(maxValue > 0)) return [0, 1];
  const rough = maxValue / target;
  const base = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / base;
  let step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * base;
  if (integer) step = Math.max(1, Math.round(step));
  const top = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top + step / 1000; value += step) ticks.push(Number(value.toFixed(6)));
  return ticks;
}

/** Rounded data-end (4px) at the top, square at the baseline. */
function columnPath(x: number, y: number, width: number, height: number, radius = 4) {
  const r = Math.min(radius, width / 2, height);
  if (height <= 0) return "";
  return `M ${x} ${y + height} V ${y + r} Q ${x} ${y} ${x + r} ${y} H ${x + width - r} Q ${x + width} ${y} ${x + width} ${y + r} V ${y + height} Z`;
}

/**
 * Single-series column chart following the brand chart rules: navy columns,
 * one highlighted column in gold (always direct-labelled, since gold is low
 * contrast on white), hairline Mist grid, Slate labels, per-column tooltips,
 * and a table view so no value is gated behind hover.
 */
export function BarChart({
  data,
  height = 260,
  ariaLabel,
  formatValue = (value) => value.toLocaleString("en-GB"),
  xLabelEvery = 1,
  className,
  tableCaption,
}: {
  data: BarDatum[];
  height?: number;
  ariaLabel: string;
  formatValue?: (value: number) => string;
  xLabelEvery?: number;
  className?: string;
  tableCaption?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const id = useId();

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const margin = { top: 28, right: 8, bottom: 30, left: 48 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;
  const integer = data.every((d) => Number.isInteger(d.value));
  const ticks = niceTicks(Math.max(...data.map((d) => d.value), 0), integer);
  const max = ticks[ticks.length - 1];
  const band = plotW / Math.max(data.length, 1);
  const barW = Math.min(24, Math.max(4, band - 6));
  const scaleY = (value: number) => plotH - (value / max) * plotH;
  const activeDatum = active !== null ? data[active] : null;

  return (
    <figure className={cn("w-full", className)}>
      <div ref={wrapRef} className="relative w-full" style={{ height }}>
        <svg width={width} height={height} role="img" aria-labelledby={`${id}-title`} className="block overflow-visible">
          <title id={`${id}-title`}>{ariaLabel}</title>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {ticks.map((tick) => (
              <g key={tick} transform={`translate(0,${scaleY(tick)})`}>
                <line x1={0} x2={plotW} stroke={MIST} strokeWidth={1} shapeRendering="crispEdges" />
                <text x={-10} y={4} textAnchor="end" fontSize={11} fill={SLATE} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatValue(tick)}
                </text>
              </g>
            ))}

            {data.map((datum, i) => {
              const x = i * band + (band - barW) / 2;
              const barH = plotH - scaleY(datum.value);
              const y = scaleY(datum.value);
              const isActive = active === i;
              return (
                <g key={`${datum.label}-${i}`}>
                  <motion.path
                    d={columnPath(x, y, barW, barH)}
                    fill={datum.highlight ? GOLD : NAVY}
                    initial={reduce ? false : { opacity: 0, scaleY: 0 }}
                    animate={{ opacity: active === null || isActive ? 1 : 0.55, scaleY: 1 }}
                    transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.015, ease: [0.16, 1, 0.3, 1] }}
                    style={{ transformOrigin: `${x + barW / 2}px ${plotH}px`, transformBox: "view-box" }}
                  />
                  {datum.highlight && datum.value > 0 && (
                    <text
                      x={x + barW / 2}
                      y={y - 8}
                      textAnchor="middle"
                      fontSize={12}
                      fontWeight={700}
                      fill={NAVY}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatValue(datum.value)}
                    </text>
                  )}
                  {i % xLabelEvery === 0 && (
                    <text x={x + barW / 2} y={plotH + 20} textAnchor="middle" fontSize={11} fill={SLATE}>
                      {datum.label}
                    </text>
                  )}
                  <rect
                    x={i * band}
                    y={0}
                    width={band}
                    height={plotH}
                    fill="transparent"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${datum.label}: ${formatValue(datum.value)}${datum.detail ? `. ${datum.detail}` : ""}`}
                    onPointerEnter={() => setActive(i)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="cursor-default outline-none focus-visible:fill-blue/5"
                  />
                </g>
              );
            })}
            <line x1={0} x2={plotW} y1={plotH} y2={plotH} stroke="#CBD3DE" strokeWidth={1} shapeRendering="crispEdges" />
          </g>
        </svg>

        {activeDatum && active !== null && (
          <div
            role="presentation"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-mist bg-white px-3 py-2 shadow-lift"
            style={{
              left: Math.min(Math.max(margin.left + active * band + band / 2, 70), width - 70),
              top: margin.top + scaleY(activeDatum.value) - 10,
            }}
          >
            <p className="font-display text-sm font-bold text-navy">{formatValue(activeDatum.value)}</p>
            <p className="text-xs whitespace-nowrap text-slate">{activeDatum.detail ?? activeDatum.label}</p>
          </div>
        )}
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-blue hover:text-navy">View data as a table</summary>
        <div className="mt-3 max-h-64 overflow-auto rounded-xl border border-mist">
          <table className="w-full text-left text-sm">
            {tableCaption && <caption className="sr-only">{tableCaption}</caption>}
            <thead className="bg-cloud text-xs text-slate">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Label
                </th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((datum, i) => (
                <tr key={`${datum.label}-row-${i}`} className="border-t border-mist">
                  <td className="px-3 py-1.5 text-charcoal">{datum.detail ?? datum.label}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-navy tabular-nums">{formatValue(datum.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
