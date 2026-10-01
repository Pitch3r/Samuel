import type { Metadata } from "next";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { LevelsExplorer } from "@/components/sections/levels-explorer";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { CommitmentsPanel } from "@/components/sections/why-us";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { deliverables, ethicsCommitments, qualityProtocol } from "@/content/approach";
import { getIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Our approach",
  description:
    "How Primeresearch works: a six-stage method, research at every level, a published quality protocol, and ethics and data protection built into every study.",
  alternates: { canonical: "/approach" },
};

export default function ApproachPage() {
  return (
    <>
      <PageHero
        eyebrow="Our approach"
        title="Rigour in. Clarity out."
        lead="The method is the same at every scale: a clear question, a design that can answer it, disciplined fieldwork, and findings that trace back to the evidence."
        crumbs={[{ name: "Approach", href: "/approach" }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#quality" variant="outline-light">
            Quality protocol
          </ButtonLink>
          <ButtonLink href="#ethics" variant="outline-light">
            Ethics and data protection
          </ButtonLink>
        </div>
      </PageHero>

      <Section labelledBy="method-heading">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-32 lg:self-start">
              <SectionHeading
                id="method-heading"
                eyebrow="Six stages"
                title="From your question to a decision you can defend."
                lead="You sign off before anything goes to the field, you see progress throughout, and every finding can be traced to its evidence."
              />
            </div>
            <ProcessTimeline />
          </div>
        </Container>
      </Section>

      <Section tone="navy" labelledBy="levels-heading" className="overflow-hidden">
        <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />
        <Container>
          <SectionHeading
            id="levels-heading"
            eyebrow="Research at every level"
            title="Matched to the weight of the decision."
            lead="By depth, by method, by client and by reach. Explore how we scale a study without lowering the standard."
          />
          <div className="mt-12">
            <LevelsExplorer />
          </div>
        </Container>
      </Section>

      <Section id="quality" labelledBy="quality-heading" className="scroll-mt-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading
              id="quality-heading"
              eyebrow="Quality protocol"
              title="Good analysis cannot rescue bad data."
              lead="So we check quality while fieldwork is still under way, not after it has finished. These eight checks apply to every primary data study we run."
            />
            <Stagger as="ol" className="grid gap-3 sm:grid-cols-2">
              {qualityProtocol.map((item, index) => (
                <StaggerItem as="li" key={item.title} className="rounded-card border border-mist bg-white p-6">
                  <span className="font-display text-sm font-bold text-blue tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-[1.05rem] leading-snug font-bold text-navy">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{item.detail}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Container>
      </Section>

      <Section id="ethics" tone="cloud" labelledBy="ethics-heading" className="scroll-mt-20">
        <Container>
          <SectionHeading
            id="ethics-heading"
            eyebrow="Ethics and data protection"
            title="Respect for every respondent."
            lead="People who answer our questions trust us with their time and their information. We protect both, in line with Zambian law and recognised international codes."
          />
          <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {ethicsCommitments.map((item) => (
              <StaggerItem key={item.title} className="rounded-card border border-mist bg-white p-7">
                <IconTile icon={getIcon(item.icon)} tone="blue" />
                <h3 className="mt-5 font-display text-lg font-bold text-navy">{item.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-slate">{item.detail}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section labelledBy="deliverables-heading">
        <Container>
          <SectionHeading
            id="deliverables-heading"
            eyebrow="What you receive"
            title="Outputs you can use, share and build on."
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
          <div className="mt-6">
            <CommitmentsPanel />
          </div>
          <Reveal className="mt-10 text-center">
            <ButtonLink href="/capability-statement" variant="outline" arrow>
              Download our capability statement
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
