import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ServiceCard } from "@/components/sections/cards";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { FaqJsonLd } from "@/components/seo/json-ld";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { deliverables } from "@/content/approach";
import { generalFaqs } from "@/content/faqs";
import { getService, services } from "@/content/services";
import { Icon } from "@/components/ui/icon";
import { getIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Research services",
  description:
    "Market research, opinion polling, monitoring and evaluation, policy research, data collection, data analysis, academic research support and training in Zambia.",
  alternates: { canonical: "/services" },
};

const tiers = [
  {
    title: "What we study",
    detail: "Four kinds of research question, each with its own methods and standards.",
    slugs: ["market-research", "opinion-polling-social-surveys", "monitoring-evaluation", "policy-economic-research"],
  },
  {
    title: "How we deliver",
    detail: "Our own field teams and analysts, so quality stays in one place.",
    slugs: ["data-collection-field-services", "data-analysis-reporting"],
  },
  {
    title: "How we build capacity",
    detail: "Support for researchers and teams who want to do more themselves.",
    slugs: ["academic-research-support", "research-training"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Research services for every decision."
        lead="Eight practice areas, delivered by one team, from the first question to the final presentation. Choose a service, or tell us the decision you face and we will design the study around it."
        crumbs={[{ name: "Services", href: "/services" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/start-a-project" variant="gold" size="lg" arrow>
            Request a proposal
          </ButtonLink>
          <ButtonLink href="/#study-finder" variant="outline-light" size="lg">
            Use the study finder
          </ButtonLink>
        </div>
      </PageHero>

      <Section labelledBy="all-services">
        <Container>
          <h2 id="all-services" className="sr-only">
            All services
          </h2>
          <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" stagger={0.06}>
            {services.map((service) => (
              <StaggerItem key={service.slug} className="h-full">
                <ServiceCard service={service} />
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="fit-heading">
        <Container>
          <SectionHeading
            id="fit-heading"
            eyebrow="How it fits together"
            title="One partner for the whole research cycle."
            lead="Most firms do one part of the job. We design, collect, analyse, report and train under one roof, which means fewer hand-offs and fewer errors."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <Reveal key={tier.title} delay={index * 0.08} className="h-full">
                <div className="flex h-full flex-col rounded-[1.5rem] border border-mist bg-white p-7">
                  <p className="font-display text-xs font-bold tracking-[0.16em] text-blue uppercase">Layer {index + 1}</p>
                  <h3 className="mt-3 font-display text-xl font-bold text-navy">{tier.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{tier.detail}</p>
                  <ul className="mt-6 space-y-2">
                    {tier.slugs.map((slug) => {
                      const service = getService(slug);
                      if (!service) return null;
                      return (
                        <li key={slug}>
                          <Link
                            href={`/services/${slug}`}
                            className="group flex items-center gap-3 rounded-xl border border-mist px-4 py-3 transition-colors hover:border-blue/30 hover:bg-blue-tint"
                          >
                            <Icon name={service.icon} className="size-[1.1rem] shrink-0 text-navy" strokeWidth={1.75} aria-hidden="true" />
                            <span className="flex-1 text-sm font-semibold text-navy">{service.shortTitle}</span>
                            <ArrowRight
                              className="size-4 text-slate/50 transition-transform group-hover:translate-x-0.5 group-hover:text-blue"
                              aria-hidden="true"
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section labelledBy="receive-heading">
        <Container>
          <SectionHeading
            id="receive-heading"
            eyebrow="What you receive"
            title="Clear deliverables, agreed at the start."
            lead="Every engagement ends with outputs you can use, share and build on."
          />
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {deliverables.map((item) => (
              <StaggerItem key={item.title} className="flex gap-5 rounded-card border border-mist p-6">
                <IconTile icon={getIcon(item.icon)} />
                <div>
                  <h3 className="font-display text-lg font-bold text-navy">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate">{item.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="faq-heading">
        <FaqJsonLd items={generalFaqs} />
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading
              id="faq-heading"
              eyebrow="Questions"
              title="Frequently asked questions."
              lead="Cannot find what you are looking for? Ask us directly and a researcher will reply within one working day."
            >
              <div className="mt-8">
                <ButtonLink href="/contact" variant="outline" arrow>
                  Ask a question
                </ButtonLink>
              </div>
            </SectionHeading>
            <Reveal>
              <Accordion items={generalFaqs} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
