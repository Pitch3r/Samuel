"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { ActionForm, Textarea } from "@/components/ui/form";
import { buttonClasses } from "@/components/ui/button";
import type { TransitionButton } from "@/components/assignments/workflow";
import type { ActionResult } from "@/lib/types";
import { KeepValuesAfterSubmit } from "@/components/ui/form";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** A submit button that names the status it moves to, with its own spinner. */
function StatusButton({ button, size = "md" }: { button: TransitionButton; size?: "sm" | "md" }) {
  const { pending, data } = useFormStatus();
  const mine = pending && data?.get("status") === button.to;
  return (
    <button
      type="submit"
      name="status"
      value={button.to}
      disabled={pending}
      onClick={(event) => {
        if (button.confirm && !window.confirm(button.confirm)) event.preventDefault();
      }}
      className={buttonClasses({ variant: button.variant, size })}
    >
      {mine && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {button.label}
    </button>
  );
}

/** The workflow buttons the viewer is allowed to use, with an optional note sent alongside. */
export function StatusActions({ assignmentId, buttons, action }: { assignmentId: string; buttons: TransitionButton[]; action: Action }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const main = buttons.filter((button) => button.primary);
  const more = buttons.filter((button) => !button.primary);

  return (
    <ActionForm action={action} className="space-y-3">
      <KeepValuesAfterSubmit />
      <input type="hidden" name="assignmentId" value={assignmentId} />
      {noteOpen ? (
        <div>
          <label htmlFor={`status-note-${assignmentId}`} className="field-label">
            Note to go with the change <span className="font-normal text-slate">(optional)</span>
          </label>
          <Textarea
            id={`status-note-${assignmentId}`}
            name="note"
            rows={2}
            maxLength={2000}
            placeholder="For example: draft report shared in the files section."
            autoFocus
          />
        </div>
      ) : (
        <button type="button" onClick={() => setNoteOpen(true)} className="text-sm font-semibold text-blue hover:underline">
          Add a note to the status change
        </button>
      )}
      {main.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {main.map((button) => (
            <StatusButton key={button.to} button={button} />
          ))}
        </div>
      )}
      {more.length > 0 && (
        <details className="group rounded-xl border border-mist">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-semibold text-navy">
            {main.length ? "Other status changes" : "Change the status"}
            <ChevronDown className="size-4 text-slate transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="flex flex-wrap gap-2 border-t border-mist p-3">
            {more.map((button) => (
              <StatusButton key={button.to} button={button} size="sm" />
            ))}
          </div>
        </details>
      )}
    </ActionForm>
  );
}
