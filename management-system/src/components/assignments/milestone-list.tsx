"use client";

import { useOptimistic } from "react";
import { useFormStatus } from "react-dom";
import { Check, LoaderCircle, Plus, X } from "lucide-react";
import { ActionForm, ConfirmForm, Input, SubmitButton, useFieldError } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export type MilestoneView = {
  id: string;
  title: string;
  dueDate: string | null;
  /** Formatted on the server, in Lusaka time. */
  dueLabel: string | null;
  overdue: boolean;
  done: boolean;
  doneNote: string | null;
};

function ToggleBox({ done, title, disabled }: { done: boolean; title: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-pressed={done}
      aria-label={done ? `Mark "${title}" as not done` : `Mark "${title}" as done`}
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-lg border-2 transition-colors disabled:cursor-not-allowed",
        done ? "border-good bg-good text-white" : "border-mist bg-white text-transparent hover:border-good/60",
        disabled && !done && "bg-cloud",
      )}
    >
      {pending ? <LoaderCircle className="size-3.5 animate-spin text-slate" aria-hidden="true" /> : <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
    </button>
  );
}

function MilestoneItem({
  assignmentId,
  milestone,
  canEdit,
  canRemove,
  toggleAction,
  removeAction,
}: {
  assignmentId: string;
  milestone: MilestoneView;
  canEdit: boolean;
  canRemove: boolean;
  toggleAction: Action;
  removeAction: Action;
}) {
  // Tick the box straight away; the server's answer replaces it a moment later.
  const [done, setDone] = useOptimistic(milestone.done);
  return (
    <li className="flex items-start gap-3 py-3">
      <ActionForm
        action={async (state: ActionResult | null, formData: FormData) => {
          setDone(!done);
          return toggleAction(state, formData);
        }}
        className="pt-0.5"
      >
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <input type="hidden" name="milestoneId" value={milestone.id} />
        <ToggleBox done={done} title={milestone.title} disabled={!canEdit} />
      </ActionForm>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", done ? "text-slate line-through decoration-slate/50" : "text-navy")}>{milestone.title}</p>
        <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate">
          {milestone.dueLabel && (
            <span className={cn(!done && milestone.overdue && "font-semibold text-danger")}>
              {!done && milestone.overdue ? "Overdue, was due " : "Due "}
              {milestone.dueLabel}
            </span>
          )}
          {done && milestone.doneNote && <span>{milestone.doneNote}</span>}
        </p>
      </div>
      {canRemove && (
        <ConfirmForm action={removeAction} confirm={`Remove the milestone "${milestone.title}"?`} hidden={{ assignmentId, milestoneId: milestone.id }}>
          <button type="submit" className="rounded-lg p-1.5 text-slate hover:bg-danger-tint hover:text-danger" aria-label={`Remove milestone "${milestone.title}"`}>
            <X className="size-4" aria-hidden="true" />
          </button>
        </ConfirmForm>
      )}
    </li>
  );
}

function DateField() {
  const error = useFieldError("dueDate");
  return (
    <div className="sm:w-44">
      <label htmlFor="milestone-due" className="sr-only">
        Milestone due date (optional)
      </label>
      <Input id="milestone-due" name="dueDate" type="date" />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function TitleField() {
  const error = useFieldError("title");
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="milestone-title" className="sr-only">
        Milestone
      </label>
      <Input id="milestone-title" name="title" maxLength={160} placeholder="Add a milestone" autoComplete="off" />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** Checklist of milestones: tick, add and (administrator only) remove. */
export function MilestoneList({
  assignmentId,
  milestones,
  canEdit,
  canRemove,
  toggleAction,
  addAction,
  removeAction,
}: {
  assignmentId: string;
  milestones: MilestoneView[];
  canEdit: boolean;
  canRemove: boolean;
  toggleAction: Action;
  addAction: Action;
  removeAction: Action;
}) {
  return (
    <div>
      {milestones.length > 0 ? (
        <ul className="divide-y divide-mist">
          {milestones.map((milestone) => (
            <MilestoneItem
              key={milestone.id}
              assignmentId={assignmentId}
              milestone={milestone}
              canEdit={canEdit}
              canRemove={canRemove}
              toggleAction={toggleAction}
              removeAction={removeAction}
            />
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-mist px-4 py-5 text-center text-sm text-slate">
          No milestones yet. Break the work into steps so progress is easy to follow.
        </p>
      )}
      {canEdit && (
        <ActionForm action={addAction} resetOnSuccess className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
          <input type="hidden" name="assignmentId" value={assignmentId} />
          <TitleField />
          <DateField />
          <SubmitButton variant="secondary" pendingLabel="Adding">
            <Plus aria-hidden="true" />
            Add
          </SubmitButton>
        </ActionForm>
      )}
    </div>
  );
}
