"use client";

import Link from "next/link";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { FormSuccess } from "@/components/forms/form-success";
import { useFormSubmit } from "@/components/forms/use-form-submit";
import { Button } from "@/components/ui/button";
import { Checkbox, ChoiceChips, Field, FieldError, Honeypot, Input, Select, Textarea } from "@/components/ui/form-controls";
import { courses } from "@/content/training";
import { trainingFormatOptions, trainingSchema } from "@/lib/validation";

export type TrainingFormHandle = { selectCourse: (slug: string) => void };

const courseOptions = [
  ...courses.map((course) => ({ value: course.slug, label: course.title })),
  { value: "custom", label: "A tailored programme for my organisation" },
];

const initial = {
  course: "",
  format: "" as string,
  participants: "" as string | number,
  preferredDates: "",
  name: "",
  email: "",
  phone: "",
  organisation: "",
  message: "",
  consent: false,
};

export const TrainingForm = forwardRef<TrainingFormHandle>(function TrainingForm(_, ref) {
  const [values, setValues] = useState(initial);
  const [trap, setTrap] = useState("");
  const form = useFormSubmit("/api/training", trainingSchema);
  const courseRef = useRef<HTMLSelectElement>(null);

  useImperativeHandle(ref, () => ({
    selectCourse(slug: string) {
      setValues((current) => ({ ...current, course: slug }));
      form.clearError("course");
      requestAnimationFrame(() => courseRef.current?.focus({ preventScroll: true }));
    },
  }));

  const set = (key: keyof typeof initial) => (value: string | boolean | number) => {
    setValues((current) => ({ ...current, [key]: value }));
    form.clearError(key);
  };

  if (form.status === "success") {
    return (
      <FormSuccess
        title="Thank you. We will be in touch."
        reference={form.reference}
        message="We will reply within one working day with dates, a course outline and a quote for your group."
        resetLabel="Make another enquiry"
        onReset={() => {
          setValues(initial);
          form.reset();
        }}
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
        void form.submit({ ...values, participants: values.participants === "" ? undefined : Number(values.participants), company_website: trap });
      }}
      className="relative space-y-6 rounded-[1.75rem] border border-mist bg-white p-6 shadow-card sm:p-9"
    >
      <Honeypot value={trap} onChange={setTrap} />
      <div className="grid gap-6 sm:grid-cols-[1.4fr_0.6fr]">
        <Field label="Course" htmlFor="course" required error={e.course}>
          <Select
            ref={courseRef}
            id="course"
            name="course"
            value={values.course}
            onChange={(event) => set("course")(event.target.value)}
            options={courseOptions}
            placeholder="Choose a course"
            invalid={Boolean(e.course)}
          />
        </Field>
        <Field label="Participants" htmlFor="participants" required error={e.participants}>
          <Input
            id="participants"
            name="participants"
            type="number"
            min={1}
            max={500}
            inputMode="numeric"
            value={values.participants}
            onChange={(event) => set("participants")(event.target.value)}
            invalid={Boolean(e.participants)}
          />
        </Field>
      </div>
      <div data-field="format" className="space-y-2">
        <p className="text-sm font-semibold text-navy">
          Preferred format<span className="ml-0.5 text-blue">*</span>
        </p>
        <ChoiceChips name="Preferred format" options={trainingFormatOptions} value={values.format} onChange={(value) => set("format")(value as string)} invalid={Boolean(e.format)} />
        <FieldError message={e.format} />
      </div>
      <Field label="Preferred dates" htmlFor="preferredDates" optional error={e.preferredDates}>
        <Input
          id="preferredDates"
          name="preferredDates"
          placeholder="For example, the second half of November"
          value={values.preferredDates}
          onChange={(event) => set("preferredDates")(event.target.value)}
          invalid={Boolean(e.preferredDates)}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" htmlFor="t-name" required error={e.name}>
          <Input id="t-name" name="name" autoComplete="name" value={values.name} onChange={(event) => set("name")(event.target.value)} invalid={Boolean(e.name)} />
        </Field>
        <Field label="Email address" htmlFor="t-email" required error={e.email}>
          <Input id="t-email" name="email" type="email" autoComplete="email" value={values.email} onChange={(event) => set("email")(event.target.value)} invalid={Boolean(e.email)} />
        </Field>
        <Field label="Phone or WhatsApp" htmlFor="t-phone" optional error={e.phone}>
          <Input id="t-phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => set("phone")(event.target.value)} invalid={Boolean(e.phone)} />
        </Field>
        <Field label="Organisation" htmlFor="t-organisation" optional error={e.organisation}>
          <Input
            id="t-organisation"
            name="organisation"
            autoComplete="organization"
            value={values.organisation}
            onChange={(event) => set("organisation")(event.target.value)}
            invalid={Boolean(e.organisation)}
          />
        </Field>
      </div>
      <Field label="Anything else we should know?" htmlFor="t-message" optional error={e.message}>
        <Textarea id="t-message" name="message" rows={4} value={values.message} onChange={(event) => set("message")(event.target.value)} invalid={Boolean(e.message)} />
      </Field>
      <div data-field="consent">
        <Checkbox
          checked={values.consent}
          onChange={(checked) => set("consent")(checked)}
          invalid={Boolean(e.consent)}
          label={
            <>
              I agree that Primeresearch may use these details to respond, as described in the{" "}
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
          {form.status === "submitting" ? "Sending" : "Send training enquiry"}
        </Button>
      </div>
    </form>
  );
});
