import type { Metadata } from "next";
import { BadgeCheck, Compass, Eye, Target } from "lucide-react";
import { PrimeArc } from "@/components/brand/prime-arc";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CoverageMap } from "@/components/sections/coverage-map";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/config/site";
import { capabilities, fieldLanguages, values } from "@/content/company";
import { getIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Primeresearch Consultants is a Zambian research and advisory firm registered under ISIC 7320, market research and public opinion polling. Based in Lusaka.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="We find the insight that matters."
        lead="Primeresearch Consultants is a Zambian research and advisory firm. We design studies, collect and analyse data, and turn findings into decisions for businesses, public institutions, development partners and the academic community."
        crumbs={[{ name: "About", href: "/about" }]}
      />

      <Section labelledBy="story-heading">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div>
              <SectionHeading id="story-heading" eyebrow="Who we are" title="A professional research consultancy, registered in Zambia." />
              <Reveal className="mt-8 space-y-5 text-[1.05rem] leading-relaxed text-charcoal">
                <p>
                  Primeresearch Consultants is registered in Zambia under ISIC Class 7320, Market research and public opinion
                  polling, within Section M: Professional, scientific and technical activities. That classification describes our
                  core work: investigating market potential, product acceptance and customer behaviour, and measuring public
                  opinion on economic, social and political questions, with full statistical analysis of the results.
                </p>
                <p>
                  Our practice reaches across every level of research. We handle a single survey question or a national
                  multi-district study; a two-week rapid assessment or a multi-year evaluation; a commercial brief for a brand or a
                  methodology problem for a doctoral candidate.
                </p>
                <p>
                  The method is the same at every scale: a clear question, a design that can answer it, disciplined fieldwork, and
                  findings that trace back to the evidence. We are based in Lusaka, work throughout Zambia, and support assignments
                  across Southern and Eastern Africa.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.1}>
              <div className="relative overflow-hidden rounded-[1.75rem] border border-mist bg-cloud p-8">
                <PrimeArc tone="light" segmentStart={120} segmentSweep={50} hairline={false} className="-right-28 -bottom-28 size-72" />
                <BadgeCheck className="size-8 text-blue" strokeWidth={1.75} aria-hidden="true" />
                <p className="mt-5 font-display text-xs font-bold tracking-[0.16em] text-slate uppercase">Registration</p>
                <p className="mt-2 font-display text-2xl font-bold text-navy">{site.legal.isic}</p>
                <p className="mt-1 text-slate">{site.legal.isicLabel}</p>
                <dl className="relative mt-7 space-y-4 border-t border-mist pt-6 text-sm">
                  <div>
                    <dt className="text-slate">Section</dt>
                    <dd className="mt-0.5 font-semibold text-navy">{site.legal.section}</dd>
                  </div>
                  <div>
                    <dt className="text-slate">Registered in</dt>
                    <dd className="mt-0.5 font-semibold text-navy">Zambia</dd>
                  </div>
                  {site.legal.pacraNumber && (
                    <div>
                      <dt className="text-slate">PACRA registration</dt>
                      <dd className="mt-0.5 font-semibold text-navy">{site.legal.pacraNumber}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-slate">Office</dt>
                    <dd className="mt-0.5 font-semibold text-navy">
                      {site.contact.address.city}, {site.contact.address.country}
                    </dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="purpose-heading">
        <Container>
          <SectionHeading id="purpose-heading" eyebrow="Our purpose" title="What we are here to do." align="center" className="mx-auto" />
          <Stagger className="mt-14 grid gap-5 lg:grid-cols-3" stagger={0.1}>
            <StaggerItem className="on-dark relative overflow-hidden rounded-[1.75rem] bg-navy p-8 text-white lg:row-span-1">
              <Target className="size-7 text-gold" strokeWidth={1.75} aria-hidden="true" />
              <p className="mt-6 font-display text-xs font-bold tracking-[0.16em] text-white/55 uppercase">Our aim</p>
              <p className="mt-3 font-display text-[1.75rem] leading-tight font-bold text-white">{site.aim}</p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                From a student&apos;s thesis to a ministry&apos;s policy, the decisions people make deserve evidence they can
                trust. That is the standard we hold ourselves to.
              </p>
            </StaggerItem>
            <StaggerItem className="rounded-[1.75rem] border border-mist bg-white p-8">
              <Compass className="size-7 text-navy" strokeWidth={1.75} aria-hidden="true" />
              <p className="mt-6 font-display text-xs font-bold tracking-[0.16em] text-slate uppercase">Our mission</p>
              <p className="mt-3 font-display text-xl leading-snug font-bold text-navy">{site.mission}</p>
            </StaggerItem>
            <StaggerItem className="rounded-[1.75rem] border border-mist bg-white p-8">
              <Eye className="size-7 text-navy" strokeWidth={1.75} aria-hidden="true" />
              <p className="mt-6 font-display text-xs font-bold tracking-[0.16em] text-slate uppercase">Our vision</p>
              <p className="mt-3 font-display text-xl leading-snug font-bold text-navy">{site.vision}</p>
            </StaggerItem>
          </Stagger>
        </Container>
      </Section>

      <Section labelledBy="values-heading">
        <Container>
          <SectionHeading
            id="values-heading"
            eyebrow="Our values"
            title="Four values, applied to every study."
            lead="They shape how we design, how we report and how we work with the people who commission our research."
          />
          <Stagger as="ol" className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-mist bg-mist sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <StaggerItem as="li" key={value.title} className="bg-white p-8">
                <span className="font-display text-5xl font-extrabold text-mist">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-display text-2xl font-bold text-navy">{value.title}</h3>
                <p className="mt-3 leading-relaxed text-slate">{value.detail}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="people-heading">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading
              id="people-heading"
              eyebrow="Our people"
              title="The team behind the evidence."
              lead="Every study is led by an accountable researcher and delivered by people who are trained for it, from the statistician who designs the sample to the enumerator who asks the questions."
            >
              <div className="mt-8 flex flex-wrap gap-2">
                {fieldLanguages.map((language) => (
                  <span key={language} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy ring-1 ring-mist">
                    {language}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm text-slate">Languages used in our fieldwork, with translation checked by back-translation.</p>
              <div className="mt-8">
                <ButtonLink href="/careers" variant="outline" arrow>
                  Join our field network
                </ButtonLink>
              </div>
            </SectionHeading>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((item) => (
                <StaggerItem key={item.title} className="flex gap-4 rounded-card border border-mist bg-white p-6">
                  <IconTile icon={getIcon(item.icon)} size="sm" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-navy">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">{item.detail}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </Section>

      <Section tone="navy" labelledBy="coverage-heading" className="overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_36rem_at_20%_40%,rgb(43_103_197/0.22),transparent_60%)]"
        />
        <Container>
          <SectionHeading
            id="coverage-heading"
            eyebrow="Where we work"
            title="Based in Lusaka. Working throughout Zambia."
            lead="Our teams work in English and local languages across all ten provinces. Select a province to see its capital and main languages."
          />
          <div className="mt-14">
            <CoverageMap />
          </div>
        </Container>
      </Section>

      <CtaBand title="Let us find the insight that matters to you." />
    </>
  );
}
