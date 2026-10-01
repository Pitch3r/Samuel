import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { InsightsLibrary } from "@/components/insights/insights-library";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { Reveal } from "@/components/motion/reveal";
import { ArticleCover } from "@/components/sections/cards";
import { CtaBand } from "@/components/sections/cta-band";
import { PageHero } from "@/components/sections/page-hero";
import { Container, Section } from "@/components/ui/container";
import { site } from "@/config/site";
import { listPublishedArticles } from "@/lib/articles";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical guidance on research methods, sampling, fieldwork quality, evaluation design and reporting from Primeresearch Consultants.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const articles = await listPublishedArticles();
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const rest = articles.filter((article) => article.slug !== featured?.slug);

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Practical guidance on methods and evidence."
        lead="Short, useful articles on sampling, fieldwork quality, evaluation design and reporting, written by researchers for anyone who commissions or uses research."
        crumbs={[{ name: "Insights", href: "/insights" }]}
      />

      {featured && (
        <Section spacing="compact" labelledBy="featured-heading" className="!pb-0">
          <Container>
            <h2 id="featured-heading" className="sr-only">
              Featured article
            </h2>
            <Reveal>
              <Link
                href={`/insights/${featured.slug}`}
                className="group grid overflow-hidden rounded-[1.75rem] border border-mist bg-white transition-shadow duration-500 hover:shadow-lift lg:grid-cols-[1.1fr_1fr]"
              >
                <ArticleCover category={featured.category} large className="min-h-64 lg:min-h-[22rem]" />
                <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                  <p className="font-display text-xs font-bold tracking-[0.16em] text-blue uppercase">Featured · {featured.category}</p>
                  <h3 className="mt-4 font-display text-[1.75rem] leading-tight font-bold text-navy transition-colors group-hover:text-blue sm:text-[2rem]">
                    {featured.title}
                  </h3>
                  <p className="mt-4 leading-relaxed text-slate">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate">
                    <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                    <span aria-hidden="true" className="size-1 rounded-full bg-mist" />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {featured.readingMinutes} min read
                    </span>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-blue">
                    Read the article
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </Container>
        </Section>
      )}

      <Section labelledBy="library-heading">
        <Container>
          <h2 id="library-heading" className="font-display text-h3 font-bold text-navy">
            The library
          </h2>
          <div className="mt-8">
            <InsightsLibrary articles={rest} />
          </div>
        </Container>
      </Section>

      <Section tone="cloud" spacing="compact" labelledBy="newsletter-heading">
        <Container size="narrow" className="text-center">
          <p className="eyebrow justify-center">{site.newsletterName}</p>
          <h2 id="newsletter-heading" className="mt-4 font-display text-h3 font-bold text-navy">
            Get the next article in your inbox.
          </h2>
          <p className="mt-3 text-slate">A short monthly note on methods, data and what the evidence says. No spam.</p>
          <div className="mx-auto mt-8 max-w-lg text-left">
            <NewsletterForm source="insights" tone="light" />
          </div>
        </Container>
      </Section>

      <CtaBand />
    </>
  );
}
