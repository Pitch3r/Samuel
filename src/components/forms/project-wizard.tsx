"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Pencil, Send } from "lucide-react";
import { FormSuccess } from "@/components/forms/form-success";
import { useFormSubmit } from "@/components/forms/use-form-submit";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, ChoiceChips, Field, FieldError, Honeypot, Input, Textarea } from "@/components/ui/form-controls";
import { services } from "@/content/services";
import { studyGoals } from "@/content/study-finder";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  budgetOptions,
  clientTypes,
  fieldErrorsFrom,
  geographyOptions,
  proposalSchema,
  timelineOptions,
} from "@/lib/validation";

const STORAGE_KEY = "primeresearch:proposal-draft";
const EASE = [0.16, 1, 0.3, 1] as const;

type Values = {
  goal: string;
  services: string[];
  decision: string;
  audience: string;
  geography: string[];
  timeline: string;
  budget: string;
  clientType: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  role: string;
  details: string;
  consent: boolean;
};

const empty: Values = {
  goal: "",
  services: [],
  decision: "",
  audience: "",
  geography: [],
  timeline: "",
  budget: "",
  clientType: "",
  name: "",
  email: "",
  phone: "",
  organisation: "",
  role: "",
  details: "",
  consent: false,
};

const STEPS = [
  { title: "Your goal", fields: ["goal", "services"] },
  { title: "The decision", fields: ["decision", "audience"] },
  { title: "Scope", fields: ["geography", "timeline", "budget", "clientType"] },
  { title: "Your details", fields: ["name", "email", "phone", "organisation", "role", "details", "consent"] },
  { title: "Review", fields: [] },
] as const;

const OTHER_GOAL = "Something else";

function initialValues(initialGoal?: string, initialService?: string) {
  let next = { ...empty };
  let restored = false;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      next = { ...next, ...(JSON.parse(saved) as Partial<Values>), consent: false };
      restored = true;
    }
  } catch {
    // Storage can be unavailable (private mode); the wizard works without it.
  }
  const goal = studyGoals.find((item) => item.key === initialGoal);
  if (goal) next = { ...next, goal: goal.goal, services: Array.from(new Set([...next.services, goal.service])) };
  if (initialService && services.some((item) => item.slug === initialService)) {
    next = { ...next, services: Array.from(new Set([...next.services, initialService])) };
  }
  return { values: next, restored };
}

function toPayload(values: Values) {
  return { ...values, budget: values.budget || undefined };
}

