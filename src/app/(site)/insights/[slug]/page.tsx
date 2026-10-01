import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { ReadingProgress, ShareButtons, TableOfContents } from "@/components/insights/article-tools";
import { Logo } from "@/components/brand/logo";
import { PrimeArc } from "@/components/brand/prime-arc";
import { ArticleCard } from "@/components/sections/cards";
import { CtaBand } from "@/components/sections/cta-band";
import { BreadcrumbJsonLd, JsonLd } from "@/components/seo/json-ld";
import { ButtonLink } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { site } from "@/config/site";
import { getPublishedArticle, listPublishedArticles, listRelatedArticles } from "@/lib/articles";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await listPublishedArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/insights/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `/insights/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: article.category,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getPublishedArticle(slug);
  if (!article) notFound();

  const { html, headings } = renderMarkdown(article.body);
  const related = await listRelatedArticles(article.slug, article.category);
  const url = absoluteUrl(`/insights/${article.slug}`);

  return (
    <>
      <ReadingProgress />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Insights", href: "/insights" },
          { name: article.title, href: `/insights/${article.slug}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          articleSection: article.category,
          author: { "@type": "Organization", name: article.author, url: site.url },
          publisher: { "@id": `${site.url}/#organization` },
          mainEntityOfPage: url,
        }}
      />

      <header className="on-dark relative isolate overflow-hidden bg-navy pt-36 pb-16 text-white sm:pt-40 sm:pb-20">
        <div aria-hidden="true" className="bg-grid-dark mask-fade-b absolute inset-0 -z-10 opacity-60" />
        <PrimeArc tone="dark" segmentStart={200} segmentSweep={46} className="-top-[22rem] -right-[20rem] -z-10 size-[46rem]" />
        <Container size="narrow">
          <Link href="/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white">
            <ArrowLeft className="size-4" aria-hidden="true" />
            All insights
          </Link>
          <p className="eyebrow mt-10">{article.category}</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,1.4rem+2.6vw,3.25rem)] leading-[1.08] font-bold tracking-[-0.03em] text-white">
            {article.title}
          </h1>
          <p className="mt-6 text-lead text-white/75">{article.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/65">
            <span className="font-semibold text-white">{article.author}</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-white/30" />
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true" className="size-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden="true" />
              {article.readingMinutes} min read
            </span>
          </div>
        </Container>
      </header>

      <Section spacing="compact" className="!pt-14 sm:!pt-16">
        <Container>
          <div className="mx-auto grid max-w-[68rem] gap-12 lg:grid-cols-[1fr_15rem] lg:gap-16">
            <article>
              <div className="prose-prime max-w-[42rem]" dangerouslySetInnerHTML={{ __html: html }} />

              <div className="mt-14 flex max-w-[42rem] flex-col gap-6 border-t border-mist pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-navy">Share this article</p>
                <ShareButtons title={article.title} url={url} />
              </div>

              <div className="mt-10 flex max-w-[42rem] flex-col gap-5 rounded-card bg-cloud p-7 ring-1 ring-mist sm:flex-row sm:items-center">
                <Logo layout="mark" width={36} className="shrink-0" />
                <div className="flex-1">
                  <p className="font-display font-bold text-navy">Written by {article.author}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate">
                    A Zambian research and advisory firm. We design studies, collect and analyse data, and turn findings into
                    decisions.
                  </p>
                </div>
                <ButtonLink href="/contact" variant="outline" size="sm">
                  Ask a question
                </ButtonLink>
              </div>
            </article>

            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-10">
                <TableOfContents headings={headings} />
                <div className="rounded-card bg-navy p-6 text-white">
                  <p className="font-display text-lg leading-snug font-bold text-white">Planning a study?</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">Tell us the decision you face. We reply within one working day.</p>
                  <ButtonLink href="/start-a-project" variant="gold" size="sm" arrow className="mt-5">
                    Request a proposal
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section tone="cloud" labelledBy="related-heading">
          <Container>
            <h2 id="related-heading" className="font-display text-h3 font-bold text-navy">
              Keep reading
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaBand />
    </>
  );
}
