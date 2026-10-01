import { execFile } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { createClient } from "@libsql/client";
import { afterAll, describe, expect, it } from "vitest";
import { LATEST_MIGRATION, runMigrations } from "@/lib/db/migrations";

const run = promisify(execFile);
const dir = mkdtempSync(path.join(tmpdir(), "prc-db-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

async function inspect(url: string) {
  const client = createClient({ url });
  const versions = await client.execute("SELECT version FROM _migrations ORDER BY version");
  const articles = await client.execute("SELECT COUNT(*) AS total FROM articles WHERE status = 'published'");
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type = 'table'");
  client.close();
  return {
    versions: versions.rows.map((row) => Number(row.version)),
    articles: Number(articles.rows[0].total),
    tables: tables.rows.map((row) => String(row.name)),
  };
}

describe("runMigrations", () => {
  it("creates the schema and seeds articles once, and is safe to run again", async () => {
    const url = `file:${path.join(dir, "sequential.db")}`;
    const client = createClient({ url });
    await runMigrations(client, { isLocalFile: true });
    await runMigrations(client, { isLocalFile: true });
    client.close();

    const state = await inspect(url);
    expect(state.versions).toEqual(Array.from({ length: LATEST_MIGRATION }, (_, i) => i + 1));
    expect(state.articles).toBe(6);
    expect(state.tables).toEqual(expect.arrayContaining(["articles", "submissions", "subscribers", "_migrations"]));
  });

  it("is safe when several processes migrate the same database at once", async () => {
    const url = `file:${path.join(dir, "parallel.db")}`;
    const worker = path.resolve(__dirname, "../support/migrate-worker.ts");
    const tsx = path.resolve(__dirname, "../../node_modules/.bin/tsx");
    await Promise.all([1, 2, 3].map(() => run(tsx, [worker, url], { timeout: 60_000 })));

    const state = await inspect(url);
    expect(state.versions).toEqual(Array.from({ length: LATEST_MIGRATION }, (_, i) => i + 1));
    expect(state.articles).toBe(6);
  }, 90_000);
});
