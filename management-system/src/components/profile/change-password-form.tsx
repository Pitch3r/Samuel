"use client";

import { KeyRound } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { PasswordInput } from "@/components/profile/password-input";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * Change your own password. On success the action signs the person out
 * everywhere and sends them to the sign-in page, so this form never needs to
 * reset itself.
 */
export function ChangePasswordForm({ action }: { action: Action }) {
  return (
    <ActionForm action={action} className="grid gap-5">
      <PasswordInput name="currentPassword" label="Current password" autoComplete="current-password" />
      <div className="grid gap-5 sm:grid-cols-2">
        <PasswordInput name="newPassword" label="New password" hint="At least 10 characters, with letters and numbers." />
        <PasswordInput name="confirmPassword" label="Confirm new password" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8125rem] text-slate">You will be signed out on every computer and asked to sign in again.</p>
        <SubmitButton pendingLabel="Changing password">
          <KeyRound aria-hidden="true" />
          Change password
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
