import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PrintButton } from "@/components/capability/print-button";
import { site } from "@/config/site";
import { deliverables, ethicsCommitments, processSteps, qualityProtocol } from "@/content/approach";
import { capabilities, clientTypes, fieldLanguages, reasons } from "@/content/company";
import { sectors } from "@/content/sectors";
import { services } from "@/content/services";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Capability statement",
  description: "Primeresearch Consultants capability statement: services, sectors, method, quality protocol and contact details.",
  alternates: { canonical: "/capability-statement" },
};

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-[0.8rem] font-bold tracking-[0.16em] text-navy uppercase">
      <span aria-hidden="true" className="h-0.5 w-6 rounded bg-gold" />
      {children}
    </h2>
  );
}

export default function CapabilityStatementPage() {
  const today = formatDate(new Date());
  return (
    <div className="min-h-dvh bg-cloud py-8 print:bg-white print:py-0">
      <style>{`@page { size: A4; margin: 12mm; } @media print { html, body { background: #fff; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      <div className="mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-4 px-4 print:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-blue">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to the website
        </Link>
        <PrintButton />
      </div>

      <main
        id="main"
        className="mx-auto max-w-[210mm] bg-white px-5 py-8 text-[10.5pt] leading-[1.5] text-charcoal shadow-lift sm:px-[14mm] sm:py-[14mm] print:max-w-none print:p-0 print:shadow-none"
      >
        <header className="flex flex-col items-start gap-4 border-b border-mist pb-6 sm:flex-row sm:justify-between sm:gap-6 print:flex-row print:justify-between">
          <Logo width={220} priority className="w-[180px] sm:w-[220px] print:w-[220px]" />
          <div className="sm:text-right print:text-right">
            <h1 className="font-display text-xl font-bold text-navy">Capability statement</h1>
            <p className="mt-1 text-xs text-slate">{today}</p>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-[1.55fr_1fr] print:grid-cols-[1.55fr_1fr]">
          <div>
            <p className="font-display text-[1.45rem] leading-snug font-bold text-navy">{site.aim}</p>
            <p className="mt-3">{site.intro}</p>
            <p className="mt-3">
              <strong className="text-navy">Mission.</strong> {site.mission}
            </p>
          </div>
          <div className="rounded-xl bg-navy p-5 text-white">
            <p className="text-[0.7rem] font-bold tracking-[0.14em] text-white/60 uppercase">Company</p>
            <dl className="mt-3 space-y-2 text-[9.5pt]">
              <div>
                <dt className="text-white/60">Registered in</dt>
                <dd className="font-semibold">Zambia</dd>
              </div>
              <div>
                <dt className="text-white/60">Principal activity</dt>
                <dd className="font-semibold">
                  {site.legal.isic}, {site.legal.isicLabel}
                </dd>
              </div>
              {site.legal.pacraNumber && (
                <div>
                  <dt className="text-white/60">PACRA registration</dt>
                  <dd className="font-semibold">{site.legal.pacraNumber}</dd>
                </div>
              )}
              {site.legal.tpin && (
                <div>
                  <dt className="text-white/60">TPIN</dt>
                  <dd className="font-semibold">{site.legal.tpin}</dd>
                </div>
              )}
              <div>
                <dt className="text-white/60">Coverage</dt>
                <dd className="font-semibold">All ten provinces of Zambia; Southern and Eastern Africa</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mt-7">
          <Heading>Core services</Heading>
          <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2 print:grid-cols-2">
            {services.map((service) => (
              <li key={service.slug} className="break-inside-avoid">
                <p className="font-display font-bold text-navy">
                  <span className="mr-1.5 text-slate">{service.number}</span>
                  {service.title}
                </p>
                <p className="text-[9.5pt] text-slate">{service.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-7 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
          <div>
            <Heading>Method</Heading>
            <ol className="mt-3 space-y-1.5">
              {processSteps.map((step) => (
                <li key={step.number} className="text-[9.5pt]">
                  <strong className="text-navy">
                    {step.number} {step.title}.
                  </strong>{" "}
                  {step.headline}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <Heading>Sectors</Heading>
            <ul className="mt-3 grid grid-cols-1 gap-1 text-[9.5pt]">
              {sectors.map((sector) => (
                <li key={sector.slug} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.5} aria-hidden="true" />
                  {sector.title}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-7 grid gap-6 break-inside-avoid sm:grid-cols-2 print:grid-cols-2">
          <div>
            <Heading>Quality protocol</Heading>
            <ul className="mt-3 space-y-1 text-[9.5pt]">
              {qualityProtocol.map((item) => (
                <li key={item.title} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.5} aria-hidden="true" />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Heading>Ethics and data protection</Heading>
            <ul className="mt-3 space-y-1 text-[9.5pt]">
              {ethicsCommitments.map((item) => (
                <li key={item.title} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.5} aria-hidden="true" />
                  {item.title}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[8.5pt] text-slate">
              Compliant with the Data Protection Act No. 3 of 2021. We follow the ICC/ESOMAR International Code and the OECD DAC
              evaluation criteria.
            </p>
          </div>
        </section>

        <section className="mt-7 grid gap-6 break-inside-avoid sm:grid-cols-3 print:grid-cols-3">
          <div>
            <Heading>Who we work with</Heading>
            <ul className="mt-3 space-y-1 text-[9.5pt]">
              {clientTypes.map((client) => (
                <li key={client.title} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.5} aria-hidden="true" />
                  {client.title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Heading>Our team</Heading>
            <ul className="mt-3 space-y-1 text-[9.5pt]">
              {capabilities.map((capability) => (
                <li key={capability.title} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.5} aria-hidden="true" />
                  {capability.title}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[8.5pt] text-slate">Fieldwork in {fieldLanguages.slice(0, -1).join(", ")} and {fieldLanguages.at(-1)}.</p>
          </div>
          <div>
            <Heading>What you receive</Heading>
            <ul className="mt-3 space-y-1 text-[9.5pt]">
              {deliverables.map((item) => (
                <li key={item.title} className="flex gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-blue" strokeWidth={2.5} aria-hidden="true" />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-7 break-inside-avoid">
          <Heading>Why Primeresearch</Heading>
          <ul className="mt-3 grid gap-x-5 gap-y-2.5 text-[9.5pt] sm:grid-cols-3 print:grid-cols-3">
            {reasons.map((reason) => (
              <li key={reason.title}>
                <p className="font-display font-bold text-navy">{reason.title}</p>
                <p className="text-slate">{reason.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-8 flex flex-col gap-4 rounded-xl bg-navy px-6 py-5 text-white break-inside-avoid sm:flex-row sm:items-center sm:justify-between sm:gap-6 print:flex-row print:items-center print:justify-between">
          <div className="text-[9.5pt]">
            <p className="font-display text-base font-bold">Talk to us</p>
            <p className="mt-1 text-white/80">
              {site.contact.email} · {site.contact.phone}
            </p>
            <p className="text-white/80">
              {site.contact.address.street}, {site.contact.address.city}, {site.contact.address.country}
            </p>
          </div>
          <div className="text-[9.5pt] sm:text-right print:text-right">
            <p className="font-semibold">{site.url.replace(/^https?:\/\//, "")}</p>
            <p className="text-white/70">{site.tagline}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
