"use client";

import { useState } from "react";
import { MessageSquareText, Star } from "lucide-react";
import { ActionForm, Field, SubmitButton, Textarea, useFieldError } from "@/components/ui/form";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { RATING_LABELS } from "@/components/work-reports/report-badges";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** Five radio buttons drawn as stars, plus "no rating". Keyboard: arrow keys move between stars. */
function RatingInput({ value, onChange }: { value: number | null; onChange: (value: number | null) => void }) {
  const [hover, setHover] = useState<number | null>(null);
  const error = useFieldError("rating");
  const shown = hover ?? value ?? 0;
  return (
    <fieldset>
      <legend className="field-label">Rating</legend>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              onMouseEnter={() => setHover(star)}
              className="cursor-pointer rounded-md p-0.5 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-blue"
            >
              <input type="radio" name="rating" value={star} checked={value === star} onChange={() => onChange(star)} className="sr-only" />
              <span className="sr-only">
                {star} out of 5, {RATING_LABELS[star]}
              </span>
              <Star
                className={cn("size-7 transition-colors", star <= shown ? "fill-blue text-blue" : "fill-mist text-mist hover:text-blue/40")}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </label>
          ))}
        </div>
        <span className="text-sm font-semibold text-navy" aria-live="polite">
          {shown ? RATING_LABELS[shown] : "No rating"}
        </span>
        {value !== null && (
          <button type="button" onClick={() => onChange(null)} className="text-xs font-semibold text-slate hover:text-navy">
            Clear
          </button>
        )}
      </div>
      {value === null && <input type="hidden" name="rating" value="" />}
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

/** The administrator's feedback and rating on a report. Saving marks it reviewed and notifies the author. */
export function ReviewForm({
  action,
  reportId,
  defaultFeedback,
  defaultRating,
  reviewed,
}: {
  action: Action;
  reportId: string;
  defaultFeedback: string;
  defaultRating: number | null;
  reviewed: boolean;
}) {
  const [rating, setRating] = useState<number | null>(defaultRating);
  return (
    <ActionForm action={action} className="space-y-5">
      <KeepValuesAfterSubmit />
      <input type="hidden" name="id" value={reportId} />
      <RatingInput value={rating} onChange={setRating} />
      <Field label="Feedback" name="feedback" hint="Shown to the author with your rating. Be specific about what went well and what to improve.">
        <Textarea name="feedback" rows={5} maxLength={4000} defaultValue={defaultFeedback} />
      </Field>
      <SubmitButton pendingLabel="Saving">
        <MessageSquareText aria-hidden="true" />
        {reviewed ? "Update review" : "Mark as reviewed"}
      </SubmitButton>
    </ActionForm>
  );
}
