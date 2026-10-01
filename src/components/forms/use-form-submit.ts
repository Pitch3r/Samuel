"use client";

import { useCallback, useRef, useState } from "react";
import type { z } from "zod";
import { fieldErrorsFrom } from "@/lib/validation";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Validates in the browser with the same zod schema the API uses, posts JSON,
 * and maps server-side field errors back onto the form.
 */
export function useFormSubmit<T extends Record<string, unknown>>(endpoint: string, schema?: z.ZodType) {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState<string | undefined>();
  const startedAt = useRef<number>(0);

  const markStarted = useCallback(() => {
    if (!startedAt.current) startedAt.current = Date.now();
  }, []);

  const validate = useCallback(
    (values: T) => {
      if (!schema) return true;
      const result = schema.safeParse(values);
      if (result.success) {
        setFieldErrors({});
        return true;
      }
      const errors = fieldErrorsFrom(result.error);
      setFieldErrors(errors);
      focusFirstError(errors);
      return false;
    },
    [schema],
  );

  const submit = useCallback(
    async (values: T) => {
      if (!validate(values)) {
        setStatus("error");
        setMessage("Please check the highlighted fields.");
        return null;
      }
      setStatus("submitting");
      setMessage("");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, startedAt: startedAt.current || undefined }),
        });
        const data = (await response.json().catch(() => null)) as
          | { ok: boolean; reference?: string; message?: string; fieldErrors?: Record<string, string> }
          | null;
        if (response.ok && data?.ok) {
          setStatus("success");
          setReference(data.reference);
          setMessage(data.message ?? "");
          setFieldErrors({});
          return { ...data, ok: true as const };
        }
        setStatus("error");
        setFieldErrors(data?.fieldErrors ?? {});
        setMessage(data?.message ?? "Something went wrong. Please try again.");
        if (data?.fieldErrors) focusFirstError(data.fieldErrors);
        return { ok: false as const, fieldErrors: data?.fieldErrors ?? {}, message: data?.message };
      } catch {
        setStatus("error");
        setMessage("We could not reach the server. Please check your connection and try again.");
        return null;
      }
    },
    [endpoint, validate],
  );

  const clearError = useCallback((field: string) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setFieldErrors({});
    setMessage("");
    setReference(undefined);
    startedAt.current = Date.now();
  }, []);

  return { status, fieldErrors, message, reference, submit, validate, clearError, reset, markStarted, setFieldErrors };
}

function focusFirstError(errors: Record<string, string>) {
  const first = Object.keys(errors)[0];
  if (!first || typeof document === "undefined") return;
  requestAnimationFrame(() => {
    const element =
      document.getElementById(first) ?? document.querySelector<HTMLElement>(`[name="${first}"], [data-field="${first}"]`);
    element?.focus({ preventScroll: false });
    element?.scrollIntoView({ block: "center", behavior: "smooth" });
  });
}
