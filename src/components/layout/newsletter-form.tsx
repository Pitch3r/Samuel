"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck, LoaderCircle } from "lucide-react";
import { useFormSubmit } from "@/components/forms/use-form-submit";
import { FieldError, Honeypot } from "@/components/ui/form-controls";
import { newsletterSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

export function NewsletterForm({ source = "footer", tone = "dark" }: { source?: string; tone?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const form = useFormSubmit("/api/newsletter", newsletterSchema);
  const inputId = `newsletter-email-${source}`;

  if (form.status === "success") {
    return (
      <p
        role="status"
        className={cn(
          "flex items-start gap-3 rounded-2xl p-4 text-sm",
          tone === "dark" ? "bg-white/[0.06] text-white" : "bg-teal-tint text-teal-dark",
        )}
      >
        <CircleCheck className={cn("mt-0.5 size-5 shrink-0", tone === "dark" ? "text-gold" : "text-teal-dark")} aria-hidden="true" />
        <span>{form.message || "You are subscribed. Thank you."} Look out for the next edition in your inbox.</span>
      </p>
    );
  }

  return (
    <form
      noValidate
      onFocus={form.markStarted}
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit({ email, source, company_website: trap });
      }}
      className="relative"
    >
      <Honeypot value={trap} onChange={setTrap} />
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border p-1.5 pl-5 transition-colors focus-within:ring-4",
          tone === "dark"
            ? "border-white/15 bg-white/[0.06] focus-within:border-gold/60 focus-within:ring-gold/15"
            : "border-mist bg-white focus-within:border-blue focus-within:ring-blue/15",
        )}
      >
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            form.clearError("email");
          }}
          aria-invalid={Boolean(form.fieldErrors.email) || undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent py-2 text-sm outline-none focus-visible:outline-none",
            tone === "dark" ? "text-white placeholder:text-white/45" : "text-charcoal placeholder:text-slate/70",
          )}
        />
        <button
          type="submit"
          disabled={form.status === "submitting"}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 font-display text-sm font-semibold transition-colors disabled:opacity-60",
            tone === "dark" ? "bg-gold text-navy hover:bg-gold-dark" : "bg-blue text-white hover:bg-blue-dark",
          )}
        >
          {form.status === "submitting" ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight className="size-4" aria-hidden="true" />
          )}
          Subscribe
        </button>
      </div>
      <div className="mt-2 min-h-5 pl-5">
        {form.fieldErrors.email ? (
          <FieldError id={`${inputId}-error`} message={form.fieldErrors.email} />
        ) : form.status === "error" && form.message ? (
          <FieldError message={form.message} />
        ) : null}
      </div>
    </form>
  );
}
