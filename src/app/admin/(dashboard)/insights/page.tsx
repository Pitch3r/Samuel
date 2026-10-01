import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus, Star } from "lucide-react";
import { PageTitle, StatusBadge } from "@/components/admin/ui";
import { listArticles } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatDate, readingMinutes } from "@/lib/utils";

export const metadata: Metadata = { title: "Insights" };

type Props = { searchParams: Promise<{ deleted?: string }> };

export default async function AdminInsightsPage({ searchParams }: Props) {
  await requireAdmin();
  const { deleted } = await searchParams;
  const articles = await listArticles();

  return (
    <div className="space-y-6">
      <PageTitle
        title="Insights"
        description="Write, edit and publish articles for the Insights section of the website."
        actions={
          <Link href="/admin/insights/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-blue px-4 font-display text-sm font-semibold text-white hover:bg-blue-dark">
            <Plus className="size-4" aria-hidden="true" />
            New article
          </Link>
        }
      />
      {deleted && <p className="rounded-xl bg-teal-tint px-4 py-3 text-sm text-teal-dark">The article was deleted.</p>}
      <div className="overflow-hidden rounded-2xl border border-mist bg-white">
        {articles.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate">No articles yet. Create your first one.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="bg-cloud text-xs text-slate">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Title</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Published</th>
                  <th scope="col" className="px-6 py-3 text-right font-semibold">Length</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-t border-mist hover:bg-cloud/60">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {article.featured && <Star className="size-4 shrink-0 fill-gold text-gold" aria-label="Featured" />}
                        <Link href={`/admin/insights/${article.id}`} className="font-semibold text-navy hover:text-blue">
                          {article.title}
                        </Link>
                        {article.status === "published" && (
                          <Link href={`/insights/${article.slug}`} target="_blank" aria-label="View on the website" className="text-slate hover:text-blue">
                            <ExternalLink className="size-3.5" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate">/insights/{article.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal">{article.category}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={article.status} label={article.status === "published" ? "Published" : "Draft"} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate">{article.publishedAt ? formatDate(article.publishedAt) : "Not yet"}</td>
                    <td className="px-6 py-3 text-right whitespace-nowrap text-slate">{readingMinutes(article.body)} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
