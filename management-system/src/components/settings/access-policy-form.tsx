"use client";

import { useState, type ReactNode } from "react";
import { Clock, Crosshair, ExternalLink, LoaderCircle, MapPin, Monitor, Plus, Save, ShieldCheck, Timer, Wifi } from "lucide-react";
import { ActionForm, Field, Input, Select, SubmitButton, Textarea, useFieldError } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/settings/switch";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { DEVICE_MODE_HELP, WEEK_ORDER, longDay, shortDay } from "@/components/settings/policy-text";
import { DEVICE_MODES, DEVICE_MODE_LABELS, type DeviceMode } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AccessSettings, ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export type NetworkDiagnostics = {
  detected: string;
  source: string;
  headers: { name: string; value: string }[];
  /** True when the detected address is loopback or private. */
  local: boolean;
};

/**
 * The office access policy. Each rule has its own switch; a rule's settings
 * are shown while it is on. Fields of a rule that is off are still submitted
 * (just hidden), so switching a rule back on restores its last values.
 */
export function AccessPolicyForm({
  action,
  settings,
  network,
  lusakaNow,
  lastSaved,
}: {
  action: Action;
  settings: AccessSettings;
  network: NetworkDiagnostics;
  lusakaNow: string;
  lastSaved: string | null;
}) {
  const [enforce, setEnforce] = useState(settings.enforce);
  const [deviceOn, setDeviceOn] = useState(settings.device.enabled);
  const [mode, setMode] = useState<DeviceMode>(settings.device.mode);
  const [networkOn, setNetworkOn] = useState(settings.network.enabled);
  const [allowed, setAllowed] = useState(settings.network.allowed.join("\n"));
  const [locationOn, setLocationOn] = useState(settings.location.enabled);
  const [latitude, setLatitude] = useState(settings.location.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(settings.location.longitude?.toString() ?? "");
  const [hoursOn, setHoursOn] = useState(settings.hours.enabled);
  // Set by any edit, cleared by a successful save, so the save bar can say when there is something to save.
  const [dirty, setDirty] = useState(false);
  const markDirty = () => setDirty(true);

  return (
    <ActionForm action={action} onSuccess={() => setDirty(false)} className="space-y-5">
      <KeepValuesAfterSubmit />
      <div onChange={markDirty} className="space-y-5">
        {/* Master switch */}
        <Card className={cn("overflow-hidden", enforce ? "ring-1 ring-blue/25" : "")}>
          <div className="flex items-start gap-4 px-5 py-5">
            <span
              className={cn(
                "mt-0.5 hidden size-10 shrink-0 place-items-center rounded-xl sm:grid",
                enforce ? "bg-navy text-white" : "bg-cloud text-slate",
              )}
            >
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <Switch
              name="enforce"
              size="lg"
              className="flex-1"
              checked={enforce}
              onCheckedChange={setEnforce}
              label="Restrict employee sign-in to the office"
              description="When this is on, employees can only sign in, and stay signed in, while every rule switched on below is met. The administrator can always sign in from anywhere."
            />
          </div>
          {!enforce && (
            <div className="border-t border-mist px-5 py-3">
              <Callout tone="warning" title="Office restrictions are off">
                Employees can currently sign in from any computer, anywhere, at any time. The rules below are kept but not applied until you switch
                this on.
              </Callout>
            </div>
          )}
        </Card>

        <div className={cn("space-y-5 transition-opacity", !enforce && "opacity-70")}>
          {/* Computer lock */}
          <RuleCard
            icon={<Monitor aria-hidden="true" />}
            title="Computer lock"
            description="Ties each employee to the office computers they may use. This is the main safeguard."
            name="deviceEnabled"
            on={deviceOn}
            onChange={setDeviceOn}
          >
            <fieldset>
              <legend className="field-label">How computers are approved</legend>
              <div className="grid gap-3 lg:grid-cols-2">
                {DEVICE_MODES.map((option) => {
                  const checked = mode === option;
                  return (
                    <label
                      key={option}
                      className={cn(
                        "relative flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors",
                        checked ? "border-blue bg-blue-tint/50 ring-1 ring-blue" : "border-mist bg-white hover:border-slate/40",
                      )}
                    >
                      <input
                        type="radio"
                        name="deviceMode"
                        value={option}
                        checked={checked}
                        onChange={() => setMode(option)}
                        className="mt-1 size-4 shrink-0 accent-blue"
                      />
                      <span className="min-w-0 text-sm">
                        <span className="block font-semibold text-navy">{DEVICE_MODE_LABELS[option]}</span>
                        <span className="mt-1 block text-slate">{DEVICE_MODE_HELP[option]}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {mode === "first-sign-in" && (
              <Callout tone="info" title="Do the first sign-in together">
                Sit with each employee at the office and have them sign in on their own computer. From then on their account only works on that
                computer. If someone signs in elsewhere first, remove that computer under Computers and start again.
              </Callout>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Computers per employee"
                name="maxPerEmployee"
                hint={
                  mode === "first-sign-in"
                    ? "Usually 1. Raise it if someone works on more than one office computer."
                    : "Applies when computers are locked on first sign-in."
                }
              >
                <Select name="maxPerEmployee" defaultValue={String(settings.device.maxPerEmployee)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "1 computer" : `${n} computers`}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </RuleCard>

          {/* Office network */}
          <RuleCard
            icon={<Wifi aria-hidden="true" />}
            title="Office network"
            description="Only accepts sign-ins coming from the office internet connection."
            name="networkEnabled"
            on={networkOn}
            onChange={setNetworkOn}
          >
            <NetworkFields
              allowed={allowed}
              setAllowed={(value) => {
                setAllowed(value);
                markDirty();
              }}
              network={network}
            />
          </RuleCard>

          {/* Office location */}
          <RuleCard
            icon={<MapPin aria-hidden="true" />}
            title="Office location"
            description="Asks the browser for its location at sign-in and refuses readings outside the office. Optional."
            name="locationEnabled"
            on={locationOn}
            onChange={setLocationOn}
          >
            <LocationFields
              latitude={latitude}
              longitude={longitude}
              setLatitude={(value) => {
                setLatitude(value);
                markDirty();
              }}
              setLongitude={(value) => {
                setLongitude(value);
                markDirty();
              }}
              radius={settings.location.radiusMeters}
            />
          </RuleCard>

          {/* Office hours */}
          <RuleCard
            icon={<Clock aria-hidden="true" />}
            title="Office hours"
            description="Only allows sign-in on office days, between the opening and closing time."
            name="hoursEnabled"
            on={hoursOn}
            onChange={setHoursOn}
          >
            <DayPicker days={settings.hours.days} />
            <div className="grid gap-5 sm:grid-cols-2 lg:max-w-xl">
              <Field label="Opens at" name="start" hint="Lusaka time.">
                <Input name="start" type="time" step={60} defaultValue={settings.hours.start} />
              </Field>
              <Field label="Closes at" name="end">
                <Input name="end" type="time" step={60} defaultValue={settings.hours.end} />
              </Field>
            </div>
            <p className="text-sm text-slate">
              It is now <span className="font-semibold text-navy">{lusakaNow}</span> in Lusaka. Employees who are signed in when the office closes are
              signed out on their next click.
            </p>
          </RuleCard>

          {/* Session length */}
          <Card>
            <div className="flex items-start gap-4 px-5 py-5">
              <span className="mt-0.5 hidden size-10 shrink-0 place-items-center rounded-xl bg-blue-tint text-blue sm:grid">
                <Timer className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-navy">Session length for employees</h3>
                <p className="mt-0.5 text-sm text-slate">
                  Employees are signed out after this many hours and must sign in again, which repeats every office check. Administrator sessions last
                  12 hours.
                </p>
                <Field label="Hours" name="sessionHours" className="mt-4 max-w-40">
                  <Input name="sessionHours" type="number" inputMode="numeric" min={1} max={24} step={1} defaultValue={settings.sessionHours} />
                </Field>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Save bar */}
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-card border border-mist bg-white/95 px-3 py-3 shadow-lift backdrop-blur sm:px-5">
        {dirty ? (
          <p className="hidden items-center gap-2 text-sm font-semibold text-navy sm:flex" role="status">
            <span className="size-2 rounded-full bg-blue" aria-hidden="true" />
            You have unsaved changes. They apply to employees from their next click once saved.
          </p>
        ) : (
          <p className="hidden text-sm text-slate sm:block">
            {lastSaved ?? "Not saved from this page yet, so the standard settings are in use."} Changes apply to employees from their next click.
          </p>
        )}
        <SubmitButton pendingLabel="Saving policy" className="w-full sm:w-auto">
          <Save aria-hidden="true" />
          Save office access policy
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

/**
 * One rule: a header with its switch, and its settings while it is on. The
 * settings also show (through :has) when one of their fields has an error, so
 * a problem is never hidden.
 */
function RuleCard({
  icon,
  title,
  description,
  name,
  on,
  onChange,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  name: string;
  on: boolean;
  onChange: (on: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-4 px-5 py-4">
        <span
          className={cn(
            "mt-0.5 hidden size-10 shrink-0 place-items-center rounded-xl sm:grid [&_svg]:size-5",
            on ? "bg-blue-tint text-blue" : "bg-cloud text-slate",
          )}
        >
          {icon}
        </span>
        <Switch name={name} checked={on} onCheckedChange={onChange} label={title} description={description} className="flex-1" />
      </div>
      <div
        className={cn(
          "space-y-5 border-t border-mist bg-cloud/40 px-5 py-5",
          !on && "hidden has-[.field-error]:block has-[[aria-invalid=true]]:block",
        )}
      >
        {children}
      </div>
    </Card>
  );
}

function NetworkFields({ allowed, setAllowed, network }: { allowed: string; setAllowed: (value: string) => void; network: NetworkDiagnostics }) {
  const lines = allowed
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);
  const canAdd = network.detected !== "unknown";
  const listed = lines.includes(network.detected);

  return (
    <>
      <Field
        label="Office network addresses"
        name="allowed"
        hint="One public IP address or range per line, for example 41.72.100.10 or 41.72.100.0/24. Your internet provider can confirm the office address."
      >
        <Textarea
          name="allowed"
          rows={4}
          value={allowed}
          onChange={(event) => setAllowed(event.target.value)}
          placeholder={"41.72.100.10\n41.72.100.0/24"}
          className="font-mono text-sm"
          spellCheck={false}
        />
      </Field>

      <div className="rounded-xl border border-mist bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-charcoal">
            Detected address of this computer:{" "}
            <code className="rounded-md bg-cloud px-1.5 py-0.5 font-mono text-[0.8125rem] font-semibold text-navy">{network.detected}</code>
            {listed && <span className="ml-2 text-xs font-semibold text-good">Already on the list</span>}
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={!canAdd || listed}
            onClick={() => setAllowed(lines.length ? `${lines.join("\n")}\n${network.detected}` : network.detected)}
          >
            <Plus aria-hidden="true" />
            Add this address
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-slate">Use this when you are at the office, on the office connection.</p>
        {network.local && (
          <Callout tone="warning" className="mt-3">
            This is a private or local address. That usually means the system is running on this computer, or a proxy is hiding the real address. The
            office network check needs the office&apos;s public address, so check the troubleshooting details below before relying on it.
          </Callout>
        )}
        <details className="group mt-3 text-sm">
          <summary className="cursor-pointer list-none font-semibold text-blue-dark hover:underline">
            Troubleshooting: how the address is detected
          </summary>
          <div className="mt-3 space-y-3 text-slate">
            <p>
              The address is read according to the <code className="font-mono text-navy">CLIENT_IP_SOURCE</code> server setting, currently{" "}
              <code className="rounded-md bg-cloud px-1.5 py-0.5 font-mono text-navy">{network.source}</code>. If the detected address is the hosting
              provider&apos;s rather than the office&apos;s, change that setting as described in the README.
            </p>
            {network.headers.length ? (
              <dl className="divide-y divide-mist rounded-lg border border-mist bg-cloud/50">
                {network.headers.map((header) => (
                  <div key={header.name} className="grid gap-1 px-3 py-2 sm:grid-cols-[12rem_1fr]">
                    <dt className="font-mono text-xs text-slate">{header.name}</dt>
                    <dd className="font-mono text-xs break-all text-navy">{header.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>No forwarding headers were received with this request, so the address comes from the direct connection.</p>
            )}
          </div>
        </details>
      </div>
    </>
  );
}

function LocationFields({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  radius,
}: {
  latitude: string;
  longitude: string;
  setLatitude: (value: string) => void;
  setLongitude: (value: string) => void;
  radius: number;
}) {
  const [locating, setLocating] = useState(false);
  const [reading, setReading] = useState<{ tone: "info" | "warning" | "danger"; text: string } | null>(null);

  function locate() {
    if (!("geolocation" in navigator)) {
      setReading({ tone: "danger", text: "This browser cannot share its location. Enter the coordinates from a map instead." });
      return;
    }
    setLocating(true);
    setReading(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = Math.round(position.coords.accuracy);
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocating(false);
        setReading(
          accuracy > 100
            ? {
                tone: "warning",
                text: `Location found, but only to within about ${accuracy.toLocaleString("en-GB")} m. Check it on the map, or take the reading on a phone or laptop at the office.`,
              }
            : { tone: "info", text: `Location found, accurate to about ${accuracy.toLocaleString("en-GB")} m. Save the policy to use it.` },
        );
      },
      (error) => {
        setLocating(false);
        setReading({
          tone: "danger",
          text:
            error.code === error.PERMISSION_DENIED
              ? "Location access was refused. Allow location for this site in the browser, then try again."
              : "The location could not be found. Try again, or enter the coordinates from a map.",
        });
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const hasPoint = latitude !== "" && longitude !== "" && Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <>
      <Callout tone="warning" title="Desktop computers can report an imprecise location">
        Computers without GPS estimate their position from Wi-Fi or the internet connection, which can be out by hundreds of metres. Keep this as an
        extra layer on top of the computer lock or the office network, not as the only check.
      </Callout>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Latitude" name="latitude" hint="For example, -15.4167">
          <Input name="latitude" inputMode="decimal" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="-15.4167" />
        </Field>
        <Field label="Longitude" name="longitude" hint="For example, 28.2833">
          <Input
            name="longitude"
            inputMode="decimal"
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            placeholder="28.2833"
          />
        </Field>
        <Field label="Radius in metres" name="radiusMeters" hint="Between 25 and 5,000.">
          <Input name="radiusMeters" type="number" inputMode="numeric" min={25} max={5000} step={5} defaultValue={radius} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={locate} disabled={locating}>
          {locating ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Crosshair aria-hidden="true" />}
          {locating ? "Finding location" : "Use this computer's location"}
        </Button>
        {hasPoint && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-dark hover:underline"
          >
            Check on a map
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        )}
      </div>
      {reading && (
        <p
          role="status"
          className={cn("text-sm", reading.tone === "danger" ? "text-danger" : reading.tone === "warning" ? "text-warning" : "text-slate")}
        >
          {reading.text}
        </p>
      )}
    </>
  );
}

function DayPicker({ days }: { days: number[] }) {
  const error = useFieldError("days");
  return (
    <fieldset>
      <legend className="field-label">Office days</legend>
      <div className="flex flex-wrap gap-2">
        {WEEK_ORDER.map((day) => (
          <label
            key={day}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl border border-mist bg-white px-3 py-2 text-sm font-semibold text-slate transition-colors hover:border-slate/40",
              "has-[:checked]:border-blue has-[:checked]:bg-blue-tint has-[:checked]:text-navy",
              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue",
            )}
          >
            <input type="checkbox" name="days" value={day} defaultChecked={days.includes(day)} className="size-4 accent-blue" />
            <span aria-hidden="true">{shortDay(day)}</span>
            <span className="sr-only">{longDay(day)}</span>
          </label>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}
