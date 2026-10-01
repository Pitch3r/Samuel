"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { researchLevels } from "@/content/approach";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LevelsExplorer() {
  const [active, setActive] = useState(0);
  const level = researchLevels[active];

  return (
    <div>
      <div role="tablist" aria-label="Research at every level" className="grid grid-cols-2 gap-1 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-1.5 sm:inline-flex sm:rounded-full">
        {researchLevels.map((item, index) => (
          <button
            key={item.key}
            id={`level-tab-${item.key}`}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-controls="level-panel"
            onClick={() => setActive(index)}
            className={cn(
              "relative rounded-full px-5 py-2.5 font-display text-sm font-semibold transition-colors",
              index === active ? "text-navy" : "text-white/70 hover:text-white",
            )}
          >
            {index === active && (
              <motion.span
                layoutId="level-pill"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ duration: 0.4, ease: EASE }}
              />
            )}
            <span className="relative">{item.label}</span>
          </button>
        ))}
      </div>

      <div id="level-panel" role="tabpanel" aria-labelledby={`level-tab-${level.key}`} className="mt-10 min-h-[22rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={level.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="max-w-2xl">
              <h3 className="font-display text-2xl font-bold text-white sm:text-[1.75rem]">{level.title}</h3>
              <p className="mt-2 text-white/70">{level.description}</p>
            </div>

            {level.progression ? (
              <>
                <ol
                  className="mt-10 hidden md:grid"
                  style={{ gridTemplateColumns: `repeat(${level.steps.length}, minmax(0, 1fr))` }}
                >
                  {level.steps.map((step, index) => (
                    <li key={step.title} className="relative pr-6">
                      <div className="relative flex items-center">
                        <motion.span
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 + index * 0.12, duration: 0.4 }}
                          className={cn(
                            "relative z-10 grid size-10 place-items-center rounded-full border font-display text-sm font-bold tabular-nums",
                            index === level.steps.length - 1
                              ? "border-gold bg-gold text-navy"
                              : "border-white/25 bg-navy text-white",
                          )}
                        >
                          {index + 1}
                        </motion.span>
                        {index < level.steps.length - 1 && (
                          <span aria-hidden="true" className="absolute top-1/2 right-0 left-10 h-px -translate-y-1/2 overflow-hidden bg-white/10">
                            <motion.span
                              className="block h-full origin-left bg-white/50"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ delay: 0.2 + index * 0.12, duration: 0.5, ease: EASE }}
                            />
                          </span>
                        )}
                      </div>
                      <p className="mt-5 font-display text-lg leading-snug font-bold text-white">{step.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">{step.detail}</p>
                    </li>
                  ))}
                </ol>
                <ol className="mt-10 grid gap-5 md:hidden">
                  {level.steps.map((step, index) => (
                    <li key={step.title} className="flex gap-4">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full border font-display text-sm font-bold",
                          index === level.steps.length - 1 ? "border-gold bg-gold text-navy" : "border-white/25 text-white",
                        )}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-display font-bold text-white">{step.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/65">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {level.steps.map((step, index) => (
                  <motion.li
                    key={step.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4, ease: EASE }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <p className="font-display text-lg font-bold text-white">{step.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{step.detail}</p>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
