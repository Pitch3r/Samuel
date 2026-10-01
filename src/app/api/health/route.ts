import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

/** Uptime check for hosting dashboards and monitors. */
export async function GET() {
  let database: "ok" | "error" = "ok";
  try {
    const db = await getDb();
    await db.run(sql`SELECT 1`);
  } catch {
    database = "error";
  }
  return Response.json(
    { ok: database === "ok", database, email: emailConfigured() ? "configured" : "not configured", time: new Date().toISOString() },
    { status: database === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
