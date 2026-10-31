"use client";

import { Save } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { BackgroundFieldsCard, ContactFieldsCard, EmergencyFieldsCard, type SelfProfileValues } from "@/components/profile/profile-fields";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** The parts of a profile a person may change about themselves. */
export function SelfProfileForm({ action, values }: { action: Action; values: SelfProfileValues }) {
  return (
    <ActionForm action={action} className="space-y-5">
      <KeepValuesAfterSubmit />
      <ContactFieldsCard values={values} />
      <BackgroundFieldsCard values={values} />
      <EmergencyFieldsCard values={values} />
      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving">
          <Save aria-hidden="true" />
          Save my profile
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
