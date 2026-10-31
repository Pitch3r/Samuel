"use client";

import Link from "next/link";
import { useState } from "react";
import { Briefcase, Building2, CalendarDays, CircleCheck, ClipboardList, GraduationCap, ListChecks, Users, Wallet } from "lucide-react";
import { ActionForm, Field, Input, Select, SubmitButton, Textarea, useFieldError } from "@/components/ui/form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import {
  ACADEMIC_LEVELS,
  CLIENT_TYPES,
  PAYMENT_LABELS,
  PAYMENT_STATUSES,
  PRIORITIES,
  PRIORITY_LABELS,
  TRACKS,
  TRACK_DESCRIPTIONS,
  TRACK_LABELS,
  type AcademicLevel,
  type ClientType,
  type PaymentStatus,
  type Priority,
  type Track,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

export type FormCategory = { id: string; name: string; track: Track; description: string; active: boolean };
export type FormClient = { id: string; name: string; type: ClientType };
export type FormPerson = { uid: string; name: string; jobTitle: string; isAdmin: boolean; photoVersion: string | null };

export type AssignmentFormDefaults = {
  title: string;
  description: string;
  track: Track;
  categoryId: string;
  academicLevel: AcademicLevel | null;
  clientId: string | null;
  clientName: string;
  assigneeIds: string[];
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  fee: number | null;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  tags: string[];
};

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

