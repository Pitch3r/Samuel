"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Calculator, ClipboardList } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { confidenceLevels, sampleSize, type ConfidenceLevel } from "@/lib/sample-size";
import { cn } from "@/lib/utils";

export function ToolsTeaser() {
  const [moe, setMoe] = useState(5);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(95);
  const result = useMemo(() => sampleSize({ marginOfError: moe / 100, confidence }), [moe, confidence]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      <div className="rounded-[1.75rem] border border-mist bg-white p-7 shadow-card sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-tint text-navy">
            <Calculator className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <p className="font-display text-lg font-bold text-navy">Sample size calculator</p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-7">
            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="teaser-moe" className="text-sm font-semibold text-navy">
                  Margin of error
                </label>
                <span className="font-display text-sm font-bold text-blue tabular-nums">±{moe} points</span>
              </div>
              <input
                id="teaser-moe"
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={moe}
                onChange={(event) => setMoe(Number(event.target.value))}
                className="mt-3 w-full accent-blue"
              />
            </div>
            <div>
              <p id="teaser-confidence" className="text-sm font-semibold text-navy">
                Confidence level
              </p>
              <div role="radiogroup" aria-labelledby="teaser-confidence" className="mt-3 flex flex-wrap gap-1.5">
                {confidenceLevels.map((entry) => (
                  <button
                    key={entry.level}
                    type="button"
                    role="radio"
                    aria-checked={confidence === entry.level}
                    onClick={() => setConfidence(entry.level)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                      confidence === entry.level
                        ? "border-blue bg-blue text-white"
                        : "border-mist text-charcoal hover:border-blue/50",
                    )}
                  >
                    {entry.level}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-cloud px-7 py-6 text-center ring-1 ring-mist sm:min-w-44">
            <p className="text-xs font-semibold text-slate">Completed interviews</p>
            <motion.p
              key={result.completes}
              initial={{ opacity: 0.4, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 font-display text-5xl font-extrabold text-navy"
              aria-live="polite"
            >
              {result.completes.toLocaleString("en-GB")}
            </motion.p>
            <p className="mt-1 text-xs text-slate">large population, p = 0.5</p>
          </div>
        </div>

        <Link
          href="/tools/sample-size-calculator"
          className="group mt-8 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-blue hover:text-navy"
        >
          Open the full calculator, with population size, design effect and response rate
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="on-dark relative isolate flex flex-col overflow-hidden rounded-[1.75rem] bg-navy p-7 text-white sm:p-9">
        <div aria-hidden="true" className="absolute -right-20 -bottom-24 -z-10 size-72 rounded-full border-[18px] border-white/[0.05]" />
        <span className="grid size-11 place-items-center rounded-xl bg-white/10 text-white">
          <ClipboardList className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <p className="mt-6 font-display text-2xl leading-snug font-bold text-white">Plan your study in five minutes.</p>
        <p className="mt-3 leading-relaxed text-white/70">
          Answer a few short questions about your decision, scope and timeline. A researcher will reply within one working day.
        </p>
        <ol className="mt-6 space-y-2.5 text-sm text-white/80">
          {["Your goal", "The decision you face", "Scope and timeline", "How to reach you"].map((step, index) => (
            <li key={step} className="flex items-center gap-3">
              <span className="grid size-6 place-items-center rounded-full border border-white/20 font-display text-xs font-bold">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <div className="mt-auto pt-8">
          <Link href="/start-a-project" className={buttonClasses({ variant: "gold" })}>
            Request a proposal
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
