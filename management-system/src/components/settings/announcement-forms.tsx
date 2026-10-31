"use client";

import { Megaphone, Pencil } from "lucide-react";
import { ActionForm, Checkbox, Field, Input, SubmitButton, Textarea } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export type AnnouncementValues = { id: string; title: string; body: string; pinned: boolean; expiresAt: string | null };

function Fields({ values, creating, today }: { values?: AnnouncementValues; creating: boolean; today: string }) {
  return (
    <>
      <Field label="Title" name="title" required>
        <Input
          name="title"
          defaultValue={values?.title}
          maxLength={140}
          autoComplete="off"
          placeholder="For example, Office closed on Monday for Heroes Day"
        />
      </Field>
      <Field label="Message" name="body" hint="Plain text. Keep it short: employees read it on their dashboard.">
        <Textarea name="body" rows={6} maxLength={4000} defaultValue={values?.body} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Show until" name="expiresAt" hint="Leave empty to keep it up until you delete it.">
          <Input name="expiresAt" type="date" min={creating ? today : undefined} defaultValue={values?.expiresAt ?? ""} />
        </Field>
      </div>
      <div className="space-y-3 rounded-xl border border-mist bg-cloud/50 px-4 py-3">
        <Checkbox
          name="pinned"
          defaultChecked={values?.pinned}
          label="Pin to the top"
          description="Pinned announcements are shown first and stand out on dashboards."
        />
        {creating && (
          <Checkbox
            name="notify"
            defaultChecked
            label="Notify employees"
            description="Each active employee also gets a notification that links to their dashboard."
          />
        )}
      </div>
    </>
  );
}

export function NewAnnouncementButton({ action, today }: { action: Action; today: string }) {
  const post = action;
  return (
    <Modal
      wide
      title="New announcement"
      description="Employees see current announcements on their dashboard."
      trigger={
        <>
          <Megaphone aria-hidden="true" />
          New announcement
        </>
      }
    >
      {(close) => (
        <ActionForm action={post} onSuccess={close} className="grid gap-5">
          <KeepValuesAfterSubmit />
          <Fields creating today={today} />
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={close} className="h-10 rounded-xl px-4 text-sm font-semibold text-navy hover:bg-navy/5">
              Cancel
            </button>
            <SubmitButton pendingLabel="Posting">Post announcement</SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}

export function EditAnnouncementButton({ action, values, today }: { action: Action; values: AnnouncementValues; today: string }) {
  const save = action;
  return (
    <Modal
      wide
      variant="ghost"
      size="sm"
      title="Edit announcement"
      trigger={
        <>
          <Pencil aria-hidden="true" />
          Edit
        </>
      }
    >
      {(close) => (
        <ActionForm action={save} onSuccess={close} className="grid gap-5">
          <KeepValuesAfterSubmit />
          <input type="hidden" name="id" value={values.id} />
          <Fields values={values} creating={false} today={today} />
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={close} className="h-10 rounded-xl px-4 text-sm font-semibold text-navy hover:bg-navy/5">
              Cancel
            </button>
            <SubmitButton pendingLabel="Saving">Save announcement</SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}
