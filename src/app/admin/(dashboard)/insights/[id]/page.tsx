import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deleteArticle } from "@/app/admin/actions";
import { ArticleEditor } from "@/components/admin/article-editor";
import { ConfirmButton, PageTitle } from "@/components/admin/ui";
import { getArticle } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit article" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> };

export default async function EditArticlePage({ params, searchParams }: Props) {
  await requireAdmin();
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const article = await getArticle(Number(id));
  if (!article) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All articles
      </Link>
      <PageTitle
        title="Edit article"
        description={article.title}
        actions={
          <form action={deleteArticle}>
            <input type="hidden" name="id" value={article.id} />
            <ConfirmButton
              message="Delete this article permanently? It will be removed from the website."
              className="inline-flex h-10 items-center gap-2 rounded-full border border-danger/30 bg-white px-4 text-sm font-semibold text-danger hover:bg-danger-tint"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </ConfirmButton>
          </form>
        }
      />
      <ArticleEditor
        created={created === "1"}
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          category: article.category,
          author: article.author,
          body: article.body,
          status: article.status,
          featured: article.featured,
          publishedAt: article.publishedAt ? article.publishedAt.slice(0, 10) : "",
        }}
      />
    </div>
  );
}
