"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Languages, MapPin } from "lucide-react";
import { provinceLanguages } from "@/content/company";
import { ZAMBIA_VIEWBOX, zambiaMapAttribution, zambiaProvinces } from "@/content/zambia-map";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
const DEFAULT = "lusaka";

/** Interactive map of Zambia's ten provinces with the Lusaka office marked. */
export function CoverageMap() {
  const [active, setActive] = useState(DEFAULT);
  const province = zambiaProvinces.find((item) => item.id === active) ?? zambiaProvinces[0];
  const lusaka = zambiaProvinces.find((item) => item.id === "lusaka");
  const languages = provinceLanguages[province.name as keyof typeof provinceLanguages] ?? [];

  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-center">
      <figure className="relative">
        <svg
          viewBox={ZAMBIA_VIEWBOX}
          role="group"
          aria-label="Map of Zambia's ten provinces"
          className="h-auto w-full"
        >
          {zambiaProvinces.map((item) => {
            const isActive = item.id === active;
            return (
              <path
                key={item.id}
                d={item.path}
                role="button"
                tabIndex={0}
                aria-label={`${item.name} Province`}
                aria-pressed={isActive}
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
                onClick={() => setActive(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActive(item.id);
                  }
                }}
                className={cn(
                  "cursor-pointer stroke-navy stroke-[1.6] transition-[fill] duration-300 outline-none",
                  isActive ? "fill-blue" : "fill-white/[0.13] hover:fill-white/25 focus-visible:fill-white/25",
                )}
              />
            );
          })}
          {zambiaProvinces.map((item) => (
            <text
              key={`${item.id}-label`}
              x={item.label.x}
              y={item.label.y}
              textAnchor="middle"
              className={cn(
                "pointer-events-none font-display text-[19px] font-semibold transition-opacity",
                item.id === active ? "fill-white" : "fill-white/60",
              )}
            >
              {item.name}
            </text>
          ))}
          {lusaka && (
            <g aria-hidden="true">
              <circle cx={lusaka.capitalPoint.x} cy={lusaka.capitalPoint.y} r="20" className="fill-gold/25">
                <animate attributeName="r" values="10;26;10" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0;0.9" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx={lusaka.capitalPoint.x} cy={lusaka.capitalPoint.y} r="8" className="fill-gold stroke-navy stroke-[2.5]" />
            </g>
          )}
          {province.id !== "lusaka" && (
            <circle
              cx={province.capitalPoint.x}
              cy={province.capitalPoint.y}
              r="6"
              className="pointer-events-none fill-white stroke-navy stroke-2"
            />
          )}
        </svg>
        <figcaption className="mt-4 text-[0.7rem] leading-relaxed text-white/45">{zambiaMapAttribution}</figcaption>
      </figure>

      <div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-7" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={province.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="text-xs font-semibold tracking-wide text-white/50">Province</p>
              <p className="mt-1 font-display text-3xl font-bold text-white">{province.name}</p>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden="true" />
                  <div>
                    <dt className="text-white/50">Provincial capital</dt>
                    <dd className="font-semibold text-white">
                      {province.capital}
                      {province.id === "lusaka" && <span className="ml-2 text-gold">Our office</span>}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Languages className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden="true" />
                  <div>
                    <dt className="text-white/50">Main local languages</dt>
                    <dd className="font-semibold text-white">{languages.join(", ")}</dd>
                  </div>
                </div>
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Choose a province">
          {zambiaProvinces.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActive(item.id)}
                aria-pressed={item.id === active}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  item.id === active
                    ? "border-white bg-white text-navy"
                    : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
                )}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
