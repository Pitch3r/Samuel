"use client";

import {
  createContext,
  useActionState,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

/*
 * Forms post to server actions with useActionState. Field errors returned by
 * the action flow to <Input>, <Select> and <Textarea> through context by name,
 * and the action's message is shown as a toast.
 */

type FormState = ActionResult<unknown> | null;
type FormAction<S extends FormState = FormState> = (state: S | null, formData: FormData) => Promise<S | null>;

const FormContext = createContext<{ errors: Record<string, string[] | undefined>; pending: boolean }>({ errors: {}, pending: false });

export function ActionForm<S extends ActionResult<unknown>>({
  action,
  children,
  className,
  resetOnSuccess = false,
  successMessage,
  onSuccess,
  id,
  encType,
}: {
  action: FormAction<S>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  successMessage?: string;
  onSuccess?: (state: S) => void;
  id?: string;
  encType?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const allowReset = useRef(false);
  const latest = useRef({ action, successMessage, onSuccess, resetOnSuccess });

  useEffect(() => {
    latest.current = { action, successMessage, onSuccess, resetOnSuccess };
  });

  /*
   * Feedback is raised as soon as the action resolves rather than from an
   * effect, because a successful action often refreshes the page in a way
   * that removes this form (a deleted row, a closed panel) before any effect
   * could run.
   */
  const run = useCallback(async (state: S | null, formData: FormData) => {
    const current = latest.current;
    const result = await current.action(state, formData);
    if (!result) return result;
    if (result.ok) {
      const message = result.message ?? current.successMessage;
      if (message) toast.success(message);
      allowReset.current = current.resetOnSuccess;
      current.onSuccess?.(result);
    } else {
      toast.error(result.message);
      allowReset.current = false;
    }
    return result;
  }, []);

  const [state, formAction, pending] = useActionState<S | null, FormData>(run, null);

  useEffect(() => {
    if (state && !state.ok) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    }
  }, [state]);

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {};
  return (
    <FormContext value={{ errors, pending }}>
      <form
        ref={formRef}
        action={formAction}
        className={className}
        id={id}
        encType={encType}
        noValidate
        // React resets a form after every action, which would wipe what was typed
        // when validation fails. Only allow it after a success with resetOnSuccess.
        onReset={(event) => {
          if (!allowReset.current) event.preventDefault();
          allowReset.current = false;
        }}
      >
        {children}
      </form>
    </FormContext>
  );
}

/**
 * Keeps a plain <form>'s values after React's automatic post-action reset.
 * ActionForm already does this; use it only in hand-built forms.
 */
export function KeepValuesAfterSubmit() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const keep = (event: Event) => event.preventDefault();
    form.addEventListener("reset", keep);
    return () => form.removeEventListener("reset", keep);
  }, []);
  return <span ref={ref} hidden />;
}

export function useFieldError(name?: string) {
  const { errors } = useContext(FormContext);
  if (!name) return undefined;
  return errors[name]?.[0];
}

export function Field({
  label,
  name,
  hint,
  children,
  required,
  className,
  htmlFor,
}: {
  label: ReactNode;
  name?: string;
  hint?: ReactNode;
  children: ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}) {
  const error = useFieldError(name);
  return (
    <div className={className}>
      <label className="field-label" htmlFor={htmlFor ?? name}>
        {label}
        {required && (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p className="field-error" id={name ? `${name}-error` : undefined}>
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, name, id, ...props }: ComponentProps<"input">) {
  const error = useFieldError(name);
  return (
    <input
      id={id ?? name}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && name ? `${name}-error` : undefined}
      className={cn("field-input", className)}
      {...props}
    />
  );
}

export function Textarea({ className, name, id, rows = 4, ...props }: ComponentProps<"textarea">) {
  const error = useFieldError(name);
  return (
    <textarea
      id={id ?? name}
      name={name}
      rows={rows}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && name ? `${name}-error` : undefined}
      className={cn("field-input resize-y", className)}
      {...props}
    />
  );
}

export function Select({ className, name, id, children, ...props }: ComponentProps<"select">) {
  const error = useFieldError(name);
  return (
    <select
      id={id ?? name}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error && name ? `${name}-error` : undefined}
      className={cn("field-input", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({ label, description, name, className, ...props }: ComponentProps<"input"> & { label: ReactNode; description?: ReactNode }) {
  const id = useId();
  return (
    <label htmlFor={props.id ?? id} className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        id={props.id ?? id}
        name={name}
        className="mt-0.5 size-4 shrink-0 rounded border-mist accent-blue"
        {...props}
      />
      <span className="text-sm">
        <span className="font-semibold text-navy">{label}</span>
        {description && <span className="mt-0.5 block text-slate">{description}</span>}
      </span>
    </label>
  );
}

export function SubmitButton({
  children,
  variant = "primary",
  size = "md",
  className,
  pendingLabel,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || props.disabled} aria-disabled={pending} className={buttonClasses({ variant, size, className })} {...props}>
      {pending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}

/** A one-button form for actions such as delete, with a confirmation prompt. */
export function ConfirmForm<S extends ActionResult<unknown>>({
  action,
  confirm,
  children,
  className,
  hidden,
}: {
  action: FormAction<S>;
  confirm: string;
  children: ReactNode;
  className?: string;
  hidden?: Record<string, string>;
}) {
  return (
    <ActionForm action={action} className={className}>
      {hidden && Object.entries(hidden).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <span
        onClickCapture={(event) => {
          if (!window.confirm(confirm)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        className="contents"
      >
        {children}
      </span>
    </ActionForm>
  );
}
