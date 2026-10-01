import { desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { toCsv } from "@/lib/csv";
import { getDb, schema } from "@/lib/db";
import { describePayload, kindLabels } from "@/lib/submission-fields";
import type { SubmissionKind } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  if (!(await getSession())) return new Response("Unauthorised", { status: 401 });
  const { type } = await params;
  const db = await getDb();
  const stamp = new Date().toISOString().slice(0, 10);

  if (type === "submissions") {
    const kind = request.nextUrl.searchParams.get("kind") as SubmissionKind | null;
    const rows = await db
      .select()
      .from(schema.submissions)
      .where(kind && kind in kindLabels ? eq(schema.submissions.kind, kind) : undefined)
      .orderBy(desc(schema.submissions.createdAt));
    const csv = toCsv(
      ["Reference", "Received", "Type", "Status", "Name", "Email", "Phone", "Organisation", "Subject", "Details", "Internal notes"],
      rows.map((row) => {
        let payload: Record<string, unknown> = {};
        try {
          payload = JSON.parse(row.payload) as Record<string, unknown>;
        } catch {
          payload = {};
        }
        const details = describePayload(payload)
          .map((item) => `${item.label}: ${item.value}`)
          .join("\n");
        return [row.reference, row.createdAt, kindLabels[row.kind], row.status, row.name, row.email, row.phone, row.organisation, row.subject, details, row.notes];
      }),
    );
    return csvResponse(csv, `primeresearch-submissions-${stamp}.csv`);
  }

  if (type === "subscribers") {
    const rows = await db
      .select()
      .from(schema.subscribers)
      .where(eq(schema.subscribers.status, "active"))
      .orderBy(desc(schema.subscribers.createdAt));
    const csv = toCsv(
      ["Email", "Name", "Source", "Subscribed"],
      rows.map((row) => [row.email, row.name, row.source, row.createdAt]),
    );
    return csvResponse(csv, `primeresearch-subscribers-${stamp}.csv`);
  }

  return new Response("Not found", { status: 404 });
}

function csvResponse(csv: string, filename: string) {
  return new Response(`﻿${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
