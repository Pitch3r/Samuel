"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { FormSuccess } from "@/components/forms/form-success";
import { useFormSubmit } from "@/components/forms/use-form-submit";
import { Button } from "@/components/ui/button";
import { Checkbox, ChoiceChips, Field, FieldError, Honeypot, Input, Select, Textarea } from "@/components/ui/form-controls";
import { careerRoleOptions, educationLevels } from "@/content/careers";
import { fieldLanguages, provinces } from "@/content/company";
import { careersSchema, experienceOptions } from "@/lib/validation";

const initial = {
  role: "" as string,
  provinces: [] as string[],
  languages: [] as string[],
  education: "" as string,
  experience: "" as string,
  capiExperience: false,
  cvUrl: "",
  statement: "",
  name: "",
  email: "",
  phone: "",
  location: "",
  consent: false,
};

export function CareersForm() {
  const [values, setValues] = useState(initial);
  const [trap, setTrap] = useState("");
  const form = useFormSubmit("/api/careers", careersSchema);

  const set = <K extends keyof typeof initial>(key: K) => (value: (typeof initial)[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    form.clearError(key);
  };

  if (form.status === "success") {
    return (
      <FormSuccess
        title="Thank you for applying."
        reference={form.reference}
        message="We review applications as new studies are planned and will contact you when there is a suitable opportunity in your area. There is no need to apply again."
      />
    );
  }

  const e = form.fieldErrors;

  return (
    <form
      noValidate
      onFocus={form.markStarted}
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit({ ...values, company_website: trap });
      }}
      className="relative space-y-7 rounded-[1.75rem] border border-mist bg-white p-6 shadow-card sm:p-9"
    >
      <Honeypot value={trap} onChange={setTrap} />
      <Field label="Role you are applying for" htmlFor="role" required error={e.role}>
        <Select id="role" name="role" value={values.role} onChange={(event) => set("role")(event.target.value)} options={careerRoleOptions} placeholder="Choose a role" invalid={Boolean(e.role)} />
      </Field>

      <div data-field="provinces" className="space-y-2.5">
        <p className="text-sm font-semibold text-navy">
          Provinces where you can work<span className="ml-0.5 text-blue">*</span>
        </p>
        <ChoiceChips name="Provinces" multiple options={provinces} value={values.provinces} onChange={(value) => set("provinces")(value as string[])} invalid={Boolean(e.provinces)} />
        <FieldError message={e.provinces} />
      </div>

      <div data-field="languages" className="space-y-2.5">
        <p className="text-sm font-semibold text-navy">
          Languages you can interview in<span className="ml-0.5 text-blue">*</span>
        </p>
        <ChoiceChips name="Languages" multiple options={fieldLanguages} value={values.languages} onChange={(value) => set("languages")(value as string[])} invalid={Boolean(e.languages)} />
        <FieldError message={e.languages} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Highest qualification" htmlFor="education" required error={e.education}>
          <Select
            id="education"
            name="education"
            value={values.education}
            onChange={(event) => set("education")(event.target.value)}
            options={educationLevels}
            placeholder="Choose one"
            invalid={Boolean(e.education)}
          />
        </Field>
        <Field label="Research or fieldwork experience" htmlFor="experience" required error={e.experience}>
          <Select
            id="experience"
            name="experience"
            value={values.experience}
            onChange={(event) => set("experience")(event.target.value)}
            options={experienceOptions}
            placeholder="Choose one"
            invalid={Boolean(e.experience)}
          />
        </Field>
      </div>

      <Checkbox
        checked={values.capiExperience}
        onChange={(checked) => set("capiExperience")(checked)}
        label="I have used tablet survey tools such as ODK, KoboToolbox or SurveyCTO."
      />

      <Field
        label="Tell us about your experience"
        htmlFor="statement"
        required
        error={e.statement}
        hint="Studies you have worked on, your role, and anything that makes you a strong interviewer or analyst."
      >
        <Textarea id="statement" name="statement" rows={5} value={values.statement} onChange={(event) => set("statement")(event.target.value)} invalid={Boolean(e.statement)} />
      </Field>

      <Field label="Link to your CV or LinkedIn profile" htmlFor="cvUrl" optional error={e.cvUrl} hint="For example, a Google Drive or LinkedIn link.">
        <Input id="cvUrl" name="cvUrl" type="url" placeholder="https://" value={values.cvUrl} onChange={(event) => set("cvUrl")(event.target.value)} invalid={Boolean(e.cvUrl)} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" htmlFor="c-name" required error={e.name}>
          <Input id="c-name" name="name" autoComplete="name" value={values.name} onChange={(event) => set("name")(event.target.value)} invalid={Boolean(e.name)} />
        </Field>
        <Field label="Email address" htmlFor="c-email" required error={e.email}>
          <Input id="c-email" name="email" type="email" autoComplete="email" value={values.email} onChange={(event) => set("email")(event.target.value)} invalid={Boolean(e.email)} />
        </Field>
        <Field label="Phone or WhatsApp" htmlFor="c-phone" required error={e.phone}>
          <Input id="c-phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => set("phone")(event.target.value)} invalid={Boolean(e.phone)} />
        </Field>
        <Field label="Town where you live" htmlFor="c-location" optional error={e.location}>
          <Input id="c-location" name="location" autoComplete="address-level2" value={values.location} onChange={(event) => set("location")(event.target.value)} invalid={Boolean(e.location)} />
        </Field>
      </div>

      <div data-field="consent">
        <Checkbox
          checked={values.consent}
          onChange={(checked) => set("consent")(checked)}
          invalid={Boolean(e.consent)}
          label={
            <>
              I agree that Primeresearch may keep these details to consider me for future studies, as described in the{" "}
              <Link href="/privacy" className="font-semibold text-blue hover:underline">
                privacy notice
              </Link>
              .
            </>
          }
        />
        <div className="mt-2 pl-8">
          <FieldError message={e.consent} />
        </div>
      </div>

      {form.status === "error" && form.message && !Object.keys(e).length && (
        <p role="alert" className="rounded-xl bg-danger-tint px-4 py-3 text-sm text-danger">
          {form.message}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={form.status === "submitting"}>
          {form.status === "submitting" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
          {form.status === "submitting" ? "Sending" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
