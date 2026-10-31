"use client";

import Link from "next/link";
import { Building, MapPin, NotebookPen, Save, UserRound } from "lucide-react";
import { ActionForm, Field, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { CLIENT_TYPES, SECTORS, type ClientType } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export type ClientFormValues = {
  name: string;
  type: ClientType;
  sector: string;
  contactName: string;
  email: string;
  phone: string;
  institution: string;
  address: string;
  notes: string;
};

/** Create or edit a client record. Field names match clientSchema in lib/validation. */
export function ClientForm({
  action,
  values,
  id,
  mode,
  cancelHref,
}: {
  action: Action;
  values: ClientFormValues;
  id?: string;
  mode: "create" | "edit";
  cancelHref: string;
}) {
  // Keep a sector saved before the list changed selectable.
  const sectors: string[] = values.sector && !(SECTORS as readonly string[]).includes(values.sector) ? [...SECTORS, values.sector] : [...SECTORS];
  return (
    <ActionForm action={action} className="space-y-5">
      <KeepValuesAfterSubmit />
      {id && <input type="hidden" name="id" value={id} />}

      <Card>
        <CardHeader icon={<Building aria-hidden="true" />} title="Client" description="Who the work is for. Students and academics are clients too." />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field label="Client name" name="name" required className="sm:col-span-2" hint="An organisation, department or the person's full name.">
            <Input name="name" defaultValue={values.name} maxLength={160} placeholder="For example, Zambezi Beverages Ltd" />
          </Field>
          <Field label="Type of client" name="type" required>
            <Select name="type" defaultValue={values.type}>
              {CLIENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sector" name="sector">
            <Select name="sector" defaultValue={values.sector}>
              <option value="">Choose a sector</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </Select>
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<UserRound aria-hidden="true" />} title="Main contact" description="The person we deal with day to day." />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field label="Contact name" name="contactName" className="sm:col-span-2">
            <Input name="contactName" defaultValue={values.contactName} maxLength={120} autoComplete="off" />
          </Field>
          <Field label="Email address" name="email">
            <Input name="email" type="email" defaultValue={values.email} maxLength={200} autoComplete="off" />
          </Field>
          <Field label="Phone" name="phone" hint="Include the country code, for example +260 211 000 111.">
            <Input name="phone" type="tel" defaultValue={values.phone} maxLength={40} autoComplete="off" />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<MapPin aria-hidden="true" />} title="Institution and address" />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field label="Institution" name="institution" hint="For students and academics: the university and school or department.">
            <Input name="institution" defaultValue={values.institution} maxLength={160} />
          </Field>
          <Field label="Address" name="address" hint="Street, building or town.">
            <Input name="address" defaultValue={values.address} maxLength={300} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<NotebookPen aria-hidden="true" />} title="Notes" description="Anything the team should know, such as reporting standards or billing arrangements." />
        <CardBody>
          <Field label="Notes" name="notes">
            <Textarea name="notes" rows={4} defaultValue={values.notes} maxLength={4000} />
          </Field>
        </CardBody>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonClasses({ variant: "ghost" })}>
          Cancel
        </Link>
        <SubmitButton pendingLabel="Saving">
          <Save aria-hidden="true" />
          {mode === "create" ? "Add client" : "Save changes"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
