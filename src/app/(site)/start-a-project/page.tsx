import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { ProjectWizardLoader } from "@/components/forms/project-wizard-loader";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { Container, Section } from "@/components/ui/container";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Request a proposal",
  description: "Plan your study in five minutes. Tell Primeresearch the decision you face and receive a proposal with method, workplan and budget.",
  alternates: { canonical: "/start-a-project" },
};

type Props = { searchParams: Promise<{ goal?: string | string[]; service?: string | string[] }> };

const nextSteps = [
  { title: "We review your brief", detail: "A researcher reads it and replies within one working day." },
  { title: "A short scoping call", detail: "We clarify the decision, audience, timeline and budget together." },
  { title: "A written proposal", detail: "Method, sample, workplan, team and a transparent budget." },
  { title: "You decide", detail: "No obligation. Many clients refine the scope with us first." },
];

export default async function StartProjectPage({ searchParams }: Props) {
  const params = await searchParams;
  const goal = typeof params.goal === "string" ? params.goal : undefined;
  const service = typeof params.service === "string" ? params.service : undefined;

  return (
    <>
      <PageHero
        eyebrow="Request a proposal"
        title="Plan your study."
        lead="Five short steps. Tell us the decision you face and we will propose the study to answer it, with a clear method, workplan and transparent budget."
        crumbs={[{ name: "Request a proposal", href: "/start-a-project" }]}
      />

      <Section labelledBy="wizard-heading" className="!pt-14 sm:!pt-16">
        <Container>
          <h2 id="wizard-heading" className="sr-only">
            Proposal request form
          </h2>
          <div className="grid gap-8 lg:grid-cols-[1.45fr_0.8fr] lg:gap-10">
            <ProjectWizardLoader initialGoal={goal} initialService={service} />
            <Reveal delay={0.1} className="space-y-5">
              <div className="rounded-[1.75rem] border border-mist bg-cloud p-7">
                <p className="font-display text-lg font-bold text-navy">What happens next</p>
                <ol className="relative mt-6 space-y-6">
                  <span aria-hidden="true" className="absolute top-2 bottom-2 left-[0.6875rem] w-px bg-mist" />
                  {nextSteps.map((item, index) => (
                    <li key={item.title} className="relative flex gap-4">
                      <span className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full bg-navy font-display text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-display font-semibold text-navy">{item.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="on-dark rounded-[1.75rem] bg-navy p-7 text-white">
                <p className="font-display text-lg font-bold text-white">Prefer to talk?</p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">Call or email us and a researcher will help you shape the brief.</p>
                <div className="mt-5 space-y-3 text-sm">
                  <a href={`tel:${site.contact.phoneHref}`} className="flex items-center gap-3 text-white/85 hover:text-white">
                    <Phone className="size-4 text-gold" aria-hidden="true" />
                    {site.contact.phone}
                  </a>
                  <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 text-white/85 hover:text-white">
                    <Mail className="size-4 text-gold" aria-hidden="true" />
                    {site.contact.email}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
