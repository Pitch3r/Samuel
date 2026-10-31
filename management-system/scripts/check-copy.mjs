#!/usr/bin/env node
/**
 * House style guard: the copy must not contain em dashes (U+2014)
 * or en dashes (U+2013). Run with `npm run check:copy`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOTS = ["src", "scripts", "README.md"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".md", ".json", ".txt", ".webmanifest"]);
const SKIP_DIRS = new Set(["node_modules", ".next", "fonts"]);
const FORBIDDEN = /[–—]/;

function* walk(target) {
  let stats;
  try {
    stats = statSync(target);
  } catch {
    return;
  }
  if (stats.isDirectory()) {
    for (const entry of readdirSync(target)) {
      if (SKIP_DIRS.has(entry)) continue;
      yield* walk(path.join(target, entry));
    }
  } else if (EXTENSIONS.has(path.extname(target)) || path.basename(target) === "README.md") {
    yield target;
  }
}

const problems = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      if (FORBIDDEN.test(line)) {
        const char = line.match(FORBIDDEN)[0] === "—" ? "em dash" : "en dash";
        problems.push(`${file}:${index + 1}: ${char}: ${line.trim().slice(0, 120)}`);
      }
    });
  }
}

if (problems.length) {
  console.error(`Found ${problems.length} forbidden dash(es):\n${problems.join("\n")}`);
  process.exit(1);
}
console.log("Copy check passed: no em or en dashes found.");
