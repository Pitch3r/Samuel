"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { ArticleCard } from "@/components/sections/cards";
import type { ArticleSummary } from "@/lib/articles";
import { cn } from "@/lib/utils";

export function InsightsLibrary({ articles }: { articles: ArticleSummary[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => ["All", ...Array.from(new Set(articles.map((article) => article.category))).sort()], [articles]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter(
      (article) =>
        (category === "All" || article.category === category) &&
        (!q || `${article.title} ${article.excerpt} ${article.category}`.toLowerCase().includes(q)),
    );
  }, [articles, category, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by topic" className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                category === item ? "border-navy bg-navy text-white" : "border-mist bg-white text-charcoal hover:border-navy/40",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
          <label htmlFor="insight-search" className="sr-only">
            Search insights
          </label>
          <input
            id="insight-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search insights"
            className="w-full rounded-full border border-mist bg-white py-2.5 pr-10 pl-11 text-sm focus:border-blue focus:ring-4 focus:ring-blue/15 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-slate hover:bg-cloud"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-slate" aria-live="polite">
        {filtered.length === 1 ? "1 article" : `${filtered.length} articles`}
        {category !== "All" && ` in ${category}`}
        {query && ` matching "${query}"`}
      </p>

      <motion.div layout className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((article) => (
            <motion.div
              key={article.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-card border border-dashed border-mist p-10 text-center">
          <p className="font-display text-lg font-semibold text-navy">No articles match your search yet.</p>
          <p className="mt-2 text-sm text-slate">Try another topic, or ask us directly. We are always happy to talk methods.</p>
        </div>
      )}
    </div>
  );
}
