import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/sections/cards";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { listPublishedArticles } from "@/lib/articles";

export async function LatestInsights({
  title = "Practical guidance on methods and evidence.",
  exclude,
}: {
  title?: string;
  exclude?: string;
}) {
  const articles = (await listPublishedArticles(4)).filter((article) => article.slug !== exclude).slice(0, 3);
  if (!articles.length) return null;

  return (
    <>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading eyebrow="Insights" title={title} id="insights-heading" />
        <Link
          href="/insights"
          className="group inline-flex shrink-0 items-center gap-1.5 font-display text-sm font-semibold text-blue hover:text-navy"
        >
          All insights
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
      <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <StaggerItem key={article.slug} className="h-full">
            <ArticleCard article={article} />
          </StaggerItem>
        ))}
      </Stagger>
    </>
  );
}
