"use client";

import { useState } from "react";
import { ActionForm, SubmitButton, Textarea } from "@/components/ui/form";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

const PRESETS = [10, 25, 50, 75, 90];

/**
 * The big progress meter with its "Update progress" form. Remount it with a
 * `key` of the saved value so it follows the server after each update.
 */
export function ProgressForm({
  assignmentId,
  progress,
  max,
  action,
  completed,
}: {
  assignmentId: string;
  progress: number;
  /** Employees stop at 99%: 100% is set when the administrator approves the work. */
  max: number;
  action: Action;
  completed: boolean;
}) {
  const [value, setValue] = useState(progress);
  const changed = value !== progress;

  return (
    <ActionForm action={action} className="space-y-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-5xl leading-none font-bold tracking-tight text-navy tabular" aria-live="polite">
            {value}
            <span className="text-2xl text-slate">%</span>
          </p>
          <p className="mt-1.5 text-sm text-slate">
            {changed ? (
              <>
                Saved at <span className="font-semibold text-navy tabular">{progress}%</span>. Press save to record the change.
              </>
            ) : completed ? (
              "Approved and complete."
            ) : (
              "Current progress"
            )}
          </p>
        </div>
      </div>
      <ProgressBar value={value} tone={completed ? "good" : "blue"} label="Progress" className="[&_[role=progressbar]]:h-3" />

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_6.5rem] sm:items-end">
        <div>
          <label htmlFor={`progress-${assignmentId}`} className="field-label">
            Update progress
          </label>
          <input
            id={`progress-${assignmentId}`}
            type="range"
            name="progress"
            min={0}
            max={max}
            step={1}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-blue"
            aria-valuetext={`${value}%`}
          />
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {PRESETS.filter((preset) => preset <= max).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue(preset)}
                className={cn(
                  "tabular rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                  value === preset ? "border-blue bg-blue-tint text-blue-dark" : "border-mist bg-white text-slate hover:border-slate/40 hover:text-navy",
                )}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor={`progress-number-${assignmentId}`} className="field-label">
            Percent
          </label>
          <div className="relative">
            <input
              id={`progress-number-${assignmentId}`}
              type="number"
              min={0}
              max={max}
              inputMode="numeric"
              value={value}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isFinite(next)) setValue(Math.min(Math.max(Math.round(next), 0), max));
              }}
              className="field-input tabular pr-8"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-sm text-slate" aria-hidden="true">
              %
            </span>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor={`progress-note-${assignmentId}`} className="field-label">
          What changed? <span className="font-normal text-slate">(optional)</span>
        </label>
        <Textarea
          id={`progress-note-${assignmentId}`}
          name="note"
          rows={2}
          maxLength={2000}
          placeholder="For example: cleaned the dataset and finished the descriptive tables."
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate">{max < 100 ? "The administrator sets 100% when approving the work." : "Ticking milestones also updates progress."}</p>
        <SubmitButton disabled={!changed} pendingLabel="Saving">
          Save progress
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
