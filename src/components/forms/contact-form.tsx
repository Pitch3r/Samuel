"use client";

import Link from "next/link";
import { useState } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { FormSuccess } from "@/components/forms/form-success";
import { useFormSubmit } from "@/components/forms/use-form-submit";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, FieldError, Honeypot, Input, Select, Textarea } from "@/components/ui/form-controls";
import { contactSchema, enquiryTypes } from "@/lib/validation";

const initial = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  enquiryType: "" as string,
  message: "",
  consent: false,
};

export function ContactForm({ defaultType }: { defaultType?: string }) {
  const [values, setValues] = useState({
    ...initial,
    enquiryType: defaultType && (enquiryTypes as readonly string[]).includes(defaultType) ? defaultType : "",
  });
  const [trap, setTrap] = useState("");
  const form = useFormSubmit("/api/contact", contactSchema);

  const set = (key: keyof typeof initial) => (value: string | boolean) => {
    setValues((current) => ({ ...current, [key]: value }));
    form.clearError(key);
  };

  if (form.status === "success") {
    return (
      <FormSuccess
        title="Thank you. Your message is with us."
        reference={form.reference}
        message="A researcher will reply within one working day. We have also sent a copy of your message to your email address."
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
        void form.submit({ ...values, company_website: trap });
      }}
      className="relative space-y-6 rounded-[1.75rem] border border-mist bg-white p-6 shadow-card sm:p-9"
      aria-describedby="contact-form-note"
    >
      <Honeypot value={trap} onChange={setTrap} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required error={e.name}>
          <Input id="name" name="name" autoComplete="name" value={values.name} onChange={(event) => set("name")(event.target.value)} invalid={Boolean(e.name)} />
        </Field>
        <Field label="Email address" htmlFor="email" required error={e.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => set("email")(event.target.value)}
            invalid={Boolean(e.email)}
          />
        </Field>
        <Field label="Phone or WhatsApp" htmlFor="phone" optional error={e.phone}>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => set("phone")(event.target.value)} invalid={Boolean(e.phone)} />
        </Field>
        <Field label="Organisation" htmlFor="organisation" optional error={e.organisation}>
          <Input
            id="organisation"
            name="organisation"
            autoComplete="organization"
            value={values.organisation}
            onChange={(event) => set("organisation")(event.target.value)}
            invalid={Boolean(e.organisation)}
          />
        </Field>
      </div>
      <Field label="What is your enquiry about?" htmlFor="enquiryType" required error={e.enquiryType}>
        <Select
          id="enquiryType"
          name="enquiryType"
          value={values.enquiryType}
          onChange={(event) => set("enquiryType")(event.target.value)}
          options={enquiryTypes}
          placeholder="Choose one"
          invalid={Boolean(e.enquiryType)}
        />
      </Field>
      <Field label="Your message" htmlFor="message" required error={e.message} hint="The decision you face, your timeline and anything else that would help us respond well.">
        <Textarea id="message" name="message" rows={6} value={values.message} onChange={(event) => set("message")(event.target.value)} invalid={Boolean(e.message)} />
      </Field>
      <div data-field="consent">
        <Checkbox
          id="consent"
          checked={values.consent}
          onChange={(checked) => set("consent")(checked)}
          invalid={Boolean(e.consent)}
          label={
            <>
              I agree that Primeresearch may use these details to respond to my enquiry, as described in the{" "}
              <Link href="/privacy" className="font-semibold text-blue underline-offset-2 hover:underline">
                privacy notice
              </Link>
              .
            </>
          }
        />
        <div className="mt-2 pl-8">
          <FieldError id="consent-error" message={e.consent} />
        </div>
      </div>

      {form.status === "error" && form.message && !Object.keys(e).length && (
        <p role="alert" className="rounded-xl bg-danger-tint px-4 py-3 text-sm text-danger">
          {form.message}
        </p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="contact-form-note" className="text-xs text-slate">
          We reply within one working day. Fields marked * are required.
        </p>
        <Button type="submit" size="lg" disabled={form.status === "submitting"}>
          {form.status === "submitting" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="size-4" aria-hidden="true" />
          )}
          {form.status === "submitting" ? "Sending" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
