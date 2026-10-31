"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, MapPin } from "lucide-react";
import { Callout } from "@/components/ui/callout";
import { buttonClasses } from "@/components/ui/button";
import { loginAction, type LoginState } from "./actions";

export function LoginForm({ next, needLocation, notice }: { next?: string; needLocation: boolean; notice?: { tone: "info" | "warning" | "danger" | "success"; text: string } }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const clientRef = useRef<HTMLInputElement>(null);
  const located = useRef(false);

  useEffect(() => {
    if (!clientRef.current) return;
    const nav = navigator as Navigator & { deviceMemory?: number; userAgentData?: { platform?: string } };
    clientRef.current.value = JSON.stringify({
      platform: nav.userAgentData?.platform ?? navigator.platform ?? "",
      screen: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cores: navigator.hardwareConcurrency ?? null,
      memory: nav.deviceMemory ?? null,
    });
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (!needLocation || located.current) {
      located.current = false;
      return;
    }
    event.preventDefault();
    if (!("geolocation" in navigator)) {
      setLocationError("This browser cannot share its location, which the office check needs.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const form = formRef.current!;
        (form.elements.namedItem("latitude") as HTMLInputElement).value = String(position.coords.latitude);
        (form.elements.namedItem("longitude") as HTMLInputElement).value = String(position.coords.longitude);
        (form.elements.namedItem("accuracy") as HTMLInputElement).value = String(Math.round(position.coords.accuracy));
        setLocating(false);
        located.current = true;
        form.requestSubmit();
      },
      () => {
        setLocating(false);
        setLocationError("Location was not shared. Allow location access for this site, then sign in again.");
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  const error = locationError ?? (state && !state.ok ? state.message : null);
  const busy = pending || locating;

  return (
    <form ref={formRef} action={formAction} onSubmit={onSubmit} className="space-y-5" noValidate>
      {notice && !error && <Callout tone={notice.tone}>{notice.text}</Callout>}
      {error && (
        <Callout tone={state?.reason?.startsWith("device") || state?.reason === "network" || state?.reason === "location" || state?.reason === "hours" ? "warning" : "danger"}>
          {error}
        </Callout>
      )}
      <input type="hidden" name="next" value={next ?? ""} />
      <input type="hidden" name="latitude" defaultValue="" />
      <input type="hidden" name="longitude" defaultValue="" />
      <input type="hidden" name="accuracy" defaultValue="" />
      <input ref={clientRef} type="hidden" name="client" defaultValue="" />

      <div>
        <label htmlFor="email" className="field-label">
          Email address
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field-input" placeholder="name@primeresearch.co.zm" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="field-input pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate hover:text-navy"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {needLocation && (
        <p className="flex items-start gap-2 text-xs text-slate">
          <MapPin className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Employees confirm they are in the office by sharing this computer&apos;s location when signing in.
        </p>
      )}

      <button type="submit" disabled={busy} className={buttonClasses({ size: "lg", className: "w-full" })}>
        {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
        {locating ? "Confirming your location" : pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
