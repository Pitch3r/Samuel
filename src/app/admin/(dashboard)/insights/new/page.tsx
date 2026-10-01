import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleEditor } from "@/components/admin/article-editor";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New article" };

export default async function NewArticlePage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <Link href="/admin/insights" className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All articles
      </Link>
      <PageTitle title="New article" description="Write in Markdown. Use the preview to check it before you publish." />
      <ArticleEditor
        article={{
          title: "",
          slug: "",
          excerpt: "",
          category: "Methods",
          author: "Primeresearch Consultants",
          body: "",
          status: "draft",
          featured: false,
          publishedAt: "",
        }}
      />
    </div>
  );
}
