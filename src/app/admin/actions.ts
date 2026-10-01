"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authConfigProblem, checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { getDb, schema } from "@/lib/db";
import { submissionStatuses } from "@/lib/admin-data";
import { articleCategories } from "@/lib/article-categories";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { slugify } from "@/lib/utils";

export type LoginState = { error?: string; email?: string } | undefined;

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const problem = authConfigProblem();
  if (problem) return { error: problem };

  const ip = clientIp(await headers());
  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return { error: `Too many sign-in attempts. Please try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter your email and password.", email };
  if (!checkCredentials(email, password)) return { error: "That email and password do not match.", email };

  await createSession();
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* Submissions */

export type ActionState = { ok?: boolean; error?: string; message?: string } | undefined;

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(submissionStatuses as [string, ...string[]]),
  notes: z.string().max(10000).default(""),
});

export async function updateSubmission(_previous: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { error: "Please choose a valid status." };

  const db = await getDb();
  await db
    .update(schema.submissions)
    .set({
      status: parsed.data.status as (typeof submissionStatuses)[number],
      notes: parsed.data.notes,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.submissions.id, parsed.data.id));

  revalidatePath("/admin", "layout");
  return { ok: true, message: "Saved." };
}

export async function deleteSubmission(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const db = await getDb();
  await db.delete(schema.submissions).where(eq(schema.submissions.id, id));
  revalidatePath("/admin", "layout");
  redirect("/admin/submissions?deleted=1");
}

/* Subscribers */

export async function setSubscriberStatus(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") === "active" ? "active" : "unsubscribed";
  if (!Number.isInteger(id) || id <= 0) return;
  const db = await getDb();
  await db.update(schema.subscribers).set({ status, updatedAt: new Date().toISOString() }).where(eq(schema.subscribers.id, id));
  revalidatePath("/admin/subscribers");
}

export async function deleteSubscriber(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const db = await getDb();
  await db.delete(schema.subscribers).where(eq(schema.subscribers.id, id));
  revalidatePath("/admin/subscribers");
}

/* Insights */

const articleSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(5, { error: "Please add a title of at least 5 characters." }).max(160),
  slug: z.string().trim().max(80).optional().default(""),
  excerpt: z.string().trim().min(20, { error: "Please add a short summary (at least 20 characters)." }).max(300),
  category: z.enum(articleCategories, { error: "Please choose a category." }),
  author: z.string().trim().min(2).max(120).default("Primeresearch Consultants"),
  body: z.string().trim().min(100, { error: "The article body needs at least 100 characters." }).max(100000),
  status: z.enum(["draft", "published"]),
  featured: z.boolean().default(false),
  publishedAt: z.string().trim().optional().default(""),
});

export type ArticleState =
  | { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; id?: number; status?: "draft" | "published" }
  | undefined;

function revalidateInsights(slugs: string[]) {
  revalidatePath("/");
  revalidatePath("/insights");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) revalidatePath(`/insights/${slug}`);
  revalidatePath("/admin", "layout");
}

export async function saveArticle(_previous: ArticleState, formData: FormData): Promise<ArticleState> {
  await requireAdmin();
  const parsed = articleSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    author: formData.get("author") || "Primeresearch Consultants",
    body: formData.get("body"),
    status: formData.get("status") === "published" ? "published" : "draft",
    featured: formData.get("featured") === "on",
    publishedAt: formData.get("publishedAt") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { error: "Please check the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;
  const slug = slugify(data.slug || data.title);
  if (!slug) return { error: "Please add a title or slug.", fieldErrors: { slug: "Could not create a web address from this title." } };

  const db = await getDb();
  const clash = await db
    .select({ id: schema.articles.id })
    .from(schema.articles)
    .where(data.id ? and(eq(schema.articles.slug, slug), ne(schema.articles.id, data.id)) : eq(schema.articles.slug, slug))
    .get();
  if (clash) return { error: "Another article already uses this web address.", fieldErrors: { slug: "Choose a different slug." } };

  const now = new Date().toISOString();
  const existing = data.id
    ? await db.select().from(schema.articles).where(eq(schema.articles.id, data.id)).get()
    : undefined;
  if (data.id && !existing) return { error: "This article no longer exists." };

  const publishedAt =
    data.status === "published"
      ? data.publishedAt
        ? new Date(`${data.publishedAt}T08:00:00+02:00`).toISOString()
        : (existing?.publishedAt ?? now)
      : (existing?.publishedAt ?? null);

  if (data.featured) {
    await db.update(schema.articles).set({ featured: false }).where(eq(schema.articles.featured, true));
  }

  const values = {
    slug,
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    author: data.author,
    body: data.body,
    status: data.status,
    featured: data.featured,
    publishedAt,
    updatedAt: now,
  };

  let id = data.id;
  if (existing) {
    await db.update(schema.articles).set(values).where(eq(schema.articles.id, existing.id));
  } else {
    const inserted = await db
      .insert(schema.articles)
      .values({ ...values, createdAt: now })
      .returning({ id: schema.articles.id });
    id = inserted[0]?.id;
  }

  revalidateInsights([slug, ...(existing && existing.slug !== slug ? [existing.slug] : [])]);
  if (!existing && id) redirect(`/admin/insights/${id}?created=1`);
  return { ok: true, id, status: data.status };
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  const db = await getDb();
  const existing = await db.select().from(schema.articles).where(eq(schema.articles.id, id)).get();
  if (!existing) redirect("/admin/insights");
  await db.delete(schema.articles).where(eq(schema.articles.id, id));
  revalidateInsights([existing.slug]);
  redirect("/admin/insights?deleted=1");
}

/** Renders article Markdown exactly as the public site will, for the editor preview. */
export async function previewArticle(markdown: string): Promise<string> {
  await requireAdmin();
  const { renderMarkdown } = await import("@/lib/markdown");
  return renderMarkdown(String(markdown ?? "").slice(0, 100000)).html;
}
