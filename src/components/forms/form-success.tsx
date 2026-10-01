"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

function AnimatedCheck() {
  const reduce = useReducedMotion();
  const draw = (delay: number) => ({
    initial: reduce ? false : { pathLength: 0 },
    animate: { pathLength: 1 },
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });
  return (
    <svg viewBox="0 0 64 64" className="size-16 shrink-0" aria-hidden="true">
      <circle cx="32" cy="32" r="27" fill="none" stroke="#E3E8EF" strokeWidth="6" />
      <motion.circle cx="32" cy="32" r="27" fill="none" stroke="#1B9A8F" strokeWidth="6" strokeLinecap="round" transform="rotate(-90 32 32)" {...draw(0)} />
      <motion.path d="M21 33 L29 41 L44 25" fill="none" stroke="#0B2447" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" {...draw(0.45)} />
    </svg>
  );
}

export function FormSuccess({
  title,
  message,
  reference,
  onReset,
  resetLabel = "Send another message",
  children,
}: {
  title: string;
  message: string;
  reference?: string;
  onReset?: () => void;
  resetLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-start gap-6 rounded-[1.75rem] border border-mist bg-white p-8 text-left shadow-card sm:p-10"
    >
      <div className="flex items-center gap-5">
        <AnimatedCheck />
        <div>
          <p className="font-display text-2xl font-bold text-navy">{title}</p>
          {reference && (
            <p className="mt-1 text-sm text-slate">
              Your reference: <span className="font-mono font-semibold text-navy">{reference}</span>
            </p>
          )}
        </div>
      </div>
      <p className="max-w-xl leading-relaxed text-charcoal">{message}</p>
      {children}
      {onReset && (
        <Button type="button" variant="outline" onClick={onReset}>
          {resetLabel}
        </Button>
      )}
    </motion.div>
  );
}
