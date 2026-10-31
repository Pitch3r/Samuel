"use client";

import type { ReactNode } from "react";
import { ActionForm, ConfirmForm } from "@/components/ui/form";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** A confirmed one-button form, for removing or ending things. */
export function ConfirmActionForm({
  action,
  confirm,
  hidden,
  className,
  children,
}: {
  action: Action;
  confirm: string;
  hidden?: Record<string, string>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ConfirmForm action={action} confirm={confirm} hidden={hidden} className={className}>
      {children}
    </ConfirmForm>
  );
}

/** A one-button form without a confirmation, for small reversible changes such as pinning or reordering. */
export function QuickActionForm({
  action,
  hidden,
  className,
  children,
}: {
  action: Action;
  hidden: Record<string, string>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <ActionForm action={action} className={className}>
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      {children}
    </ActionForm>
  );
}