export function ProjectWizard({ initialGoal, initialService }: { initialGoal?: string; initialService?: string }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  // Rendered client-only (see project-wizard-loader), so browser storage can seed the initial state.
  const [initial] = useState(() => initialValues(initialGoal, initialService));
  const [values, setValues] = useState<Values>(initial.values);
  const [trap, setTrap] = useState("");
  const [restored, setRestored] = useState(initial.restored);
  const form = useFormSubmit("/api/proposals");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Never store consent; ask for it on every submission.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...values, consent: false }));
    } catch {
      // Ignore storage errors.
    }
  }, [values]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    form.clearError(key);
  };

  const stepErrors = useMemo(() => {
    const result = proposalSchema.safeParse(toPayload(values));
    return result.success ? {} : fieldErrorsFrom(result.error);
  }, [values]);

  function goTo(target: number) {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function next() {
    const fields = STEPS[step].fields as readonly string[];
    const errors = Object.fromEntries(Object.entries(stepErrors).filter(([key]) => fields.includes(key)));
    if (Object.keys(errors).length) {
      form.setFieldErrors(errors);
      const first = Object.keys(errors)[0];
      requestAnimationFrame(() => {
        const element = document.getElementById(`pw-${first}`) ?? document.querySelector<HTMLElement>(`[data-field="${first}"] button, [data-field="${first}"] input`);
        element?.focus();
      });
      return;
    }
    form.setFieldErrors({});
    goTo(step + 1);
  }

  async function submit() {
    const result = await form.submit({ ...toPayload(values), company_website: trap });
    if (result?.ok) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors.
      }
    } else if (result && Object.keys(result.fieldErrors).length) {
      // Server reported field errors: send the visitor back to the first affected step.
      const errors = result.fieldErrors;
      const firstStep = STEPS.findIndex((s) => (s.fields as readonly string[]).some((field) => errors[field]));
      if (firstStep >= 0) goTo(firstStep);
    }
  }

  if (form.status === "success") {
    return (
      <FormSuccess
        title="Thank you. Your brief is with us."
        reference={form.reference}
        message="A researcher will review your brief and contact you within one working day to arrange a short scoping conversation. After that call we will send a written proposal with a clear method, workplan and transparent budget."
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/insights" variant="outline">
            Read our insights
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to the home page
          </ButtonLink>
        </div>
      </FormSuccess>
    );
  }

  const e = form.fieldErrors;
  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div ref={topRef} className="scroll-mt-28 rounded-[1.75rem] border border-mist bg-white shadow-card">
      <div className="border-b border-mist px-6 pt-6 pb-5 sm:px-9">
        <ol className="grid grid-cols-5 gap-2" aria-label="Progress">
          {STEPS.map((item, index) => (
            <li key={item.title}>
              <button
                type="button"
                disabled={index > step}
                onClick={() => index < step && goTo(index)}
                aria-current={index === step ? "step" : undefined}
                className="flex w-full flex-col gap-2 text-left disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex items-center gap-2 text-xs font-semibold",
                    index === step ? "text-navy" : index < step ? "text-blue" : "text-slate/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold",
                      index < step ? "bg-blue text-white" : index === step ? "bg-navy text-white" : "bg-cloud text-slate ring-1 ring-mist",
                    )}
                  >
                    {index < step ? <Check className="size-3" strokeWidth={3} aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="hidden truncate sm:inline">{item.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-cloud" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-blue" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: EASE }} />
        </div>
        <p className="mt-3 text-xs text-slate sm:hidden">
          Step {step + 1} of {STEPS.length}: {STEPS[step].title}
        </p>
      </div>

      <div className="relative overflow-hidden px-6 py-8 sm:px-9 sm:py-10">
        <Honeypot value={trap} onChange={setTrap} />
        {restored && step === 0 && (
          <p className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-blue-tint px-4 py-3 text-sm text-navy">
            We restored the answers you saved on this device.
            <button
              type="button"
              onClick={() => {
                setValues(empty);
                setRestored(false);
              }}
              className="shrink-0 font-semibold text-blue hover:text-navy"
            >
              Start over
            </button>
          </p>
        )}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.35, ease: EASE }}
            onFocus={form.markStarted}
          >
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">What do you need to know?</h2>
                  <p className="mt-2 text-slate">Choose the goal closest to yours. You can refine it in the next step.</p>
                </div>
                <div data-field="goal" role="radiogroup" aria-label="Your goal" className="grid gap-2.5 sm:grid-cols-2">
                  {[...studyGoals.map((item) => ({ label: item.goal, icon: item.icon, service: item.service })), { label: OTHER_GOAL, icon: "compass" as const, service: "" }].map(
                    (option) => {
                      const isOn = values.goal === option.label;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          role="radio"
                          aria-checked={isOn}
                          onClick={() => {
                            set("goal", option.label);
                            if (option.service && !values.services.includes(option.service)) set("services", [...values.services, option.service]);
                          }}
                          className={cn(
                            "flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all",
                            isOn ? "border-blue bg-blue-tint" : "border-mist hover:border-blue/40 hover:bg-cloud",
                            e.goal && !values.goal && "border-danger/40",
                          )}
                        >
                          <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", isOn ? "bg-blue text-white" : "bg-cloud text-navy")}>
                            <Icon name={option.icon} className="size-[1.1rem]" strokeWidth={1.75} aria-hidden="true" />
                          </span>
                          <span className="text-[0.93rem] leading-snug font-semibold text-navy">{option.label}</span>
                        </button>
                      );
                    },
                  )}
                </div>
                <FieldError message={e.goal} />
                <div data-field="services" className="space-y-3">
                  <p className="text-sm font-semibold text-navy">
                    Which areas are relevant?<span className="ml-0.5 text-blue">*</span>
                  </p>
                  <ChoiceChips
                    name="Areas of interest"
                    multiple
                    options={services.map((service) => service.shortTitle)}
                    value={values.services.map((slug) => services.find((service) => service.slug === slug)?.shortTitle ?? slug)}
                    onChange={(selected) =>
                      set(
                        "services",
                        (selected as string[]).map((title) => services.find((service) => service.shortTitle === title)?.slug ?? title),
                      )
                    }
                    invalid={Boolean(e.services)}
                  />
                  <FieldError message={e.services} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-7">
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">What decision will this research inform?</h2>
                  <p className="mt-2 text-slate">
                    We start with the decision you need to make, not the survey you think you need. A sentence or two is enough.
                  </p>
                </div>
                <Field label="The decision" htmlFor="pw-decision" required error={e.decision}>
                  <Textarea
                    id="pw-decision"
                    rows={5}
                    placeholder="For example: whether to expand our product to two new provinces next year, and how to price it."
                    value={values.decision}
                    onChange={(event) => set("decision", event.target.value)}
                    invalid={Boolean(e.decision)}
                  />
                </Field>
                <Field
                  label="Who do you need to hear from?"
                  htmlFor="pw-audience"
                  optional
                  error={e.audience}
                  hint="Customers, households, farmers, health workers, students, officials or a specific group."
                >
                  <Textarea id="pw-audience" rows={3} value={values.audience} onChange={(event) => set("audience", event.target.value)} invalid={Boolean(e.audience)} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">Scope and timing</h2>
                  <p className="mt-2 text-slate">Rough answers are fine. We will refine the scope together.</p>
                </div>
                <div data-field="geography" className="space-y-3">
                  <p className="text-sm font-semibold text-navy">
                    Where will the research take place?<span className="ml-0.5 text-blue">*</span>
                  </p>
                  <ChoiceChips name="Where" multiple options={geographyOptions} value={values.geography} onChange={(value) => set("geography", value as string[])} invalid={Boolean(e.geography)} />
                  <FieldError message={e.geography} />
                </div>
                <div data-field="timeline" className="space-y-3">
                  <p className="text-sm font-semibold text-navy">
                    When do you need results?<span className="ml-0.5 text-blue">*</span>
                  </p>
                  <ChoiceChips name="Timeline" options={timelineOptions} value={values.timeline} onChange={(value) => set("timeline", value as string)} invalid={Boolean(e.timeline)} />
                  <FieldError message={e.timeline} />
                </div>
                <div data-field="budget" className="space-y-3">
                  <p className="text-sm font-semibold text-navy">
                    Indicative budget <span className="font-normal text-slate">(optional, or equivalent in your currency)</span>
                  </p>
                  <ChoiceChips name="Budget" options={budgetOptions} value={values.budget} onChange={(value) => set("budget", value === values.budget ? "" : (value as string))} />
                </div>
                <div data-field="clientType" className="space-y-3">
                  <p className="text-sm font-semibold text-navy">
                    Which best describes you?<span className="ml-0.5 text-blue">*</span>
                  </p>
                  <ChoiceChips name="Organisation type" options={clientTypes} value={values.clientType} onChange={(value) => set("clientType", value as string)} invalid={Boolean(e.clientType)} />
                  <FieldError message={e.clientType} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">How can we reach you?</h2>
                  <p className="mt-2 text-slate">A researcher will contact you within one working day.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Full name" htmlFor="pw-name" required error={e.name}>
                    <Input id="pw-name" autoComplete="name" value={values.name} onChange={(event) => set("name", event.target.value)} invalid={Boolean(e.name)} />
                  </Field>
                  <Field label="Email address" htmlFor="pw-email" required error={e.email}>
                    <Input id="pw-email" type="email" autoComplete="email" value={values.email} onChange={(event) => set("email", event.target.value)} invalid={Boolean(e.email)} />
                  </Field>
                  <Field label="Phone or WhatsApp" htmlFor="pw-phone" optional error={e.phone}>
                    <Input id="pw-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => set("phone", event.target.value)} invalid={Boolean(e.phone)} />
                  </Field>
                  <Field label="Organisation" htmlFor="pw-organisation" optional error={e.organisation}>
                    <Input
                      id="pw-organisation"
                      autoComplete="organization"
                      value={values.organisation}
                      onChange={(event) => set("organisation", event.target.value)}
                      invalid={Boolean(e.organisation)}
                    />
                  </Field>
                  <Field label="Your role" htmlFor="pw-role" optional error={e.role}>
                    <Input id="pw-role" autoComplete="organization-title" value={values.role} onChange={(event) => set("role", event.target.value)} invalid={Boolean(e.role)} />
                  </Field>
                </div>
                <Field label="Anything else we should know?" htmlFor="pw-details" optional error={e.details}>
                  <Textarea id="pw-details" rows={4} value={values.details} onChange={(event) => set("details", event.target.value)} invalid={Boolean(e.details)} />
                </Field>
                <div data-field="consent">
                  <Checkbox
                    id="pw-consent"
                    checked={values.consent}
                    onChange={(checked) => set("consent", checked)}
                    invalid={Boolean(e.consent)}
                    label={
                      <>
                        I agree that Primeresearch may use these details to prepare a proposal and contact me, as described in the{" "}
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
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-navy">Review your brief</h2>
                  <p className="mt-2 text-slate">Check the details below, then send your request.</p>
                </div>
                <ReviewBlock title="Your goal" onEdit={() => goTo(0)}>
                  <ReviewRow label="Goal" value={values.goal} />
                  <ReviewRow label="Areas" value={values.services.map((slug) => services.find((service) => service.slug === slug)?.shortTitle ?? slug).join(", ")} />
                </ReviewBlock>
                <ReviewBlock title="The decision" onEdit={() => goTo(1)}>
                  <ReviewRow label="Decision" value={values.decision} />
                  <ReviewRow label="Audience" value={values.audience || "Not specified"} />
                </ReviewBlock>
                <ReviewBlock title="Scope" onEdit={() => goTo(2)}>
                  <ReviewRow label="Where" value={values.geography.join(", ")} />
                  <ReviewRow label="Timeline" value={values.timeline} />
                  <ReviewRow label="Budget" value={values.budget || "Prefer to discuss"} />
                  <ReviewRow label="You are" value={values.clientType} />
                </ReviewBlock>
                <ReviewBlock title="Your details" onEdit={() => goTo(3)}>
                  <ReviewRow label="Name" value={values.name} />
                  <ReviewRow label="Email" value={values.email} />
                  {values.phone && <ReviewRow label="Phone" value={values.phone} />}
                  {values.organisation && <ReviewRow label="Organisation" value={values.organisation} />}
                </ReviewBlock>
                {form.status === "error" && form.message && (
                  <p role="alert" className="rounded-xl bg-danger-tint px-4 py-3 text-sm text-danger">
                    {form.message}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-mist px-6 py-5 sm:px-9">
        {step > 0 ? (
          <Button type="button" variant="ghost" onClick={() => goTo(step - 1)}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Button>
        ) : (
          <span className="text-xs text-slate">Your answers are saved on this device as you go.</span>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next}>
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={form.status === "submitting"}>
            {form.status === "submitting" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
            {form.status === "submitting" ? "Sending" : "Send my brief"}
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-mist">
      <div className="flex items-center justify-between border-b border-mist px-5 py-3">
        <p className="font-display text-sm font-bold text-navy">{title}</p>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue hover:text-navy">
          <Pencil className="size-3.5" aria-hidden="true" />
          Edit
        </button>
      </div>
      <dl className="divide-y divide-mist">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-slate">{label}</dt>
      <dd className="whitespace-pre-wrap text-charcoal">{value}</dd>
    </div>
  );
}
