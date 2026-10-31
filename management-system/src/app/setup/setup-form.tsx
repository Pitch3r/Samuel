"use client";

import { ActionForm, Field, Input, SubmitButton } from "@/components/ui/form";
import { setupAction } from "./actions";

export function SetupForm() {
  return (
    <ActionForm action={setupAction} className="space-y-5">
      <Field label="Setup key" name="setupKey" hint="The SETUP_KEY value from the server settings." required>
        <Input name="setupKey" type="password" autoComplete="off" required />
      </Field>
      <Field label="Your full name" name="displayName" required>
        <Input name="displayName" autoComplete="name" required />
      </Field>
      <Field label="Email address" name="email" required>
        <Input name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Password" name="password" hint="At least 10 characters, with letters and numbers." required>
        <Input name="password" type="password" autoComplete="new-password" required />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingLabel="Creating your account">
        Create administrator account
      </SubmitButton>
    </ActionForm>
  );
}
