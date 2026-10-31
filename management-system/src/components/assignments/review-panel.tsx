"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { BadgeCheck, LoaderCircle, RotateCcw, Star } from "lucide-react";
import { ActionForm, Textarea, useFieldError } from "@/components/ui/form";
import { buttonClasses } from "@/components/ui/button";
import { RATING_LABELS } from "@/components/assignments/star-rating";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";
import { KeepValuesAfterSubmit } from "@/components/ui/form";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

function StarInput() {
  const error = useFieldError("rating");
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset>
      <legend className="field-label">Quality rating</legend>
      <div className="flex flex-wrap items-center gap-3" onMouseLeave={() => setHover(0)}>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              onMouseEnter={() => setHover(star)}
              className="cursor-pointer rounded-md p-0.5 has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-blue"
            >
              <input
                type="radio"
                name="rating"
                value={star}
                checked={value === star}
                onChange={() => setValue(star)}
                className="sr-only"
                aria-label={`${star} out of 5, ${RATING_LABELS[star]}`}
              />
              <Star
                className={cn("size-7 transition-colors", star <= shown ? "fill-blue text-blue" : "fill-white text-mist")}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </label>
          ))}
        </div>
        <span className="text-sm font-semibold text-navy" aria-hidden="true">
          {shown ? RATING_LABELS[shown] : <span className="font-normal text-slate">Needed to approve</span>}
        </span>
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

function NoteField() {
  const error = useFieldError("note");
  return (
    <div>
      <label htmlFor="review-note" className="field-label">
        Feedback
      </label>
      <Textarea
        id="review-note"
        name="note"
        rows={3}
        maxLength={2000}
        placeholder="What was done well, or what needs to change. Required when returning the work."
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function DecisionButton({ decision }: { decision: "approve" | "revise" }) {
  const { pending, data } = useFormStatus();
  const mine = pending && data?.get("decision") === decision;
  const approve = decision === "approve";
  return (
    <button
      type="submit"
      name="decision"
      value={decision}
      disabled={pending}
      className={buttonClasses({ variant: approve ? "primary" : "secondary", className: "w-full" })}
    >
      {mine ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : approve ? <BadgeCheck aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
      {approve ? "Approve and complete" : "Request revision"}
    </button>
  );
}

/** Administrator's review of submitted work: approve with a rating, or return it with notes. */
export function ReviewPanel({ assignmentId, action }: { assignmentId: string; action: Action }) {
  return (
    <ActionForm action={action} className="space-y-4">
      <KeepValuesAfterSubmit />
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <StarInput />
      <NoteField />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <DecisionButton decision="approve" />
        <DecisionButton decision="revise" />
      </div>
    </ActionForm>
  );
}
