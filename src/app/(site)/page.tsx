import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClientStrip } from "@/components/home/client-strip";
import { HomeHero } from "@/components/home/home-hero";
import { PrimeInsight } from "@/components/home/prime-insight";
import { ServicesExplorer } from "@/components/home/services-explorer";
import { StudyFinder } from "@/components/home/study-finder";
import { ToolsTeaser } from "@/components/home/tools-teaser";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CoverageMap } from "@/components/sections/coverage-map";
import { CtaBand } from "@/components/sections/cta-band";
import { LatestInsights } from "@/components/sections/latest-insights";
import { LevelsExplorer } from "@/components/sections/levels-explorer";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { CommitmentsPanel, ReasonsGrid } from "@/components/sections/why-us";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectors } from "@/content/sectors";
import { Icon } from "@/components/ui/icon";

export const revalidate = 600;

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ClientStrip />
      <PrimeInsight />

      <Section tone="cloud" labelledBy="services-heading">
        <Container>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              id="services-heading"
              eyebrow="What we do"
              title="Eight practice areas. One standard of rigour."
              lead="From a single survey question to a national, multi-year evaluation, every engagement follows the same discipline: a clear question, a design that can answer it, disciplined fieldwork and findings that trace back to the evidence."
            />
            <Reveal className="shrink-0">
              <ButtonLink href="/services" variant="outline" arrow>
                All services
              </ButtonLink>
            </Reveal>
          </div>
          <div className="mt-14">
            <ServicesExplorer />
          </div>
        </Container>
      </Section>

      <Section id="study-finder" labelledBy="finder-heading" className="scroll-mt-20">
        <Container>
          <SectionHeading
            id="finder-heading"
            eyebrow="Study finder"
            title="What do you need to know?"
            lead="Choose your goal and see the kind of study that would answer it: the approach, the methods, a typical timeline and what you would receive."
          />
          <div className="mt-14">
            <StudyFinder />
          </div>
        </Container>
      </Section>

      <Section tone="navy" labelledBy="levels-heading" className="overflow-hidden">
        <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />
        <Container>
          <SectionHeading
            id="levels-heading"
            eyebrow="Research at every level"
            title="The same discipline at every scale."
            lead="A single survey question or a national study. A two-week rapid assessment or a multi-year evaluation. A brief from a brand, or a methods problem for a doctoral candidate."
          />
          <div className="mt-12">
            <LevelsExplorer />
          </div>
        </Container>
      </Section>

      <Section labelledBy="process-heading">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading
                id="process-heading"
                eyebrow="How we work"
                title="Rigour in. Clarity out."
                lead="Six stages take every study from your question to a decision you can defend. You sign off before anything goes to the field, and you see progress at every step."
              />
              <Reveal delay={0.1} className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/approach" variant="navy" arrow>
                  Our approach
                </ButtonLink>
                <ButtonLink href="/approach#quality" variant="outline">
                  Quality and ethics
                </ButtonLink>
              </Reveal>
            </div>
            <ProcessTimeline />
          </div>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="sectors-heading">
        <Container>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              id="sectors-heading"
              eyebrow="Sectors"
              title="Knowledge of the sectors that shape Zambia."
              lead="We bring an understanding of how each sector works, who its stakeholders are and what evidence its decision makers need."
            />
            <Reveal className="shrink-0">
              <ButtonLink href="/sectors" variant="outline" arrow>
                Explore sectors
              </ButtonLink>
            </Reveal>
          </div>
          <Stagger className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" stagger={0.05}>
            {sectors.map((sector) => {
              return (
                <StaggerItem key={sector.slug} className="h-full">
                  <Link
                    href={`/sectors#${sector.slug}`}
                    className="group flex h-full flex-col justify-between gap-6 rounded-card border border-mist bg-white p-5 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-blue/25 hover:shadow-card"
                  >
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-xl bg-blue-tint text-navy transition-colors group-hover:bg-navy group-hover:text-white">
                        <Icon name={sector.icon} className="size-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <ArrowUpRight
                        className="size-4 text-slate/50 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="font-display text-[0.98rem] leading-snug font-bold text-navy">{sector.title}</p>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
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
            lead="From community and district studies to national samples across all ten provinces, in English and local languages. We also support assignments across Southern and Eastern Africa."
          />
          <div className="mt-14">
            <CoverageMap />
          </div>
        </Container>
      </Section>

      <Section labelledBy="why-heading">
        <Container>
          <SectionHeading
            id="why-heading"
            eyebrow="Why Primeresearch"
            title="Research you can stand behind."
            lead="Clients come to us for evidence that holds up: in the boardroom, in front of a donor, and in the viva."
          />
          <div className="mt-14 space-y-6">
            <ReasonsGrid />
            <CommitmentsPanel />
          </div>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="tools-heading">
        <Container>
          <SectionHeading
            id="tools-heading"
            eyebrow="Tools"
            title="Start with the numbers."
            lead="How many interviews does your study need? Try our free calculator, then tell us about your project."
          />
          <div className="mt-14">
            <ToolsTeaser />
          </div>
        </Container>
      </Section>

      <Section labelledBy="insights-heading">
        <Container>
          <LatestInsights />
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
