import { TableOfContents } from "@/components/insights/article-tools";
import { PageHero } from "@/components/sections/page-hero";
import { Container, Section } from "@/components/ui/container";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

export function LegalPage({
  title,
  lead,
  href,
  markdown,
  updated,
}: {
  title: string;
  lead: string;
  href: string;
  markdown: string;
  updated: string;
}) {
  const { html, headings } = renderMarkdown(markdown);
  return (
    <>
      <PageHero eyebrow="Legal" title={title} lead={lead} crumbs={[{ name: title, href }]}>
        <p className="text-sm text-white/60">Last updated {formatDate(updated)}</p>
      </PageHero>
      <Section spacing="compact" className="!pt-14 sm:!pt-16">
        <Container>
          <div className="mx-auto grid max-w-[68rem] gap-12 lg:grid-cols-[1fr_15rem] lg:gap-16">
            <div className="prose-prime max-w-[42rem]" dangerouslySetInnerHTML={{ __html: html }} />
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
