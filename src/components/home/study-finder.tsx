"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CalendarDays, Check } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { services } from "@/content/services";
import { studyGoals } from "@/content/study-finder";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function StudyFinder() {
  const [selected, setSelected] = useState(studyGoals[0].key);
  const goal = studyGoals.find((item) => item.key === selected) ?? studyGoals[0];
  const service = services.find((item) => item.slug === goal.service);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
      <div role="radiogroup" aria-label="What do you need to know?" className="grid gap-2.5 sm:grid-cols-2">
        {studyGoals.map((item) => {
          const isOn = item.key === selected;
          return (
            <button
              key={item.key}
              type="button"
              role="radio"
              aria-checked={isOn}
              onClick={() => setSelected(item.key)}
              className={cn(
                "group flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-300",
                isOn
                  ? "border-blue bg-blue-tint shadow-[0_10px_30px_-18px_rgb(43_103_197/0.8)]"
                  : "border-mist bg-white hover:border-blue/40 hover:bg-cloud",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
                  isOn ? "bg-blue text-white" : "bg-cloud text-navy group-hover:bg-white",
                )}
              >
                <Icon name={item.icon} className="size-[1.15rem]" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className={cn("text-[0.93rem] leading-snug font-semibold", isOn ? "text-navy" : "text-charcoal")}>
                {item.goal}
              </span>
            </button>
          );
        })}
      </div>

      <div className="on-dark relative isolate overflow-hidden rounded-[1.75rem] bg-navy p-7 text-white sm:p-9" aria-live="polite">
        <div aria-hidden="true" className="absolute -top-24 -right-24 -z-10 size-72 rounded-full border-[18px] border-white/[0.05]" />
        <AnimatePresence mode="wait">
          <motion.div
            key={goal.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="eyebrow">Recommended study</p>
            <h3 className="mt-4 font-display text-[1.75rem] leading-tight font-bold text-white">{goal.studyName}</h3>
            <p className="mt-4 leading-relaxed text-white/75">{goal.approach}</p>

            <ul className="mt-6 flex flex-wrap gap-2">
              {goal.methods.map((method) => (
                <li key={method} className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/85">
                  {method}
                </li>
              ))}
            </ul>

            <div className="mt-7 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-[auto_1fr] sm:gap-10">
              <div>
                <p className="text-xs font-semibold tracking-wide text-white/50">Typical timeline</p>
                <p className="mt-2 flex items-center gap-2 font-display font-semibold text-white">
                  <CalendarDays className="size-4 text-gold" aria-hidden="true" />
                  {goal.timeline}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-white/50">You receive</p>
                <ul className="mt-2 space-y-1.5">
                  {goal.youReceive.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-white/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-white/60" strokeWidth={2.25} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href={`/start-a-project?goal=${goal.key}`} className={buttonClasses({ variant: "gold" })}>
                Plan this study
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              {service && (
                <Link href={`/services/${service.slug}`} className="font-display text-sm font-semibold text-white/80 hover:text-white">
                  About {service.shortTitle.toLowerCase()}
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