function TrackPicker({ track, onChange }: { track: Track; onChange: (track: Track) => void }) {
  const error = useFieldError("track");
  return (
    <fieldset>
      <legend className="field-label">
        Research track
        <span className="text-danger" aria-hidden="true">
          {" "}
          *
        </span>
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {TRACKS.map((option) => {
          const selected = option === track;
          const Icon = option === "academic" ? GraduationCap : Briefcase;
          return (
            <label
              key={option}
              className={cn(
                "relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-[border-color,background-color,box-shadow] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue",
                selected ? "border-blue bg-blue-tint/60 ring-1 ring-blue" : "border-mist bg-white hover:border-slate/40",
              )}
            >
              <input type="radio" name="track" value={option} checked={selected} onChange={() => onChange(option)} className="sr-only" />
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl ring-1", selected ? "bg-blue text-white ring-blue" : "bg-cloud text-navy ring-mist")}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 pr-6">
                <span className="block font-semibold text-navy">{TRACK_LABELS[option]}</span>
                <span className="mt-0.5 block text-sm text-slate">{TRACK_DESCRIPTIONS[option]}</span>
              </span>
              {selected && <CircleCheck className="absolute top-3.5 right-3.5 size-5 text-blue" aria-hidden="true" />}
            </label>
          );
        })}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

function AssigneePicker({ people, defaults }: { people: FormPerson[]; defaults: string[] }) {
  const error = useFieldError("assigneeIds");
  return (
    <fieldset aria-describedby={error ? "assigneeIds-error" : "assigneeIds-hint"}>
      <legend className="field-label">
        Assigned to
        <span className="text-danger" aria-hidden="true">
          {" "}
          *
        </span>
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {people.map((person) => (
          <label
            key={person.uid}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-mist bg-white px-3.5 py-3 transition-colors hover:border-slate/40 has-checked:border-blue has-checked:bg-blue-tint/60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue"
          >
            <input
              type="checkbox"
              name="assigneeIds"
              value={person.uid}
              defaultChecked={defaults.includes(person.uid)}
              className="size-4 shrink-0 rounded border-mist accent-blue"
            />
            <Avatar name={person.name} uid={person.uid} photoVersion={person.photoVersion} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-navy">{person.name}</span>
              <span className="block truncate text-xs text-slate">{person.isAdmin ? "Administrator" : person.jobTitle || "Employee"}</span>
            </span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="field-error" id="assigneeIds-error">
          {error}
        </p>
      ) : (
        <p className="field-hint" id="assigneeIds-hint">
          Everyone selected can see the assignment, update its progress and is notified about changes.
        </p>
      )}
    </fieldset>
  );
}

/** "12,500" for an amount, which the server reads back without the commas. */
const moneyText = (value: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value);

function MoneyInput({ name, defaultValue, placeholder }: { name: string; defaultValue: number | null; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-sm font-semibold text-slate" aria-hidden="true">
        K
      </span>
      <Input name={name} inputMode="decimal" autoComplete="off" defaultValue={defaultValue === null ? "" : moneyText(defaultValue)} placeholder={placeholder} className="tabular pl-8" />
    </div>
  );
}

/** Create and edit form for an assignment. Only the administrator sees it. */
export function AssignmentForm({
  mode,
  action,
  assignmentId,
  defaults,
  categories,
  clients,
  people,
  cancelHref,
  integrityNote,
}: {
  mode: "create" | "edit";
  action: Action;
  assignmentId?: string;
  defaults: AssignmentFormDefaults;
  categories: FormCategory[];
  clients: FormClient[];
  people: FormPerson[];
  cancelHref: string;
  integrityNote: string;
}) {
  const [track, setTrack] = useState<Track>(defaults.track);
  const [categoryId, setCategoryId] = useState(defaults.categoryId);
  // A client record that no longer exists falls back to the typed name.
  const knownClient = defaults.clientId && clients.some((client) => client.id === defaults.clientId) ? defaults.clientId : "";
  const [clientId, setClientId] = useState(knownClient);

  // Retired categories stay selectable only for the assignment that already uses them.
  const trackCategories = categories.filter((category) => category.track === track && (category.active || category.id === defaults.categoryId));
  const category = trackCategories.find((item) => item.id === categoryId);
  const clientTypes = CLIENT_TYPES.filter((type) => clients.some((client) => client.type === type));

  function changeTrack(next: Track) {
    setTrack(next);
    if (!categories.some((item) => item.id === categoryId && item.track === next)) setCategoryId("");
  }

  return (
    <ActionForm action={action} className="mx-auto max-w-4xl space-y-6">
      <KeepValuesAfterSubmit />
      {assignmentId && <input type="hidden" name="assignmentId" value={assignmentId} />}

      <Card>
        <CardHeader icon={<ClipboardList aria-hidden="true" />} title="The work" description="What the assignment is and which service line it belongs to." />
        <CardBody className="space-y-5">
          <Field label="Title" name="title" required hint="A short, recognisable name, for example: Customer satisfaction survey, Q4 2026.">
            <Input name="title" defaultValue={defaults.title} maxLength={160} autoComplete="off" required />
          </Field>
          <TrackPicker track={track} onChange={changeTrack} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" name="categoryId" required hint={category?.description ?? "The service line this work falls under."}>
              <Select name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
                <option value="">Choose a category</option>
                {trackCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.active ? "" : " (retired)"}
                  </option>
                ))}
              </Select>
            </Field>
            {track === "academic" && (
              <Field label="Academic level" name="academicLevel" hint="The level of study or the type of academic client.">
                <Select name="academicLevel" defaultValue={defaults.academicLevel ?? ""}>
                  <option value="">Not specified</option>
                  {ACADEMIC_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
          {track === "academic" && (
            <Callout title="Academic integrity">
              {integrityNote} Describe the support as teaching, advice, analysis or review.
            </Callout>
          )}
          <Field label="Brief" name="description" hint="Scope, deliverables, methods and anything the team should know. Line breaks are kept.">
            <Textarea name="description" defaultValue={defaults.description} rows={6} maxLength={5000} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<Building2 aria-hidden="true" />} title="Client" description="Who the work is for." />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Client record"
            name="clientId"
            hint={
              <>
                Pick a saved client, or choose &ldquo;Not in the client list&rdquo; and type a name.{" "}
                <Link href="/clients" className="font-semibold text-blue hover:underline">
                  Manage clients
                </Link>
              </>
            }
          >
            <Select name="clientId" value={clientId} onChange={(event) => setClientId(event.target.value)}>
              <option value="">Not in the client list</option>
              {clientTypes.map((type) => (
                <optgroup key={type} label={type}>
                  {clients
                    .filter((client) => client.type === type)
                    .map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Select>
          </Field>
          {!clientId && (
            <Field label="Client name" name="clientName" required hint="For one-off clients, such as an individual student.">
              <Input name="clientName" defaultValue={knownClient ? "" : defaults.clientName} maxLength={160} placeholder="For example: Mwila Banda, MSc student" />
            </Field>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<Users aria-hidden="true" />} title="Team" description="The people doing the work. You can include yourself." />
        <CardBody>
          <AssigneePicker people={people} defaults={defaults.assigneeIds} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<CalendarDays aria-hidden="true" />} title="Schedule and effort" description="Dates drive due reminders, the calendar and on-time performance." />
        <CardBody className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Priority" name="priority" required>
            <Select name="priority" defaultValue={defaults.priority}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start date" name="startDate">
            <Input name="startDate" type="date" defaultValue={defaults.startDate ?? ""} />
          </Field>
          <Field label="Due date" name="dueDate">
            <Input name="dueDate" type="date" defaultValue={defaults.dueDate ?? ""} />
          </Field>
          <Field label="Estimated hours" name="estimatedHours" hint="Compared with logged time.">
            <Input name="estimatedHours" type="number" min={0} step={0.5} inputMode="decimal" defaultValue={defaults.estimatedHours ?? ""} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<Wallet aria-hidden="true" />} title="Fee and payment" description="In Zambian kwacha. Only the administrator sees fees and payments." />
        <CardBody className="grid gap-5 sm:grid-cols-3">
          <Field label="Fee" name="fee" hint="Leave blank if there is no fee.">
            <MoneyInput name="fee" defaultValue={defaults.fee} placeholder="0" />
          </Field>
          <Field label="Payment status" name="paymentStatus">
            <Select name="paymentStatus" defaultValue={defaults.paymentStatus}>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {PAYMENT_LABELS[status]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Amount paid" name="amountPaid">
            <MoneyInput name="amountPaid" defaultValue={defaults.amountPaid || null} placeholder="0" />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          icon={<ListChecks aria-hidden="true" />}
          title={mode === "create" ? "Tags and milestones" : "Tags"}
          description={mode === "create" ? "Optional. Milestones drive progress as they are ticked off." : "Milestones are managed on the assignment page."}
        />
        <CardBody className="space-y-5">
          <Field label="Tags" name="tags" hint="Separate tags with commas, for example: baseline, Copperbelt, SPSS.">
            <Input name="tags" defaultValue={defaults.tags.join(", ")} autoComplete="off" />
          </Field>
          {mode === "create" && (
            <Field
              label="Milestones"
              name="milestones"
              hint="One per line. Add a due date after a vertical bar, for example: Inception report | 2026-11-20."
            >
              <Textarea
                name="milestones"
                rows={5}
                maxLength={4000}
                placeholder={"Inception report | 2026-11-20\nData collection complete | 2026-12-04\nFinal report"}
                className="font-mono text-sm"
              />
            </Field>
          )}
        </CardBody>
      </Card>

      <div className="sticky bottom-3 z-10 flex items-center justify-between gap-3 rounded-card border border-mist bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:bottom-4 sm:px-5">
        <p className="hidden text-sm text-slate sm:block">
          Fields marked <span className="text-danger">*</span> are required.
          {mode === "create" ? " Everyone assigned is notified." : ""}
        </p>
        <div className="flex w-full gap-2 sm:w-auto">
          <Link href={cancelHref} className={buttonClasses({ variant: "secondary", className: "flex-1 sm:flex-none" })}>
            Cancel
          </Link>
          <SubmitButton pendingLabel={mode === "create" ? "Creating" : "Saving"} className="flex-[2] sm:flex-none">
            {mode === "create" ? "Create assignment" : "Save changes"}
          </SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}
