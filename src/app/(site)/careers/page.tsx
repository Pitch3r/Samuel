import type { Metadata } from "next";
import { CircleCheck, ShieldCheck } from "lucide-react";
import { PrimeArc } from "@/components/brand/prime-arc";
import { CareersForm } from "@/components/forms/careers-form";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { careerRoles, fieldPromises } from "@/content/careers";
import { getIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Careers and field network",
  description:
    "Join the Primeresearch field network as an enumerator, supervisor, analyst or research associate, anywhere in Zambia. Internships and attachments welcome.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Join our field network."
        lead="Good research depends on good people in the field. We work with enumerators, supervisors, analysts and associates across all ten provinces of Zambia."
        crumbs={[{ name: "Careers", href: "/careers" }]}
      >
        <ButtonLink href="#apply" variant="gold" size="lg" arrow>
          Apply now
        </ButtonLink>
      </PageHero>

      <Section labelledBy="roles-heading">
        <Container>
          <SectionHeading
            id="roles-heading"
            eyebrow="Roles"
            title="Where you could fit."
            lead="We build teams for each study, so we keep a register of trusted people we can call on across the country."
          />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careerRoles.map((role) => (
              <StaggerItem key={role.title} className="rounded-card border border-mist bg-white p-7">
                <IconTile icon={getIcon(role.icon)} tone="blue" />
                <h3 className="mt-5 font-display text-lg font-bold text-navy">{role.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-slate">{role.detail}</p>
              </StaggerItem>
            ))}
            <StaggerItem className="on-dark relative isolate flex flex-col justify-between gap-6 overflow-hidden rounded-card bg-navy p-7 text-white">
              <PrimeArc tone="dark" segmentSweep={0} className="-right-32 -bottom-40 -z-10 size-80" />
              <div>
                <p className="font-display text-xl leading-snug font-bold text-white">What we look for</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Honesty, care with detail and respect for respondents matter more to us than years of experience. We train for the
                  rest.
                </p>
              </div>
              <ButtonLink href="#apply" variant="gold" size="sm" arrow className="self-start">
                Register your interest
              </ButtonLink>
            </StaggerItem>
          </Stagger>
        </Container>
      </Section>

      <Section tone="cloud" spacing="compact" labelledBy="promises-heading">
        <Container>
          <h2 id="promises-heading" className="font-display text-h3 font-bold text-navy">
            What you can expect from us
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fieldPromises.map((promise) => (
              <li key={promise.title} className="flex gap-3">
                <CircleCheck className="mt-0.5 size-5 shrink-0 text-blue" strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <p className="font-display font-semibold text-navy">{promise.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate">{promise.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="apply" labelledBy="apply-heading" className="scroll-mt-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading
                id="apply-heading"
                eyebrow="Apply"
                title="Register your interest."
                lead="It takes about five minutes. We contact applicants when a study needs their skills, languages and location."
              />
              <Reveal className="mt-8 flex gap-3 rounded-card border border-mist bg-cloud p-5 text-sm leading-relaxed text-slate">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-navy" strokeWidth={1.75} aria-hidden="true" />
                <p>
                  We use your details only to consider you for studies, keep them secure, and delete them on request, in line with
                  Zambia&apos;s Data Protection Act No. 3 of 2021.
                </p>
              </Reveal>
            </div>
            <Reveal>
              <CareersForm />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
