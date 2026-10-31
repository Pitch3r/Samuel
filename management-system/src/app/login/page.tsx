import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building, Monitor, ShieldCheck, Wifi } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PrimeArc } from "@/components/brand/prime-arc";
import { Callout } from "@/components/ui/callout";
import { LoginForm } from "./login-form";
import { resolveViewer } from "@/lib/auth/session";
import { getAccessSettings } from "@/lib/data/settings";
import { getDevice } from "@/lib/data/devices";
import { currentDeviceId } from "@/lib/auth/sign-in";
import { isFirebaseConfigured } from "@/lib/env";
import { ACCESS_DENIALS, organisation, type AccessDenial } from "@/lib/constants";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const reason = typeof params.reason === "string" && params.reason in ACCESS_DENIALS ? (params.reason as AccessDenial) : null;
  const next = typeof params.next === "string" ? safeNextPath(params.next) : undefined;
  const configured = isFirebaseConfigured();

  if (configured) {
    const current = await resolveViewer();
    if (current.viewer) redirect(next ?? "/dashboard");
  }

  const settings = configured ? await getAccessSettings().catch(() => null) : null;
  const deviceId = configured ? await currentDeviceId() : null;
  const device = deviceId ? await getDevice(deviceId).catch(() => null) : null;
  const needLocation = Boolean(settings?.enforce && settings.location.enabled && settings.location.latitude !== null);

  const notice = reason
    ? {
        tone: reason === "signed-out" || reason === "password-changed" ? ("success" as const) : reason === "expired" ? ("info" as const) : ("warning" as const),
        text: ACCESS_DENIALS[reason],
      }
    : params.setup === "done"
      ? { tone: "success" as const, text: "Your administrator account is ready. Sign in to continue." }
      : undefined;

  const rules = [
    settings?.enforce && settings.device.enabled && { icon: <Monitor aria-hidden="true" />, text: "Registered office computers only" },
    settings?.enforce && settings.network.enabled && settings.network.allowed.length > 0 && { icon: <Wifi aria-hidden="true" />, text: "Office network only" },
    needLocation && { icon: <Building aria-hidden="true" />, text: "Inside the office only" },
  ].filter(Boolean) as { icon: React.ReactNode; text: string }[];

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <section className="on-dark relative hidden overflow-hidden bg-navy px-12 py-12 text-white lg:flex lg:flex-col">
        <PrimeArc className="-right-56 -bottom-64 size-[46rem]" />
        <Logo variant="reversed" width={190} priority />
        <div className="relative mt-auto max-w-lg pb-8">
          <p className="text-xs font-semibold tracking-[0.14em] text-gold uppercase">Management system</p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.08] font-bold tracking-tight">{organisation.tagline}</h1>
          <p className="mt-5 text-lg leading-relaxed text-white/75">
            Assignments, progress, performance and reporting for the {organisation.shortName} team, in one secure place.
          </p>
          <ul className="mt-10 grid gap-4 text-sm text-white/80 sm:grid-cols-2">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 block h-px w-6 shrink-0 translate-y-2 bg-gold" />
              Corporate and academic research tracked side by side
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 block h-px w-6 shrink-0 translate-y-2 bg-gold" />
              Progress, deadlines and quality in real time
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-white/45">
          {organisation.name}, {organisation.city}
        </p>
      </section>

      <section className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Logo width={170} priority />
          </div>
          <h2 className="mt-10 text-2xl font-bold tracking-tight lg:mt-0">Sign in</h2>
          <p className="mt-1.5 text-sm text-slate">Use the email address and password the administrator gave you.</p>

          <div className="mt-8">
            {configured ? (
              <LoginForm next={next} needLocation={needLocation} notice={notice} />
            ) : (
              <Callout tone="warning" title="Firebase is not connected yet">
                Add the Firebase settings described in the README (section 2), then restart the system.
              </Callout>
            )}
          </div>

          <div className="mt-10 rounded-xl border border-mist bg-cloud px-4 py-3 text-xs text-slate">
            <p className="flex items-center gap-2 font-semibold text-navy">
              <ShieldCheck className="size-4 text-teal" aria-hidden="true" />
              Office access
            </p>
            {rules.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {rules.map((rule) => (
                  <li key={rule.text} className="flex items-center gap-2 [&_svg]:size-3.5">
                    {rule.icon}
                    {rule.text} for employee accounts.
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5">Sign-in is open to all staff accounts.</p>
            )}
            <p className="mt-2 border-t border-mist pt-2">
              This computer:{" "}
              <span className="font-semibold text-navy">
                {device?.status === "approved" ? `registered (${device.label})` : device?.status === "blocked" ? "blocked" : device ? "awaiting approval" : "not registered"}
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
