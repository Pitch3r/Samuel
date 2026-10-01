"use client";

import { forwardRef, useId } from "react";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const controlClasses =
  "block w-full rounded-xl border border-mist bg-white px-4 py-3 text-[0.98rem] text-charcoal shadow-[0_1px_2px_rgb(11_36_71/0.04)] transition-[border-color,box-shadow] duration-200 placeholder:text-slate/70 hover:border-slate/40 focus:border-blue focus:outline-none focus:ring-4 focus:ring-blue/15 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15 disabled:cursor-not-allowed disabled:bg-cloud";

export function Field({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-navy">
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-blue" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {optional && <span className="text-xs font-normal text-slate">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-xs leading-relaxed text-slate">
          {hint}
        </p>
      )}
      <FieldError id={`${htmlFor}-error`} message={error} />
    </div>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-danger">
      <CircleAlert className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      {message}
    </p>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, id, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={cn(controlClasses, className)}
      {...props}
    />
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, id, rows = 5, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={cn(controlClasses, "min-h-28 resize-y leading-relaxed", className)}
      {...props}
    />
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, id, options, placeholder, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(controlClasses, "appearance-none pr-11", className)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-slate"
      >
        <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

export function Checkbox({
  label,
  checked,
  onChange,
  invalid,
  id,
  name,
  description,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  invalid?: boolean;
  id?: string;
  name?: string;
  description?: React.ReactNode;
}) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className="group flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-charcoal">
      <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
        <input
          id={inputId}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={invalid || undefined}
          className="peer size-5 cursor-pointer appearance-none rounded-md border border-slate/40 bg-white transition-colors checked:border-blue checked:bg-blue focus-visible:ring-4 focus-visible:ring-blue/20 aria-[invalid=true]:border-danger"
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none absolute size-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <span>
        {label}
        {description && <span className="mt-0.5 block text-xs text-slate">{description}</span>}
      </span>
    </label>
  );
}

/** Toggle chips for single or multiple choice questions. */
export function ChoiceChips({
  options,
  value,
  onChange,
  multiple = false,
  name,
  invalid,
}: {
  options: readonly string[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  name: string;
  invalid?: boolean;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={name} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isOn = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={isOn}
            onClick={() => {
              if (multiple) {
                onChange(isOn ? selected.filter((item) => item !== option) : [...selected, option]);
              } else {
                onChange(option);
              }
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
              isOn
                ? "border-blue bg-blue text-white shadow-[0_6px_16px_-8px_rgb(43_103_197/0.8)]"
                : "border-mist bg-white text-charcoal hover:border-blue/50 hover:text-navy",
              invalid && !isOn && "border-danger/50",
            )}
          >
            {isOn && <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

/** Hidden field that bots tend to fill in. Real visitors never see it. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Company website
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </div>
  );
}
