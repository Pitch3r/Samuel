"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { ServiceCard } from "@/components/sections/cards";
import { buttonClasses } from "@/components/ui/button";
import { services } from "@/content/services";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ServicesExplorer() {
  const [active, setActive] = useState(0);
  const service = services[active];

  return (
    <>
      {/* Mobile and tablet: simple cards. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
        {services.map((item) => (
          <ServiceCard key={item.slug} service={item} />
        ))}
      </div>

      {/* Desktop: interactive explorer. */}
      <div className="hidden overflow-hidden rounded-[1.75rem] border border-mist bg-white shadow-card lg:grid lg:grid-cols-[22rem_1fr] xl:grid-cols-[25rem_1fr]">
        <div role="tablist" aria-label="Services" aria-orientation="vertical" className="border-r border-mist bg-cloud/60 p-3">
          {services.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.slug}
                id={`service-tab-${item.slug}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="service-panel"
                onClick={() => setActive(index)}
                onMouseEnter={() => setActive(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    const next = (index + (event.key === "ArrowDown" ? 1 : -1) + services.length) % services.length;
                    setActive(next);
                    document.getElementById(`service-tab-${services[next].slug}`)?.focus();
                  }
                }}
                tabIndex={selected ? 0 : -1}
                className="relative flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left"
              >
                {selected && (
                  <motion.span
                    layoutId="service-tab-indicator"
                    className="absolute inset-0 rounded-2xl bg-white shadow-card ring-1 ring-mist"
                    transition={{ duration: 0.45, ease: EASE }}
                  />
                )}
                <span
                  className={cn(
                    "relative font-display text-xs font-bold tabular-nums transition-colors",
                    selected ? "text-blue" : "text-slate/60",
                  )}
                >
                  {item.number}
                </span>
                <span
                  className={cn(
                    "relative font-display text-[0.98rem] leading-snug font-semibold transition-colors",
                    selected ? "text-navy" : "text-slate",
                  )}
                >
                  {item.shortTitle}
                </span>
              </button>
            );
          })}
        </div>

        <div id="service-panel" role="tabpanel" aria-labelledby={`service-tab-${service.slug}`} className="relative p-10 xl:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="flex h-full flex-col"
            >
              <div className="flex items-start justify-between gap-6">
                <span className="grid size-14 place-items-center rounded-2xl bg-navy text-white">
                  <Icon name={service.icon} className="size-6" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className="font-display text-6xl leading-none font-extrabold text-mist tabular-nums">{service.number}</span>
              </div>
              <h3 className="mt-6 font-display text-[1.9rem] leading-tight font-bold text-navy">{service.title}</h3>
              <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate">{service.summary}</p>

              <div className="mt-8 grid gap-8 xl:grid-cols-2">
                <div>
                  <p className="font-display text-xs font-bold tracking-[0.16em] text-slate uppercase">Questions we help answer</p>
                  <ul className="mt-4 space-y-3">
                    {service.questions.slice(0, 3).map((question) => (
                      <li key={question} className="flex gap-3 text-[0.95rem] leading-relaxed text-charcoal">
                        <span aria-hidden="true" className="mt-2.5 h-px w-4 shrink-0 bg-blue" />
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-display text-xs font-bold tracking-[0.16em] text-slate uppercase">What we deliver</p>
                  <ul className="mt-4 space-y-3">
                    {service.offerings.slice(0, 4).map((offering) => (
                      <li key={offering.title} className="flex gap-3 text-[0.95rem] leading-relaxed text-charcoal">
                        <Check className="mt-1 size-4 shrink-0 text-blue" strokeWidth={2.25} aria-hidden="true" />
                        {offering.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-auto flex items-center gap-4 pt-10">
                <Link href={`/services/${service.slug}`} className={buttonClasses({ variant: "primary" })}>
                  Explore {service.shortTitle.toLowerCase()}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/start-a-project" className="font-display text-sm font-semibold text-navy hover:text-blue">
                  Discuss a study
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
