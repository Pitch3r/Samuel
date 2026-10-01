"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { CircleCheck, Lightbulb, Layers, MessageCircleQuestion, MonitorSmartphone } from "lucide-react";
import { StatRing } from "@/components/brand/stat-ring";
import { cn } from "@/lib/utils";

const STAGES = [
  { key: "question", label: "Question", short: "Brief", icon: MessageCircleQuestion },
  { key: "design", label: "Design", icon: Layers },
  { key: "fieldwork", label: "Fieldwork", short: "Field", icon: MonitorSmartphone },
  { key: "insight", label: "Insight", icon: Lightbulb },
] as const;

const DURATION = 5200;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Auto-playing walk through an illustrative engagement, from the client's
 * question to the prime insight. Pauses on hover and focus, and respects
 * reduced motion.
 */
export function InsightEngine() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const running = !paused && !reduce && inView;

  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setIndex((value) => (value + 1) % STAGES.length), DURATION);
    return () => clearTimeout(timer);
  }, [index, running]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-2 shadow-glow backdrop-blur-md"
    >
      <div className="rounded-[1.4rem] border border-white/10 bg-navy-deep/70 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="flex items-center gap-2.5 font-display text-[0.7rem] font-bold tracking-[0.18em] text-white/60 uppercase">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold/70" />
              <span className="relative inline-flex size-2 rounded-full bg-gold" />
            </span>
            Example engagement
          </p>
          <p className="text-[0.7rem] text-white/45">Illustrative</p>
        </div>

        <div role="tablist" aria-label="Engagement stages" className="mt-5 grid grid-cols-4 gap-1.5">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const active = i === index;
            return (
              <button
                key={stage.key}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls="insight-engine-panel"
                onClick={() => setIndex(i)}
                className={cn(
                  "group flex min-w-0 flex-col gap-2 rounded-xl px-1.5 pt-2.5 pb-2 text-left transition-colors sm:px-2",
                  active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                )}
              >
                <span
                  className={cn(
                    "flex flex-col items-start gap-1 text-[0.6875rem] font-semibold sm:flex-row sm:items-center sm:gap-1.5 sm:text-xs",
                    active ? "text-white" : "text-white/55",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                  <span className="max-w-full truncate">
                    <span className="sm:hidden">{"short" in stage ? stage.short : stage.label}</span>
                    <span className="hidden sm:inline">{stage.label}</span>
                  </span>
                </span>
                <span className="block h-0.5 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    key={`${stage.key}-${index}-${running}`}
                    className="block h-full origin-left rounded-full bg-white/80"
                    initial={{ scaleX: i < index ? 1 : 0 }}
                    animate={{ scaleX: i < index ? 1 : i === index ? (running ? 1 : 0.5) : 0 }}
                    transition={{ duration: i === index && running ? DURATION / 1000 : 0.3, ease: "linear" }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div id="insight-engine-panel" role="tabpanel" aria-live="polite" className="relative mt-5 min-h-[19.5rem] sm:min-h-[18.5rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={STAGES[index].key}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {index === 0 && <QuestionStage />}
              {index === 1 && <DesignStage />}
              {index === 2 && <FieldworkStage />}
              {index === 3 && <InsightStage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StageLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold tracking-wide text-white/50">{children}</p>;
}

function QuestionStage() {
  return (
    <div className="space-y-4">
      <StageLabel>The decision the client faces</StageLabel>
      <blockquote className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 font-display text-lg leading-snug font-semibold text-white sm:text-xl">
        “Should we launch our mobile savings product in Copperbelt and Northern provinces next year?”
      </blockquote>
      <div className="grid grid-cols-2 gap-2.5 text-sm">
        {[
          ["Client", "Financial services"],
          ["Options", "Launch, adapt or wait"],
          ["Audience", "Adults 18+, urban and rural"],
          ["Deadline", "Board meeting in 10 weeks"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
            <p className="text-[0.7rem] text-white/45">{label}</p>
            <p className="mt-0.5 font-medium text-white/90">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesignStage() {
  const dots = Array.from({ length: 60 }, (_, i) => i);
  return (
    <div className="space-y-4">
      <StageLabel>A design that can answer it</StageLabel>
      <div className="grid grid-cols-3 gap-2.5 text-center">
        {[
          ["1,200", "adults"],
          ["95%", "confidence"],
          ["±2.8", "point margin"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3">
            <p className="font-display text-xl font-bold text-white sm:text-2xl">{value}</p>
            <p className="mt-0.5 text-[0.7rem] text-white/50">{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-xs text-white/55">
          <span>60 sampling clusters, 2 provinces</span>
          <span>Urban · Rural</span>
        </div>
        <div className="mt-3 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5">
          {dots.map((dot) => (
            <motion.span
              key={dot}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: dot * 0.012, duration: 0.3 }}
              className={cn("aspect-square rounded-full", dot % 15 < 6 ? "bg-blue" : "bg-white/35")}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-white/70">CAPI interviews in Bemba and English. Instruments piloted before fieldwork.</p>
    </div>
  );
}

function FieldworkStage() {
  const rows = [
    { label: "Copperbelt, urban", value: 100 },
    { label: "Copperbelt, rural", value: 92 },
    { label: "Northern, urban", value: 88 },
    { label: "Northern, rural", value: 74 },
  ];
  return (
    <div className="space-y-4">
      <StageLabel>Collected with quality checks every day</StageLabel>
      <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        {rows.map((row, i) => (
          <div key={row.label}>
            <div className="flex justify-between text-xs">
              <span className="text-white/70">{row.label}</span>
              <span className="font-semibold text-white tabular-nums">{row.value}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-blue"
                initial={{ width: 0 }}
                animate={{ width: `${row.value}%` }}
                transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2 text-xs text-white/75">
        {["GPS and timestamps", "Independent back-checks", "Audio audits, with consent", "Daily consistency checks"].map((check, i) => (
          <motion.li
            key={check}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.12 }}
            className="flex items-center gap-2"
          >
            <CircleCheck className="size-4 shrink-0 text-teal" strokeWidth={2} aria-hidden="true" />
            {check}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function InsightStage() {
  const bars = [
    { label: "Trust in agents", value: 41, prime: true },
    { label: "Fees", value: 22 },
    { label: "Distance", value: 17 },
    { label: "Phone access", value: 12 },
  ];
  return (
    <div className="space-y-4">
      <StageLabel>The prime insight</StageLabel>
      <div className="flex items-center gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <StatRing value={64} size={96} stroke={9} tone="dark" />
        <p className="font-display text-[1.05rem] leading-snug font-semibold text-white">
          Trust in the agent network, not price, decides whether people sign up.
        </p>
      </div>
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
        <p className="text-xs text-white/55">Main reason for not signing up (% of non-adopters)</p>
        <div className="mt-3 space-y-2">
          {bars.map((bar, i) => (
            <div key={bar.label} className="grid grid-cols-[6.5rem_1fr_2rem] items-center gap-2 text-xs">
              <span className={cn(bar.prime ? "font-semibold text-white" : "text-white/60")}>{bar.label}</span>
              <span className="h-2.5 overflow-hidden rounded-sm bg-white/[0.06]">
                <motion.span
                  className={cn("block h-full rounded-sm", bar.prime ? "bg-gold" : "bg-white/35")}
                  initial={{ width: 0 }}
                  animate={{ width: `${(bar.value / 45) * 100}%` }}
                  transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: EASE }}
                />
              </span>
              <span className="text-right font-semibold text-white tabular-nums">{bar.value}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-sm text-white/75">
        <span className="font-semibold text-white">Decision:</span> launch on the Copperbelt first, and invest in agent training in Northern.
      </p>
    </div>
  );
}
