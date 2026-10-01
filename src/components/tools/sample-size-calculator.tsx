"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, Info, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { BarChart } from "@/components/charts/bar-chart";
import { cn } from "@/lib/utils";
import type { CalculatorInitial } from "@/lib/calculator-params";
import { confidenceLevels, formatPoints, marginOfError, sampleSize, type ConfidenceLevel } from "@/lib/sample-size";

type Mode = CalculatorInitial["mode"] & string;

const DEFAULTS = { confidence: 95 as ConfidenceLevel, moe: 5, proportion: 50, population: "", designEffect: 1, responseRate: 100, sample: 400 };

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-navy">
          {label}
        </label>
        <span className="flex items-center gap-1">
          <input
            type="number"
            aria-label={`${label} value`}
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isNaN(next)) onChange(Math.min(max, Math.max(min, next)));
            }}
            className="w-20 rounded-lg border border-mist bg-white px-2 py-1 text-right font-display text-sm font-bold text-blue tabular-nums focus:border-blue focus:ring-2 focus:ring-blue/15 focus:outline-none"
          />
          {suffix && <span className="text-sm text-slate">{suffix}</span>}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-blue"
      />
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-slate">{hint}</p>}
    </div>
  );
}

export function SampleSizeCalculator({ initial = {} }: { initial?: CalculatorInitial }) {
  const [mode, setMode] = useState<Mode>(initial.mode ?? "size");
  const [confidence, setConfidence] = useState<ConfidenceLevel>(initial.confidence ?? DEFAULTS.confidence);
  const [moe, setMoe] = useState(initial.moe ?? DEFAULTS.moe);
  const [proportion, setProportion] = useState(initial.proportion ?? DEFAULTS.proportion);
  const [population, setPopulation] = useState(initial.population ?? DEFAULTS.population);
  const [designEffect, setDesignEffect] = useState(initial.designEffect ?? DEFAULTS.designEffect);
  const [responseRate, setResponseRate] = useState(initial.responseRate ?? DEFAULTS.responseRate);
  const [sample, setSample] = useState(initial.sample ?? DEFAULTS.sample);
  const [copied, setCopied] = useState(false);

  const populationValue = population.trim() === "" ? undefined : Number(population);
  const validPopulation = populationValue === undefined || (Number.isFinite(populationValue) && populationValue >= 2);

  const result = useMemo(() => {
    if (!validPopulation) return null;
    return sampleSize({
      marginOfError: moe / 100,
      confidence,
      proportion: proportion / 100,
      population: populationValue,
      designEffect,
      responseRate: responseRate / 100,
    });
  }, [moe, confidence, proportion, populationValue, designEffect, responseRate, validPopulation]);

  const achieved = useMemo(() => {
    if (!validPopulation) return null;
    return marginOfError({ sample, confidence, proportion: proportion / 100, population: populationValue, designEffect });
  }, [sample, confidence, proportion, populationValue, designEffect, validPopulation]);

  const chartData = useMemo(() => {
    if (!validPopulation) return [];
    const margins = [10, 8, 7, 6, 5, 4, 3.5, 3, 2.5, 2];
    return margins.map((m) => {
      const n = sampleSize({
        marginOfError: m / 100,
        confidence,
        proportion: proportion / 100,
        population: populationValue,
        designEffect,
        responseRate: 1,
      }).completes;
      return {
        label: `±${m}`,
        value: n,
        highlight: mode === "size" && Math.abs(m - moe) < 0.01,
        detail: `±${m} point margin needs ${n.toLocaleString("en-GB")} completed interviews`,
      };
    });
  }, [confidence, proportion, populationValue, designEffect, moe, mode, validPopulation]);

  function shareLink() {
    const params = new URLSearchParams({
      mode,
      c: String(confidence),
      e: String(moe),
      p: String(proportion),
      d: String(designEffect),
      r: String(responseRate),
      n: String(sample),
    });
    if (populationValue) params.set("N", String(populationValue));
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const summary =
      mode === "size" && result
        ? `Sample size: ${result.completes.toLocaleString("en-GB")} completed interviews (±${moe} points, ${confidence}% confidence).`
        : achieved !== null
          ? `Margin of error: ${formatPoints(achieved)} points for ${sample.toLocaleString("en-GB")} interviews at ${confidence}% confidence.`
          : "";
    navigator.clipboard
      .writeText(`${summary}\n${url}`)
      .then(() => {
        setCopied(true);
        toast.success("Result and link copied");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error("Could not copy. Please copy the address bar instead."));
  }

  function reset() {
    setConfidence(DEFAULTS.confidence);
    setMoe(DEFAULTS.moe);
    setProportion(DEFAULTS.proportion);
    setPopulation(DEFAULTS.population);
    setDesignEffect(DEFAULTS.designEffect);
    setResponseRate(DEFAULTS.responseRate);
    setSample(DEFAULTS.sample);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[1.75rem] border border-mist bg-white p-6 shadow-card sm:p-8">
        <div role="tablist" aria-label="Calculator mode" className="grid grid-cols-2 gap-1 rounded-full bg-cloud p-1 ring-1 ring-mist">
          {(
            [
              ["size", "Sample size needed"],
              ["margin", "Margin of error"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              className={cn(
                "relative rounded-full px-4 py-2.5 font-display text-sm font-semibold transition-colors",
                mode === key ? "text-white" : "text-slate hover:text-navy",
              )}
            >
              {mode === key && (
                <motion.span layoutId="calc-mode" className="absolute inset-0 rounded-full bg-navy" transition={{ duration: 0.35 }} />
              )}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-7">
          <div>
            <p id="confidence-label" className="text-sm font-semibold text-navy">
              Confidence level
            </p>
            <div role="radiogroup" aria-labelledby="confidence-label" className="mt-3 flex flex-wrap gap-1.5">
              {confidenceLevels.map((entry) => (
                <button
                  key={entry.level}
                  type="button"
                  role="radio"
                  aria-checked={confidence === entry.level}
                  onClick={() => setConfidence(entry.level)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                    confidence === entry.level ? "border-blue bg-blue text-white" : "border-mist text-charcoal hover:border-blue/50",
                  )}
                >
                  {entry.level}%
                </button>
              ))}
            </div>
          </div>

          {mode === "size" ? (
            <NumberField
              id="moe"
              label="Margin of error"
              value={moe}
              onChange={setMoe}
              min={1}
              max={15}
              step={0.5}
              suffix="± points"
              hint="How close to the true value your estimate needs to be. Plus or minus 5 points is common; national polls often aim for 3."
            />
          ) : (
            <NumberField
              id="sample"
              label="Completed interviews"
              value={sample}
              onChange={setSample}
              min={10}
              max={20000}
              step={10}
              hint="The number of interviews you have, or plan to complete."
            />
          )}

          <div>
            <label htmlFor="population" className="text-sm font-semibold text-navy">
              Population size <span className="font-normal text-slate">(optional)</span>
            </label>
            <input
              id="population"
              inputMode="numeric"
              placeholder="Leave blank for a large or unknown population"
              value={population}
              onChange={(event) => setPopulation(event.target.value.replace(/[^\d]/g, ""))}
              aria-invalid={!validPopulation || undefined}
              className="mt-2 block w-full rounded-xl border border-mist bg-white px-4 py-3 text-[0.98rem] tabular-nums placeholder:text-slate/70 focus:border-blue focus:ring-4 focus:ring-blue/15 focus:outline-none"
            />
            <p className="mt-1.5 text-xs leading-relaxed text-slate">
              Only matters when your sample is a sizeable share of the population, such as all staff in one organisation.
            </p>
          </div>

          <details className="group rounded-2xl border border-mist bg-cloud/60 p-5 open:bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm font-semibold text-navy">
              Advanced settings
              <span className="text-xs font-normal text-slate group-open:hidden">Proportion, design effect, response rate</span>
            </summary>
            <div className="mt-6 space-y-7">
              <NumberField
                id="proportion"
                label="Expected proportion"
                value={proportion}
                onChange={setProportion}
                min={1}
                max={99}
                suffix="%"
                hint="If you do not know, keep 50%. It gives the largest, safest sample."
              />
              <NumberField
                id="deff"
                label="Design effect"
                value={designEffect}
                onChange={setDesignEffect}
                min={1}
                max={4}
                step={0.1}
                hint="1 for a simple random sample. Clustered household surveys often use 1.5 to 2."
              />
              {mode === "size" && (
                <NumberField
                  id="response"
                  label="Expected response rate"
                  value={responseRate}
                  onChange={setResponseRate}
                  min={10}
                  max={100}
                  suffix="%"
                  hint="Used to work out how many people to approach to reach your target."
                />
              )}
            </div>
          </details>

          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy">
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset to defaults
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="on-dark relative isolate overflow-hidden rounded-[1.75rem] bg-navy p-7 text-white sm:p-9" aria-live="polite">
          <div aria-hidden="true" className="absolute -top-24 -right-24 -z-10 size-72 rounded-full border-[18px] border-white/[0.05]" />
          {!validPopulation ? (
            <p className="text-white/80">Please enter a population size of at least 2, or leave it blank.</p>
          ) : mode === "size" && result ? (
            <>
              <p className="text-sm font-semibold text-white/60">Completed interviews needed</p>
              <motion.p
                key={result.completes}
                initial={{ opacity: 0.3, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-2 font-display text-6xl font-extrabold tracking-tight text-white sm:text-7xl"
              >
                {result.completes.toLocaleString("en-GB")}
              </motion.p>
              <dl className="mt-7 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-white/55">People to approach</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-white">{result.toApproach.toLocaleString("en-GB")}</dd>
                  <dd className="text-xs text-white/55">at a {responseRate}% response rate</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/55">Precision</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-white">±{moe} points</dd>
                  <dd className="text-xs text-white/55">at {confidence}% confidence</dd>
                </div>
              </dl>
            </>
          ) : achieved !== null ? (
            <>
              <p className="text-sm font-semibold text-white/60">Margin of error</p>
              <motion.p
                key={achieved.toFixed(4)}
                initial={{ opacity: 0.3, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mt-2 font-display text-6xl font-extrabold tracking-tight text-white sm:text-7xl"
              >
                {formatPoints(achieved)}
                <span className="ml-2 text-2xl font-bold text-white/60">points</span>
              </motion.p>
              <p className="mt-6 border-t border-white/10 pt-6 text-sm leading-relaxed text-white/75">
                With {sample.toLocaleString("en-GB")} completed interviews, a result of {proportion}% would mean the true value
                lies between {Math.max(0, proportion - achieved * 100).toFixed(1)}% and{" "}
                {Math.min(100, proportion + achieved * 100).toFixed(1)}%, {confidence} times out of 100.
              </p>
            </>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={shareLink}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-4 font-display text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
            >
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              Copy result and link
            </button>
          </div>
        </div>

        {chartData.length > 0 && (
          <div className="rounded-[1.75rem] border border-mist bg-white p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-bold text-navy">Sample size by margin of error</p>
                <p className="mt-1 text-sm text-slate">
                  Completed interviews at {confidence}% confidence
                  {mode === "size" ? ". Your selection is highlighted." : "."}
                </p>
              </div>
              <span className="group relative">
                <Info className="size-5 text-slate" aria-hidden="true" />
                <span className="sr-only">Precision gets expensive: halving the margin of error roughly quadruples the sample.</span>
              </span>
            </div>
            <BarChart
              className="mt-6"
              data={chartData}
              height={250}
              ariaLabel={`Completed interviews needed for margins of error from plus or minus 10 to 2 points at ${confidence}% confidence`}
              tableCaption="Sample size by margin of error"
            />
            <p className="mt-4 text-xs leading-relaxed text-slate">
              Halving the margin of error roughly quadruples the sample, which is why precision should match the decision.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
