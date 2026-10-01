import type { Client, Transaction } from "@libsql/client";
import { seedArticles } from "@/content/insights-seed";

type Migration = {
  version: number;
  name: string;
  statements?: string[];
  run?: (tx: Transaction) => Promise<void>;
};

/**
 * Versioned, append-only migrations. Never edit a released migration:
 * add a new one with the next version number instead.
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "initial schema",
    statements: [
      `CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL UNIQUE,
        kind TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        organisation TEXT NOT NULL DEFAULT '',
        subject TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        payload TEXT NOT NULL DEFAULT '{}',
        notes TEXT NOT NULL DEFAULT '',
        ip_hash TEXT NOT NULL DEFAULT '',
        user_agent TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS submissions_kind_idx ON submissions (kind)`,
      `CREATE INDEX IF NOT EXISTS submissions_status_idx ON submissions (status)`,
      `CREATE INDEX IF NOT EXISTS submissions_created_idx ON submissions (created_at)`,
      `CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        token TEXT NOT NULL UNIQUE,
        source TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'Methods',
        author TEXT NOT NULL DEFAULT 'Primeresearch Consultants',
        body TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft',
        featured INTEGER NOT NULL DEFAULT 0,
        published_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status, published_at)`,
    ],
  },
  {
    version: 2,
    name: "seed insights",
    run: async (tx) => {
      const now = new Date().toISOString();
      for (const article of seedArticles) {
        await tx.execute({
          sql: `INSERT OR IGNORE INTO articles
            (slug, title, excerpt, category, author, body, status, featured, published_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, ?)`,
          args: [
            article.slug,
            article.title,
            article.excerpt,
            article.category,
            article.author,
            article.body.trim(),
            article.featured ? 1 : 0,
            new Date(`${article.publishedAt}T08:00:00+02:00`).toISOString(),
            now,
            now,
          ],
        });
      }
    },
  },
];

export const LATEST_MIGRATION = MIGRATIONS[MIGRATIONS.length - 1].version;

function isBusy(error: unknown) {
  const text = String((error as { code?: string; message?: string })?.code ?? "") + String((error as Error)?.message ?? "");
  return /BUSY|LOCKED/i.test(text);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Applies pending migrations inside a write transaction (BEGIN IMMEDIATE), so
 * parallel build workers or app instances wait for each other rather than
 * racing. Busy errors are retried with backoff.
 */
export async function runMigrations(client: Client, { isLocalFile }: { isLocalFile: boolean }) {
  if (isLocalFile) {
    await client.execute("PRAGMA busy_timeout = 8000").catch(() => undefined);
    await client.execute("PRAGMA journal_mode = WAL").catch(() => undefined);
  }

  for (let attempt = 1; ; attempt++) {
    try {
      await client.execute(
        "CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)",
      );
      const current = await client.execute("SELECT COALESCE(MAX(version), 0) AS version FROM _migrations");
      if (Number(current.rows[0]?.version ?? 0) >= LATEST_MIGRATION) return;

      const tx = await client.transaction("write");
      try {
        const applied = await tx.execute("SELECT version FROM _migrations");
        const done = new Set(applied.rows.map((row) => Number(row.version)));
        for (const migration of MIGRATIONS) {
          if (done.has(migration.version)) continue;
          for (const statement of migration.statements ?? []) {
            await tx.execute(statement);
          }
          await migration.run?.(tx);
          await tx.execute({
            sql: "INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)",
            args: [migration.version, migration.name, new Date().toISOString()],
          });
        }
        await tx.commit();
      } catch (error) {
        await tx.rollback().catch(() => undefined);
        throw error;
      } finally {
        tx.close();
      }
      return;
    } catch (error) {
      if (attempt < 12 && isBusy(error)) {
        await sleep(150 * attempt);
        continue;
      }
      throw error;
    }
  }
}
