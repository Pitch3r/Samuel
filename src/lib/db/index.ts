import "server-only";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { runMigrations } from "./migrations";

type Database = LibSQLDatabase<typeof schema>;

type Instance = { client: Client; db: Database; ready: Promise<void> };

const globalForDb = globalThis as unknown as { __primeresearchDb?: Instance };

export function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || "file:./data/primeresearch.db";
}

function createInstance(): Instance {
  const url = databaseUrl();
  const isLocalFile = url.startsWith("file:");

  if (isLocalFile) {
    const filePath = url.replace(/^file:/, "");
    if (filePath && filePath !== ":memory:") {
      mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
    }
  }

  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  const db = drizzle(client, { schema });
  const ready = runMigrations(client, { isLocalFile });

  // Allow a later request to retry if the first migration attempt fails.
  ready.catch((error) => {
    console.error("[db] migration failed", error);
    if (globalForDb.__primeresearchDb?.ready === ready) globalForDb.__primeresearchDb = undefined;
  });

  return { client, db, ready };
}

export async function getDb(): Promise<Database> {
  const instance = (globalForDb.__primeresearchDb ??= createInstance());
  await instance.ready;
  return instance.db;
}

export { schema };
