"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ExternalLink, Eye, LoaderCircle, PenLine, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { previewArticle, saveArticle, type ArticleState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-controls";
import { articleCategories } from "@/lib/article-categories";
import { cn, readingMinutes, slugify } from "@/lib/utils";

export type EditableArticle = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  body: string;
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string;
};

export function ArticleEditor({ article, created }: { article: EditableArticle; created?: boolean }) {
  const [state, action, pending] = useActionState<ArticleState, FormData>(saveArticle, undefined);
  const [title, setTitle] = useState(article.title);
  const [slug, setSlug] = useState(article.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(article.slug));
  const [excerpt, setExcerpt] = useState(article.excerpt);
  const [body, setBody] = useState(article.body);
  const [submitting, setSubmitting] = useState<"published" | "draft">(article.status);
  const status = state?.status ?? article.status;
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [preview, setPreview] = useState("");
  const [previewing, startPreview] = useTransition();
  const e = state?.fieldErrors ?? {};

  useEffect(() => {
    if (state?.ok) toast.success(state.status === "published" ? "Saved and published" : "Draft saved");
    else if (state?.error) toast.error(state.error);
  }, [state]);

  const announced = useRef(false);
  useEffect(() => {
    if (!created || announced.current) return;
    announced.current = true;
    toast.success("Article created");
    // Drop ?created=1 so a refresh does not announce it again.
    window.history.replaceState(null, "", window.location.pathname);
  }, [created]);

  useEffect(() => {
    if (tab !== "preview") return;
    const timer = setTimeout(() => startPreview(async () => setPreview(await previewArticle(body))), 250);
    return () => clearTimeout(timer);
  }, [tab, body]);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      {article.id && <input type="hidden" name="id" value={article.id} />}

      <div className="space-y-6 rounded-2xl border border-mist bg-white p-6 sm:p-8">
        <Field label="Title" htmlFor="title" required error={e.title}>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            invalid={Boolean(e.title)}
            className="font-display text-lg font-semibold"
          />
        </Field>
        <Field label="Web address" htmlFor="slug" error={e.slug} hint={`/insights/${effectiveSlug || "your-article"}`}>
          <Input
            id="slug"
            name="slug"
            value={effectiveSlug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            invalid={Boolean(e.slug)}
          />
        </Field>
        <Field label="Summary" htmlFor="excerpt" required error={e.excerpt} hint={`${excerpt.length} of 300 characters. Shown on cards and in search results.`}>
          <Textarea id="excerpt" name="excerpt" rows={3} maxLength={300} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} invalid={Boolean(e.excerpt)} />
        </Field>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="body" className="text-sm font-semibold text-navy">
              Article<span className="ml-0.5 text-blue">*</span>
            </label>
            <div role="tablist" aria-label="Editor mode" className="flex gap-1 rounded-full bg-cloud p-1 ring-1 ring-mist">
              {(
                [
                  ["write", "Write", PenLine],
                  ["preview", "Preview", Eye],
                ] as const
              ).map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
                    tab === key ? "bg-white text-navy shadow-card" : "text-slate hover:text-navy",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className={cn("mt-3", tab !== "write" && "hidden")}>
            <Textarea
              id="body"
              name="body"
              rows={24}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              invalid={Boolean(e.body)}
              className="font-mono text-sm leading-relaxed"
            />
            <p className="mt-2 text-xs leading-relaxed text-slate">
              Markdown: <code>## Heading</code>, <code>**bold**</code>, <code>- list item</code>, <code>&gt; key takeaway</code>,{" "}
              <code>[link](/contact)</code> and tables. Avoid em dashes; use commas, colons or full stops.
            </p>
            {e.body && <p className="mt-2 text-xs font-medium text-danger">{e.body}</p>}
          </div>
          {tab === "preview" && (
            <div className="mt-3 min-h-96 rounded-xl border border-mist p-6">
              {previewing && !preview ? (
                <p className="flex items-center gap-2 text-sm text-slate">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Rendering preview
                </p>
              ) : (
                <div className="prose-prime" dangerouslySetInnerHTML={{ __html: preview }} />
              )}
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="space-y-5 rounded-2xl border border-mist bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-navy">Publishing</p>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", status === "published" ? "bg-teal-tint text-teal-dark" : "bg-cloud text-slate")}>
              {status === "published" ? "Published" : "Draft"}
            </span>
          </div>
          <Field label="Category" htmlFor="category" required error={e.category}>
            <Select id="category" name="category" defaultValue={article.category} options={articleCategories} invalid={Boolean(e.category)} />
          </Field>
          <Field label="Author" htmlFor="author" error={e.author}>
            <Input id="author" name="author" defaultValue={article.author} />
          </Field>
          <Field label="Publication date" htmlFor="publishedAt" hint="Leave blank to use today when you publish.">
            <Input id="publishedAt" name="publishedAt" type="date" defaultValue={article.publishedAt} />
          </Field>
          <label className="flex items-start gap-3 text-sm text-charcoal">
            <input type="checkbox" name="featured" defaultChecked={article.featured} className="mt-0.5 size-4 accent-blue" />
            Feature this article at the top of the Insights page
          </label>
          <p className="text-xs text-slate">
            {words.toLocaleString("en-GB")} words · about {readingMinutes(body)} min read
          </p>
          <div className="flex flex-col gap-2 border-t border-mist pt-5">
            <Button type="submit" name="status" value="published" onClick={() => setSubmitting("published")} disabled={pending}>
              {pending && submitting === "published" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              {status === "published" ? "Update and publish" : "Publish"}
            </Button>
            <Button type="submit" name="status" value="draft" variant="outline" onClick={() => setSubmitting("draft")} disabled={pending}>
              {pending && submitting === "draft" ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
              {status === "published" ? "Unpublish and save as draft" : "Save draft"}
            </Button>
            {article.id && status === "published" && (
              <Link
                href={`/insights/${article.slug}`}
                target="_blank"
                className="mt-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-blue hover:text-navy"
              >
                View on the website
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </form>
  );
}
