import "server-only";
import { and, desc, eq, ne } from "drizzle-orm";
import { seedArticles } from "@/content/insights-seed";
import { getDb, schema } from "@/lib/db";
import { readingMinutes } from "@/lib/utils";

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  featured: boolean;
  readingMinutes: number;
};

export type ArticleFull = ArticleSummary & { body: string; updatedAt: string };

function toSummary(row: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string | null;
  featured: boolean;
  body: string;
}): ArticleSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    author: row.author,
    publishedAt: row.publishedAt ?? new Date().toISOString(),
    featured: row.featured,
    readingMinutes: readingMinutes(row.body),
  };
}

/** Used if the database is unreachable, so public pages never break. */
function seedFallback(): ArticleFull[] {
  return seedArticles
    .map((article) => {
      const publishedAt = new Date(`${article.publishedAt}T08:00:00+02:00`).toISOString();
      return {
        ...toSummary({ ...article, publishedAt }),
        body: article.body.trim(),
        updatedAt: publishedAt,
      };
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function listPublishedArticles(limit = 100): Promise<ArticleSummary[]> {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(schema.articles)
      .where(eq(schema.articles.status, "published"))
      .orderBy(desc(schema.articles.publishedAt))
      .limit(limit);
    return rows.map(toSummary);
  } catch (error) {
    console.error("[articles] list failed, using seed content", error);
    return seedFallback().slice(0, limit);
  }
}

export async function getPublishedArticle(slug: string): Promise<ArticleFull | null> {
  try {
    const db = await getDb();
    const row = await db
      .select()
      .from(schema.articles)
      .where(and(eq(schema.articles.slug, slug), eq(schema.articles.status, "published")))
      .get();
    if (!row) return null;
    return { ...toSummary(row), body: row.body, updatedAt: row.updatedAt };
  } catch (error) {
    console.error("[articles] get failed, using seed content", error);
    return seedFallback().find((article) => article.slug === slug) ?? null;
  }
}

export async function listRelatedArticles(slug: string, category: string, limit = 3): Promise<ArticleSummary[]> {
  try {
    const db = await getDb();
    const sameCategory = await db
      .select()
      .from(schema.articles)
      .where(and(eq(schema.articles.status, "published"), eq(schema.articles.category, category), ne(schema.articles.slug, slug)))
      .orderBy(desc(schema.articles.publishedAt))
      .limit(limit);
    if (sameCategory.length >= limit) return sameCategory.map(toSummary);
    const others = await db
      .select()
      .from(schema.articles)
      .where(and(eq(schema.articles.status, "published"), ne(schema.articles.slug, slug)))
      .orderBy(desc(schema.articles.publishedAt))
      .limit(limit + sameCategory.length);
    const seen = new Set(sameCategory.map((row) => row.slug));
    return [...sameCategory, ...others.filter((row) => !seen.has(row.slug))].slice(0, limit).map(toSummary);
  } catch {
    return seedFallback()
      .filter((article) => article.slug !== slug)
      .slice(0, limit);
  }
}
