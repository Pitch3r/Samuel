"use client";

import { useEffect, useRef } from "react";
import { CircleCheck, MonitorCheck, Pencil } from "lucide-react";
import { ActionForm, Field, Input, SubmitButton } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { EmployeePicker, type EmployeeOption } from "@/components/settings/employee-picker";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** Browser facts the server cannot see, recorded with the computer so the administrator can tell computers apart. */
function ClientDetailsInput() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { platform?: string } };
    ref.current.value = JSON.stringify({
      platform: nav.userAgentData?.platform ?? navigator.platform ?? "",
      screen: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cores: navigator.hardwareConcurrency ?? null,
      memory: nav.deviceMemory ?? null,
    });
  }, []);
  return <input ref={ref} type="hidden" name="client" defaultValue="" />;
}

/** Registers the computer the administrator is using right now as an approved office computer. */
export function RegisterComputerForm({
  action,
  employees,
  suggestedLabel,
  currentLabel,
  selected,
}: {
  action: Action;
  employees: EmployeeOption[];
  suggestedLabel: string;
  currentLabel?: string;
  selected?: string[];
}) {
  // The form is replaced by the computer's details once it is approved, so the toast must not wait for it.
  const register = action;
  return (
    <ActionForm action={register} className="grid gap-5">
      <KeepValuesAfterSubmit />
      <ClientDetailsInput />
      <Field
        label="Name for this computer"
        name="label"
        required
        hint="A name staff will recognise, for example the desk it sits on."
        className="max-w-md"
      >
        <Input name="label" defaultValue={currentLabel ?? suggestedLabel} maxLength={60} placeholder="For example, Office PC 1" autoComplete="off" />
      </Field>
      <EmployeePicker employees={employees} selected={selected} />
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton pendingLabel="Registering">
          <MonitorCheck aria-hidden="true" />
          Register this computer
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

export type DeviceFormValues = { id: string; label: string; assignedUids: string[]; requestedByName: string; system: string };

/** The approve dialog for a computer waiting for approval. */
export function ApproveDeviceButton({
  action,
  device,
  employees,
}: {
  action: Action;
  device: DeviceFormValues & { requestedBy: string | null };
  employees: EmployeeOption[];
}) {
  // Pre-tick the employee who asked, which is the usual answer.
  const selected = device.assignedUids.length ? device.assignedUids : device.requestedBy ? [device.requestedBy] : [];
  // An approved computer leaves the waiting list, taking this dialog with it.
  const approve = action;
  return (
    <Modal
      wide
      size="sm"
      variant="accent"
      title="Approve this computer"
      description={`${device.system}${device.requestedByName ? `, requested by ${device.requestedByName}` : ""}.`}
      trigger={
        <>
          <CircleCheck aria-hidden="true" />
          Approve
        </>
      }
    >
      {(close) => (
        <ActionForm action={approve} onSuccess={close} className="grid gap-5">
          <KeepValuesAfterSubmit />
          <input type="hidden" name="deviceId" value={device.id} />
          <Field label="Name for this computer" name="label" required hint="For example, Office PC 2 or Reception laptop.">
            <Input name="label" defaultValue={suggestName(device)} maxLength={60} autoComplete="off" />
          </Field>
          <EmployeePicker employees={employees} selected={selected} />
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={close} className="h-10 rounded-xl px-4 text-sm font-semibold text-navy hover:bg-navy/5">
              Cancel
            </button>
            <SubmitButton variant="accent" pendingLabel="Approving">
              Approve computer
            </SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}

/** Rename an office computer or change who may use it. */
export function EditDeviceButton({ action, device, employees }: { action: Action; device: DeviceFormValues; employees: EmployeeOption[] }) {
  const save = action;
  return (
    <Modal
      wide
      size="sm"
      variant="secondary"
      title="Edit office computer"
      description={device.system}
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
          <input type="hidden" name="deviceId" value={device.id} />
          <Field label="Name for this computer" name="label" required>
            <Input name="label" defaultValue={device.label} maxLength={60} autoComplete="off" />
          </Field>
          <EmployeePicker employees={employees} selected={device.assignedUids} />
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={close} className="h-10 rounded-xl px-4 text-sm font-semibold text-navy hover:bg-navy/5">
              Cancel
            </button>
            <SubmitButton pendingLabel="Saving">Save changes</SubmitButton>
          </div>
        </ActionForm>
      )}
    </Modal>
  );
}

/** Computers start life named "Chrome on Windows"; suggest something friendlier. */
function suggestName(device: DeviceFormValues) {
  if (device.label && !device.label.includes(" on ")) return device.label;
  return device.requestedByName ? `${device.requestedByName}'s office computer` : "Office computer";
}
