import type { Metadata } from "next";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { TrainingCatalogue } from "@/components/training/training-catalogue";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { IconTile } from "@/components/ui/icon-tile";
import { SectionHeading } from "@/components/ui/section-heading";
import { trainingFormats } from "@/content/training";
import { getIcon } from "@/lib/icons";

export const metadata: Metadata = {
  title: "Research training",
  description:
    "Practical courses in research methods, survey design, SPSS, Stata, R, NVivo, monitoring and evaluation and Power BI, in Lusaka, in-house or online.",
  alternates: { canonical: "/training" },
};

export default function TrainingPage() {
  return (
    <>
      <PageHero
        eyebrow="Research training"
        title="Build research skills that last."
        lead="Practical courses for organisations and universities, built around real datasets and the software your team actually uses. Delivered in Lusaka, at your premises or online."
        crumbs={[{ name: "Training", href: "/training" }]}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="#enquire" variant="gold" size="lg" arrow>
            Enquire about training
          </ButtonLink>
          <ButtonLink href="/services/research-training" variant="outline-light" size="lg">
            About our approach
          </ButtonLink>
        </div>
      </PageHero>

      <Section spacing="compact" labelledBy="formats-heading">
        <Container>
          <h2 id="formats-heading" className="sr-only">
            Formats
          </h2>
          <Stagger className="grid gap-5 md:grid-cols-3">
            {trainingFormats.map((format) => (
              <StaggerItem key={format.title} className="flex gap-5 rounded-card border border-mist bg-white p-6">
                <IconTile icon={getIcon(format.icon)} />
                <div>
                  <h3 className="font-display text-lg font-bold text-navy">{format.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate">{format.detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section tone="cloud" labelledBy="courses-heading">
        <Container>
          <SectionHeading
            id="courses-heading"
            eyebrow="Courses"
            title="A practical curriculum, from first principles to dashboards."
            lead="Every course can be tailored to your sector, your data and your team's starting point."
          />
          <div className="mt-12">
            <TrainingCatalogue />
          </div>
        </Container>
      </Section>

      <CtaBand title="Want a programme built around your team?" lead="We design in-house training around your data, systems and goals." />
    </>
  );
}
