"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { processSteps } from "@/content/approach";
import { Icon } from "@/components/ui/icon";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Six-stage method with a progress line that fills as the reader scrolls. */
export function ProcessTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <ol ref={ref} className="relative">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[1.375rem] w-px bg-mist sm:left-[1.625rem]" />
      <motion.span
        aria-hidden="true"
        style={{ scaleY: progress }}
        className="absolute top-2 bottom-2 left-[1.375rem] w-px origin-top bg-blue sm:left-[1.625rem]"
      />
      {processSteps.map((step) => {
        return (
          <motion.li
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative grid grid-cols-[2.75rem_1fr] gap-5 pb-12 last:pb-0 sm:grid-cols-[3.25rem_1fr] sm:gap-8"
          >
            <span className="relative z-10 grid size-11 place-items-center rounded-full border border-mist bg-white text-navy shadow-card sm:size-13">
              <Icon name={step.icon} className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="pt-1.5">
              <p className="font-display text-xs font-bold tracking-[0.16em] text-blue uppercase">
                Stage {step.number} · {step.title}
              </p>
              <h3 className="mt-2 font-display text-xl leading-snug font-bold text-navy sm:text-[1.4rem]">{step.headline}</h3>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate">{step.detail}</p>
              <p className="mt-4 w-fit max-w-full rounded-xl bg-cloud px-4 py-2.5 text-sm leading-relaxed text-charcoal ring-1 ring-mist">
                <span className="font-semibold text-navy">You receive: </span>
                {step.output}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
