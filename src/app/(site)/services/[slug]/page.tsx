import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarDays, Check, ShieldCheck } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { ServiceCard } from "@/components/sections/cards";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { FaqJsonLd, JsonLd } from "@/components/seo/json-ld";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { processSteps } from "@/content/approach";
import { getSector } from "@/content/sectors";
import { getService, services } from "@/content/services";
import { Icon } from "@/components/ui/icon";
import { absoluteUrl } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: `${service.title} | ${site.name}`, description: service.summary, url: `/services/${service.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const index = services.findIndex((item) => item.slug === service.slug);
  const related = [1, 2, 3].map((offset) => services[(index + offset) % services.length]);
  const sectorList = service.sectors.map(getSector).filter((sector) => sector !== undefined);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.summary,
          serviceType: service.title,
          url: absoluteUrl(`/services/${service.slug}`),
          areaServed: { "@type": "Country", name: "Zambia" },
          provider: { "@id": `${site.url}/#organization` },
        }}
      />
      <PageHero
        eyebrow={`Service ${service.number}`}
        title={service.title}
        lead={service.lead}
        crumbs={[
          { name: "Services", href: "/services" },
          { name: service.shortTitle, href: `/services/${service.slug}` },
        ]}
        aside={
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-sm">
            <p className="font-display text-xs font-bold tracking-[0.16em] text-white/55 uppercase">At a glance</p>
            <dl className="mt-5 space-y-5 text-sm">
              <div>
                <dt className="flex items-center gap-2 text-white/55">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  Typical timeline
                </dt>
                <dd className="mt-1 leading-relaxed text-white">{service.timeline}</dd>
              </div>
              <div>
                <dt className="text-white/55">Best for</dt>
                <dd className="mt-2 flex flex-wrap gap-1.5">
                  {service.audiences.map((audience) => (
                    <span key={audience} className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/85">
                      {audience}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/start-a-project?service=${service.slug}`} variant="gold" size="lg" arrow>
            Request a proposal
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline-light" size="lg">
            Talk to a researcher
          </ButtonLink>
        </div>
      </PageHero>

      <Section labelledBy="questions-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <SectionHeading
              id="questions-heading"
              eyebrow="Questions we help answer"
              title="Start with the question."
              lead={service.summary}
            />
            <Stagger as="ul" className="grid gap-3">
              {service.questions.map((question, i) => (
                <StaggerItem
                  as="li"
                  key={question}
                  className="flex items-start gap-5 rounded-card border border-mist bg-white p-6 transition-colors hover:border-blue/25"
                >
                  <span className="font-display text-sm font-bold text-blue tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-lg leading-snug font-semibold text-navy">{question}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="offer-heading">
        <Container>
          <SectionHeading id="offer-heading" eyebrow="What we deliver" title={`${service.shortTitle}, done properly.`} />
          <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {service.offerings.map((offering, i) => (
              <StaggerItem key={offering.title} className="group rounded-card border border-mist bg-white p-7 transition-all duration-500 hover:shadow-card">
                <span className="font-display text-xs font-bold tracking-[0.16em] text-slate/70 uppercase">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg leading-snug font-bold text-navy">{offering.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-slate">{offering.detail}</p>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <Reveal className="rounded-card border border-mist bg-white p-7">
              <h3 className="font-display text-lg font-bold text-navy">Methods and tools</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {service.methods.map((method) => (
                  <li key={method} className="rounded-full bg-blue-tint px-3.5 py-1.5 text-sm font-medium text-navy">
                    {method}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08} className="rounded-card border border-mist bg-white p-7">
              <h3 className="font-display text-lg font-bold text-navy">You receive</h3>
              <ul className="mt-5 space-y-3">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.95rem] text-charcoal">
                    <Check className="mt-0.5 size-4 shrink-0 text-blue" strokeWidth={2.25} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {service.note && (
            <Reveal className="mt-6">
              <div className="on-dark flex flex-col gap-5 rounded-card bg-navy p-7 text-white sm:flex-row sm:items-start sm:p-9">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
                  <ShieldCheck className="size-6 text-gold" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">{service.note.title}</h3>
                  <p className="mt-2 max-w-3xl leading-relaxed text-white/75">{service.note.body}</p>
                </div>
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      <Section labelledBy="method-heading">
        <Container>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              id="method-heading"
              eyebrow="How we work"
              title="Six stages, every time."
              lead="The same disciplined method sits behind every study, whatever its size."
            />
            <Reveal className="shrink-0">
              <ButtonLink href="/approach" variant="outline" arrow>
                Our approach in detail
              </ButtonLink>
            </Reveal>
          </div>
          <Stagger as="ol" className="mt-14 grid gap-px overflow-hidden rounded-[1.5rem] border border-mist bg-mist sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {processSteps.map((step) => {
              return (
                <StaggerItem as="li" key={step.number} className="bg-white p-6">
                  <div className="flex items-center justify-between">
                    <Icon name={step.icon} className="size-5 text-navy" strokeWidth={1.75} aria-hidden="true" />
                    <span className="font-display text-xs font-bold text-slate/60 tabular-nums">{step.number}</span>
                  </div>
                  <p className="mt-5 font-display text-lg font-bold text-navy">{step.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate">{step.output}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Container>
      </Section>

      {sectorList.length > 0 && (
        <Section tone="cloud" spacing="compact" labelledBy="sectors-heading">
          <Container>
            <h2 id="sectors-heading" className="font-display text-2xl font-bold text-navy">
              Sectors where we apply this work
            </h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {sectorList.map((sector) => {
                return (
                  <li key={sector.slug}>
                    <Link
                      href={`/sectors#${sector.slug}`}
                      className="group flex h-full items-center gap-4 rounded-card border border-mist bg-white p-5 transition-colors hover:border-blue/30"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-tint text-navy">
                        <Icon name={sector.icon} className="size-[1.1rem]" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-sm leading-snug font-semibold text-navy">{sector.title}</span>
                      <ArrowUpRight className="size-4 text-slate/50 group-hover:text-blue" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </Section>
      )}

      <Section labelledBy="service-faq-heading">
        <FaqJsonLd items={service.faqs} />
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading id="service-faq-heading" eyebrow="Questions" title={`About ${service.shortTitle.toLowerCase()}.`} />
            <Reveal>
              <Accordion items={service.faqs} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="related-heading">
        <Container>
          <h2 id="related-heading" className="font-display text-h3 font-bold text-navy">
            Related services
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <ServiceCard key={item.slug} service={item} />
            ))}
          </div>
        </Container>
      </Section>

      <CtaBand
        title={`Ready to discuss ${service.shortTitle.toLowerCase()}?`}
        lead="Tell us about the decision you face. We will reply within one working day with a suggested approach."
      />
    </>
  );
}
