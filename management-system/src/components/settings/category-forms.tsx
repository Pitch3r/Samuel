"use client";

import { Pencil, Plus } from "lucide-react";
import { ActionForm, Field, Input, SubmitButton, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { TRACKS, TRACK_DESCRIPTIONS, TRACK_LABELS, type Track } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-10 rounded-xl px-4 text-sm font-semibold text-navy hover:bg-navy/5">
      Cancel
    </button>
  );
}

/** Adds a category. The track can be preselected when the button sits inside a track's card. */
export function AddCategoryButton({ action, track, variant = "primary" }: { action: Action; track?: Track; variant?: "primary" | "secondary" }) {
  const add = action;
  return (
    <Modal
      variant={variant}
      size={variant === "secondary" ? "sm" : "md"}
      title="Add a category"
      description="Categories are the service lines assignments are filed under."
      trigger={
        <>
          <Plus aria-hidden="true" />
          {track ? `Add to ${TRACK_LABELS[track].toLowerCase()}` : "Add category"}
        </>
      }
    >
      {(close) => (
        <ActionForm action={add} onSuccess={close} className="grid gap-5">
          <KeepValuesAfterSubmit />
          <fieldset>
            <legend className="field-label">Research track</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {TRACKS.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border border-mist bg-white p-3 transition-colors hover:border-slate/40",
                    "has-[:checked]:border-blue has-[:checked]:bg-blue-tint/50 has-[:checked]:ring-1 has-[:checked]:ring-blue",
                  )}
                >
                  <input
                    type="radio"
                    name="track"
                    value={option}
                    defaultChecked={option === (track ?? "corporate")}
                    className="mt-0.5 size-4 shrink-0 accent-blue"
                  />
                  <span className="text-sm">
                    <span className="block font-semibold text-navy">{TRACK_LABELS[option]}</span>
                    <span className="mt-0.5 block text-xs text-slate">{TRACK_DESCRIPTIONS[option]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Name" name="name" required>
            <Input name="name" maxLength={120} autoComplete="off" placeholder="For example, Customer experience research" />
          </Field>
          <Field label="Description" name="description" hint="One line on what work belongs here. Staff see it when choosing a category.">
            <Textarea name="description" rows={3} maxLength={400} />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <CancelButton onClick={close} />
            <SubmitButton pendingLabel="Adding">Add category</SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}

export function EditCategoryButton({
  action,
  category,
}: {
  action: Action;
  category: { id: string; name: string; description: string; track: Track };
}) {
  const save = action;
  return (
    <Modal
      variant="ghost"
      size="sm"
      title="Edit category"
      description={TRACK_LABELS[category.track]}
      trigger={
        <>
          <Pencil aria-hidden="true" />
          <span className="sr-only">Edit {category.name}</span>
        </>
      }
    >
      {(close) => (
        <ActionForm action={save} onSuccess={close} className="grid gap-5">
          <KeepValuesAfterSubmit />
          <input type="hidden" name="id" value={category.id} />
          <Field label="Name" name="name" required hint="Assignments already filed keep the name they were filed under.">
            <Input name="name" defaultValue={category.name} maxLength={120} autoComplete="off" />
          </Field>
          <Field label="Description" name="description">
            <Textarea name="description" rows={3} maxLength={400} defaultValue={category.description} />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <CancelButton onClick={close} />
            <SubmitButton pendingLabel="Saving">Save category</SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}
