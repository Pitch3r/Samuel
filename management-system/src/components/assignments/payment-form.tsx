"use client";

import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ActionForm, Field, Input, Select, SubmitButton } from "@/components/ui/form";
import { PAYMENT_LABELS, PAYMENT_STATUSES, type PaymentStatus } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";
import { KeepValuesAfterSubmit } from "@/components/ui/form";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** "12,500" for an amount, which the server reads back without the commas. */
const moneyText = (value: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value);

function Money({ name, defaultValue }: { name: string; defaultValue: number | null }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-sm font-semibold text-slate" aria-hidden="true">
        K
      </span>
      <Input name={name} inputMode="decimal" autoComplete="off" defaultValue={defaultValue === null ? "" : moneyText(defaultValue)} placeholder="0" className="tabular pl-8" />
    </div>
  );
}

/** "Update payment" button and dialog for the administrator. */
export function PaymentForm({
  assignmentId,
  fee,
  paymentStatus,
  amountPaid,
  action,
}: {
  assignmentId: string;
  fee: number | null;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  action: Action;
}) {
  return (
    <Modal
      title="Update payment"
      description="Fees are in Zambian kwacha. Outstanding amounts feed the finance figures in reports."
      variant="secondary"
      size="sm"
      triggerClassName="w-full"
      trigger={
        <>
          <Pencil aria-hidden="true" />
          Update payment
        </>
      }
    >
      {(close) => (
        <ActionForm action={action} onSuccess={close} className="space-y-4">
          <KeepValuesAfterSubmit />
          <input type="hidden" name="assignmentId" value={assignmentId} />
          <Field label="Fee" name="fee" hint="Leave blank if there is no fee.">
            <Money name="fee" defaultValue={fee} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Payment status" name="paymentStatus">
              <Select name="paymentStatus" defaultValue={paymentStatus}>
                {PAYMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PAYMENT_LABELS[status]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Amount paid" name="amountPaid">
              <Money name="amountPaid" defaultValue={amountPaid || null} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-mist pt-4">
            <button type="button" onClick={close} className="h-10 rounded-xl px-4 text-sm font-semibold text-navy hover:bg-navy/5">
              Cancel
            </button>
            <SubmitButton pendingLabel="Saving">Save payment</SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}
