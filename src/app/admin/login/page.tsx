import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/brand/logo";
import { PrimeArc } from "@/components/brand/prime-arc";
import { authConfigProblem, usingDevCredentials } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const problem = authConfigProblem();
  const devMode = usingDevCredentials();

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="on-dark relative isolate hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />
        <PrimeArc tone="dark" segmentStart={150} segmentSweep={50} className="-right-[18rem] -bottom-[22rem] -z-10 size-[44rem]" />
        <Logo variant="reversed" width={200} priority />
        <div>
          <p className="eyebrow">Dashboard</p>
          <p className="mt-5 max-w-md font-display text-4xl leading-tight font-bold text-white">
            Every enquiry, proposal and insight, in one place.
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-white/60">
          <ShieldCheck className="size-4" aria-hidden="true" />
          Authorised staff only. Sessions expire after 8 hours.
        </p>
      </section>

      <section className="flex flex-col justify-center bg-white px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Logo width={180} priority />
          </div>
          <h1 className="mt-10 font-display text-3xl font-bold text-navy lg:mt-0">Sign in</h1>
          <p className="mt-2 text-slate">Use the administrator email and password configured on the server.</p>

          {devMode && (
            <p className="mt-6 rounded-xl bg-gold-tint px-4 py-3 text-sm leading-relaxed text-navy ring-1 ring-gold/40">
              Development mode: sign in with <strong>admin@primeresearch.local</strong> and <strong>change-me-now</strong>. Set
              ADMIN_EMAIL, ADMIN_PASSWORD and SESSION_SECRET before going live.
            </p>
          )}
          {problem && !devMode && (
            <p role="alert" className="mt-6 rounded-xl bg-danger-tint px-4 py-3 text-sm text-danger">
              {problem}
            </p>
          )}

          <div className="mt-8">
            <LoginForm next={next} />
          </div>

          <Link href="/" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to the website
          </Link>
        </div>
      </section>
    </main>
  );
}
