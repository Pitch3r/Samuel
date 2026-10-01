import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { arcPath } from "@/lib/geometry";
import type { Sector } from "@/content/sectors";
import type { Service } from "@/content/services";
import type { ArticleSummary } from "@/lib/articles";
import { Icon } from "@/components/ui/icon";
import { cn, formatDate } from "@/lib/utils";

export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border border-mist bg-white p-7 transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-blue/25 hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl border border-mist bg-cloud text-navy transition-colors duration-300 group-hover:border-blue/20 group-hover:bg-blue group-hover:text-white">
          <Icon name={service.icon} className="size-[1.35rem]" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="font-display text-sm font-bold text-slate/60 tabular-nums">{service.number}</span>
      </div>
      <h3 className="mt-6 font-display text-h3 font-bold text-navy">{service.title}</h3>
      <p className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-slate">{service.summary}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-blue">
        Explore
        <ArrowUpRight
          className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

export function SectorCard({ sector }: { sector: Sector }) {
  return (
    <article
      id={sector.slug}
      className="group relative flex h-full scroll-mt-28 flex-col rounded-card border border-mist bg-white p-6 transition-all duration-500 ease-out-expo hover:border-blue/25 hover:shadow-card"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-blue-tint text-navy transition-colors group-hover:bg-navy group-hover:text-white">
        <Icon name={sector.icon} className="size-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-lg leading-snug font-bold text-navy">{sector.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate">{sector.summary}</p>
    </article>
  );
}

// Start angle and sweep, chosen so the gold segment always falls inside the visible cover area.
const categoryArc: Record<string, [number, number]> = {
  Methods: [168, 48],
  Fieldwork: [192, 44],
  Evaluation: [214, 46],
  Analysis: [236, 42],
  Reporting: [180, 54],
  Academic: [204, 58],
};

/** Generated cover in the brand's graphic language, so articles never need stock photos. */
export function ArticleCover({ category, className, large = false }: { category: string; className?: string; large?: boolean }) {
  const [start, sweep] = categoryArc[category] ?? [190, 50];
  return (
    <div className={cn("relative overflow-hidden bg-navy", className)} aria-hidden="true">
      <div className="bg-grid-dark absolute inset-0 opacity-70" />
      <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <circle cx="330" cy="40" r="150" fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="26" />
        <path d={arcPath(330, 40, 150, start, start + sweep)} fill="none" stroke="#E4AC3F" strokeWidth="26" />
        <circle cx="330" cy="40" r="196" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.75" />
      </svg>
      <span
        className={cn(
          "absolute bottom-5 left-6 font-display font-bold tracking-[0.18em] text-white/80 uppercase",
          large ? "text-sm" : "text-[0.7rem]",
        )}
      >
        {category}
      </span>
    </div>
  );
}

export function ArticleCard({ article, className }: { article: ArticleSummary; className?: string }) {
  return (
    <Link
      href={`/insights/${article.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-mist bg-white transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-lift",
        className,
      )}
    >
      <ArticleCover category={article.category} className="aspect-[16/9] transition-transform duration-700 ease-out-expo" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs font-medium text-slate">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span aria-hidden="true" className="size-1 rounded-full bg-mist" />
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {article.readingMinutes} min read
          </span>
        </div>
        <h3 className="mt-3 font-display text-xl leading-snug font-bold text-navy transition-colors group-hover:text-blue">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-slate">{article.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-display text-sm font-semibold text-blue">
          Read article
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
