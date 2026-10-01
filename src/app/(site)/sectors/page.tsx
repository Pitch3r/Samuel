import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { Container, Section } from "@/components/ui/container";
import { sectors } from "@/content/sectors";
import { getService } from "@/content/services";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Sectors",
  description:
    "Research for consumer goods, financial services, telecoms, agriculture, health, education, energy and mining, development, government and media in Zambia.",
  alternates: { canonical: "/sectors" },
};

export default function SectorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Sectors"
        title="Evidence for the sectors that shape Zambia."
        lead="Every sector has its own questions, stakeholders and standards of proof. We bring that context to every study, so the evidence fits the decision it is meant to inform."
        crumbs={[{ name: "Sectors", href: "/sectors" }]}
      />

      <Section labelledBy="sector-list-heading">
        <Container>
          <h2 id="sector-list-heading" className="sr-only">
            Sectors we serve
          </h2>
          <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
            <nav aria-label="Sectors" className="hidden lg:block">
              <ul className="sticky top-32 space-y-1 border-l border-mist">
                {sectors.map((sector) => (
                  <li key={sector.slug}>
                    <a
                      href={`#${sector.slug}`}
                      className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-slate transition-colors hover:border-blue hover:text-navy"
                    >
                      {sector.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-5">
              {sectors.map((sector, index) => {
                return (
                  <Reveal key={sector.slug} delay={Math.min(index, 2) * 0.04}>
                    <article
                      id={sector.slug}
                      className="grid scroll-mt-28 gap-8 rounded-[1.5rem] border border-mist bg-white p-7 transition-shadow duration-500 hover:shadow-card sm:p-9 md:grid-cols-[1fr_1fr]"
                    >
                      <div>
                        <div className="flex items-center gap-4">
                          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-navy text-white">
                            <Icon name={sector.icon} className="size-[1.35rem]" strokeWidth={1.75} aria-hidden="true" />
                          </span>
                          <span className="font-display text-xs font-bold text-slate/60 tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="mt-6 font-display text-[1.6rem] leading-tight font-bold text-navy">{sector.title}</h3>
                        <p className="mt-3 leading-relaxed text-slate">{sector.summary}</p>
                        <ul className="mt-6 flex flex-wrap gap-2">
                          {sector.services.map((slug) => {
                            const service = getService(slug);
                            if (!service) return null;
                            return (
                              <li key={slug}>
                                <Link
                                  href={`/services/${slug}`}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-mist px-3.5 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
                                >
                                  {service.shortTitle}
                                  <ArrowRight className="size-3" aria-hidden="true" />
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="rounded-2xl bg-cloud p-6">
                        <p className="font-display text-xs font-bold tracking-[0.16em] text-slate uppercase">Questions we answer</p>
                        <ul className="mt-4 space-y-4">
                          {sector.questions.map((question) => (
                            <li key={question} className="flex gap-3 font-display text-[1.05rem] leading-snug font-semibold text-navy">
                              <span aria-hidden="true" className="mt-3 h-px w-4 shrink-0 bg-blue" />
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      <CtaBand title="Working in a sector we have not listed?" lead="Our methods travel well. Tell us about your context and the decision you face." />
    </>
  );
}
