"use client";

import { BookOpen, HeartPulse, Phone } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import type { EmploymentType } from "@/lib/constants";

/*
 * Field groups shared by My profile (the fields a person may change about
 * themselves) and the administrator's staff forms. Names match
 * selfProfileSchema and staffProfileSchema in lib/validation.
 */

export type ProfileFormValues = {
  displayName: string;
  email: string;
  jobTitle: string;
  department: string;
  staffNumber: string;
  employmentType: EmploymentType;
  startDate: string | null;
  phone: string;
  location: string;
  bio: string;
  specialisations: string[];
  qualifications: string;
  emergencyContact: { name: string; phone: string; relationship: string };
  targets: { monthlyAssignments: number; weeklyHours: number };
};

export type SelfProfileValues = Pick<ProfileFormValues, "phone" | "location" | "bio" | "specialisations" | "qualifications" | "emergencyContact">;

export function ContactFieldsCard({
  values,
  description = "How colleagues and the office can reach you.",
}: {
  values: Pick<SelfProfileValues, "phone" | "location">;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader icon={<Phone aria-hidden="true" />} title="Contact" description={description} />
      <CardBody className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" hint="Include the country code, for example +260 97 123 4567.">
          <Input name="phone" type="tel" autoComplete="tel" defaultValue={values.phone} maxLength={40} />
        </Field>
        <Field label="Location" name="location" hint="Town or office, for example Lusaka.">
          <Input name="location" autoComplete="address-level2" defaultValue={values.location} maxLength={120} />
        </Field>
      </CardBody>
    </Card>
  );
}

export function BackgroundFieldsCard({ values, title = "Expertise and background" }: { values: Pick<SelfProfileValues, "bio" | "specialisations" | "qualifications">; title?: string }) {
  return (
    <Card>
      <CardHeader icon={<BookOpen aria-hidden="true" />} title={title} description="Shown on the profile so the right work reaches the right person." />
      <CardBody className="grid gap-5">
        <Field label="Specialisations" name="specialisations" hint="Separate with commas, for example Survey design, SPSS, NVivo.">
          <Input name="specialisations" defaultValue={values.specialisations.join(", ")} maxLength={600} />
        </Field>
        <Field label="Qualifications" name="qualifications" hint="Degrees, certificates and professional memberships, one per line.">
          <Textarea name="qualifications" rows={3} defaultValue={values.qualifications} maxLength={2000} />
        </Field>
        <Field label="About" name="bio" hint="A short professional summary, up to 1,500 characters.">
          <Textarea name="bio" rows={4} defaultValue={values.bio} maxLength={1500} />
        </Field>
      </CardBody>
    </Card>
  );
}

export function EmergencyFieldsCard({ values }: { values: Pick<SelfProfileValues, "emergencyContact"> }) {
  return (
    <Card>
      <CardHeader icon={<HeartPulse aria-hidden="true" />} title="Emergency contact" description="Kept private to the person and the administrator." />
      <CardBody className="grid gap-5 sm:grid-cols-3">
        <Field label="Name" name="emergencyName">
          <Input name="emergencyName" defaultValue={values.emergencyContact.name} maxLength={120} />
        </Field>
        <Field label="Relationship" name="emergencyRelationship">
          <Input name="emergencyRelationship" defaultValue={values.emergencyContact.relationship} maxLength={60} placeholder="For example, spouse" />
        </Field>
        <Field label="Phone" name="emergencyPhone">
          <Input name="emergencyPhone" type="tel" defaultValue={values.emergencyContact.phone} maxLength={40} />
        </Field>
      </CardBody>
    </Card>
  );
}
