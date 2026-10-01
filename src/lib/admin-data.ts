import "server-only";
import { and, count, desc, eq, gte, like, or, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db/schema";
import type { SubmissionKind } from "@/lib/validation";

export const PAGE_SIZE = 20;

export const statusLabels: Record<SubmissionStatus, string> = {
  new: "New",
  in_progress: "In progress",
  responded: "Responded",
  closed: "Closed",
};

export const submissionStatuses = Object.keys(statusLabels) as SubmissionStatus[];
export const submissionKinds: SubmissionKind[] = ["contact", "proposal", "training", "careers"];

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

export async function getDashboardData() {
  const db = await getDb();
  const since = daysAgo(29).toISOString();
  const weekAgo = daysAgo(6).toISOString();

  const [byKind, byStatus, recent, perDay, subscriberCounts, articleCounts, lastWeek] = await Promise.all([
    db.select({ kind: schema.submissions.kind, total: count() }).from(schema.submissions).groupBy(schema.submissions.kind),
    db.select({ status: schema.submissions.status, total: count() }).from(schema.submissions).groupBy(schema.submissions.status),
    db.select().from(schema.submissions).orderBy(desc(schema.submissions.createdAt)).limit(6),
    db
      .select({ day: sql<string>`substr(${schema.submissions.createdAt}, 1, 10)`, total: count() })
      .from(schema.submissions)
      .where(gte(schema.submissions.createdAt, since))
      .groupBy(sql`substr(${schema.submissions.createdAt}, 1, 10)`),
    db.select({ status: schema.subscribers.status, total: count() }).from(schema.subscribers).groupBy(schema.subscribers.status),
    db.select({ status: schema.articles.status, total: count() }).from(schema.articles).groupBy(schema.articles.status),
    db.select({ total: count() }).from(schema.submissions).where(gte(schema.submissions.createdAt, weekAgo)),
  ]);

  const dayMap = new Map(perDay.map((row) => [row.day, Number(row.total)]));
  const series = Array.from({ length: 30 }, (_, index) => {
    const date = daysAgo(29 - index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, total: dayMap.get(key) ?? 0 };
  });

  const kindTotals = Object.fromEntries(submissionKinds.map((kind) => [kind, 0])) as Record<SubmissionKind, number>;
  for (const row of byKind) kindTotals[row.kind] = Number(row.total);
  const statusTotals = Object.fromEntries(submissionStatuses.map((status) => [status, 0])) as Record<SubmissionStatus, number>;
  for (const row of byStatus) statusTotals[row.status] = Number(row.total);

  return {
    kindTotals,
    statusTotals,
    totalSubmissions: Object.values(kindTotals).reduce((sum, value) => sum + value, 0),
    lastSevenDays: Number(lastWeek[0]?.total ?? 0),
    recent,
    series,
    activeSubscribers: Number(subscriberCounts.find((row) => row.status === "active")?.total ?? 0),
    publishedArticles: Number(articleCounts.find((row) => row.status === "published")?.total ?? 0),
    draftArticles: Number(articleCounts.find((row) => row.status === "draft")?.total ?? 0),
  };
}

export async function listSubmissions({
  kind,
  status,
  q,
  page = 1,
}: {
  kind?: string;
  status?: string;
  q?: string;
  page?: number;
}) {
  const db = await getDb();
  const filters: SQL[] = [];
  if (kind && (submissionKinds as string[]).includes(kind)) filters.push(eq(schema.submissions.kind, kind as SubmissionKind));
  if (status && (submissionStatuses as string[]).includes(status)) filters.push(eq(schema.submissions.status, status as SubmissionStatus));
  if (q?.trim()) {
    const term = `%${q.trim().replace(/[%_]/g, "")}%`;
    const match = or(
      like(schema.submissions.name, term),
      like(schema.submissions.email, term),
      like(schema.submissions.organisation, term),
      like(schema.submissions.reference, term),
      like(schema.submissions.subject, term),
    );
    if (match) filters.push(match);
  }
  const where = filters.length ? and(...filters) : undefined;
  const safePage = Math.max(1, Math.floor(page) || 1);

  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(schema.submissions)
      .where(where)
      .orderBy(desc(schema.submissions.createdAt))
      .limit(PAGE_SIZE)
      .offset((safePage - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(schema.submissions).where(where),
  ]);

  const total = Number(totals[0]?.total ?? 0);
  return { rows, total, page: safePage, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getSubmission(id: number) {
  const db = await getDb();
  return db.select().from(schema.submissions).where(eq(schema.submissions.id, id)).get();
}

export async function listSubscribers() {
  const db = await getDb();
  return db.select().from(schema.subscribers).orderBy(desc(schema.subscribers.createdAt));
}

export async function listArticles() {
  const db = await getDb();
  return db.select().from(schema.articles).orderBy(desc(schema.articles.updatedAt));
}

export async function getArticle(id: number) {
  const db = await getDb();
  return db.select().from(schema.articles).where(eq(schema.articles.id, id)).get();
}

export async function newSubmissionCount() {
  const db = await getDb();
  const rows = await db.select({ total: count() }).from(schema.submissions).where(eq(schema.submissions.status, "new"));
  return Number(rows[0]?.total ?? 0);
}
