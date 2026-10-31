"use client";

import Link from "next/link";
import { BriefcaseBusiness, KeyRound, Save, Target, UserPlus } from "lucide-react";
import { ActionForm, Field, Input, Select, SubmitButton } from "@/components/ui/form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { buttonClasses } from "@/components/ui/button";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { PasswordInput } from "@/components/profile/password-input";
import { BackgroundFieldsCard, ContactFieldsCard, EmergencyFieldsCard, type ProfileFormValues } from "@/components/profile/profile-fields";
import { EMPLOYMENT_TYPES } from "@/lib/constants";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/**
 * The administrator's form for a staff profile. In "create" mode it also asks
 * for the sign-in email and an initial password (with a generator), and the
 * action creates the login; in "edit" mode it updates the profile only.
 */
export function StaffProfileForm({
  mode,
  action,
  values,
  uid,
  cancelHref,
}: {
  mode: "create" | "edit";
  action: Action;
  values: ProfileFormValues;
  uid?: string;
  cancelHref: string;
}) {
  const creating = mode === "create";
  return (
    <ActionForm action={action} className="space-y-5">
      <KeepValuesAfterSubmit />
      {uid && <input type="hidden" name="uid" value={uid} />}

      {creating && (
        <Card>
          <CardHeader
            icon={<KeyRound aria-hidden="true" />}
            title="Sign-in details"
            description="The employee signs in with this email address and password. You hand both over in person."
          />
          <CardBody className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" name="displayName" required>
                <Input name="displayName" autoComplete="off" defaultValue={values.displayName} maxLength={80} placeholder="For example, Chanda Mwila" />
              </Field>
              <Field label="Email address" name="email" required hint="Their work email. It is also their sign-in name.">
                <Input name="email" type="email" autoComplete="off" defaultValue={values.email} maxLength={200} placeholder="name@primeresearch.co.zm" />
              </Field>
            </div>
            <PasswordInput
              name="password"
              label="Initial password"
              generate
              hint="At least 10 characters with letters and numbers. Use Generate for a strong one; they can change it from My profile."
            />
            <Callout tone="info" title="Office computer lock">
              When the office computer lock is on, the first office computer this person signs in on becomes their registered computer.
              You can unlock it later from their profile.
            </Callout>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader icon={<BriefcaseBusiness aria-hidden="true" />} title="Role and employment" description="How the person appears across the system." />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          {!creating && (
            <Field label="Full name" name="displayName" required className="sm:col-span-2">
              <Input name="displayName" defaultValue={values.displayName} maxLength={80} />
            </Field>
          )}
          <Field label="Job title" name="jobTitle">
            <Input name="jobTitle" defaultValue={values.jobTitle} maxLength={80} placeholder="For example, Research Analyst" />
          </Field>
          <Field label="Department" name="department">
            <Input name="department" defaultValue={values.department} maxLength={80} placeholder="For example, Corporate research" />
          </Field>
          <Field label="Staff number" name="staffNumber">
            <Input name="staffNumber" defaultValue={values.staffNumber} maxLength={40} className="tabular" />
          </Field>
          <Field label="Employment type" name="employmentType" required>
            <Select name="employmentType" defaultValue={values.employmentType}>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Start date" name="startDate">
            <Input name="startDate" type="date" defaultValue={values.startDate ?? ""} />
          </Field>
        </CardBody>
      </Card>

      <ContactFieldsCard values={values} description="How colleagues and the office can reach them." />
      <BackgroundFieldsCard values={values} />
      <EmergencyFieldsCard values={values} />

      <Card>
        <CardHeader
          icon={<Target aria-hidden="true" />}
          title="Targets"
          description="Throughput and hours in the performance score are measured against these."
        />
        <CardBody className="grid gap-5 sm:grid-cols-2">
          <Field label="Assignments a month" name="monthlyAssignments" required hint="Completed assignments expected in a typical month.">
            <Input name="monthlyAssignments" type="number" inputMode="numeric" min={0} max={100} step={1} defaultValue={values.targets.monthlyAssignments} />
          </Field>
          <Field label="Hours a week" name="weeklyHours" required hint="Hours to log on the timesheet in a full week.">
            <Input name="weeklyHours" type="number" inputMode="decimal" min={0} max={80} step={0.5} defaultValue={values.targets.weeklyHours} />
          </Field>
        </CardBody>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonClasses({ variant: "ghost" })}>
          Cancel
        </Link>
        <SubmitButton pendingLabel={creating ? "Creating account" : "Saving"}>
          {creating ? <UserPlus aria-hidden="true" /> : <Save aria-hidden="true" />}
          {creating ? "Create employee account" : "Save changes"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
