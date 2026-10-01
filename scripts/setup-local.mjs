#!/usr/bin/env node
/**
 * One-time setup for running the site on this computer: creates .env.local from
 * .env.example with a generated admin password and session secret, so the admin
 * dashboard also works with `npm run preview`. It never overwrites an existing
 * .env.local. Run with `npm run setup`.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const TARGET = ".env.local";

if (existsSync(TARGET)) {
  console.log(`${TARGET} already exists, so nothing was changed.`);
  console.log("Sign in to the admin dashboard with the ADMIN_EMAIL and ADMIN_PASSWORD in that file.");
  process.exit(0);
}

const password = randomBytes(12).toString("base64url");
const secret = randomBytes(32).toString("hex");
const settings = readFileSync(".env.example", "utf8")
  .replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${password}`)
  .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${secret}`);
writeFileSync(TARGET, settings, { mode: 0o600 });

const email = settings.match(/^ADMIN_EMAIL=(.*)$/m)?.[1].trim();
console.log(`Created ${TARGET} with settings for this computer.

  Admin dashboard   http://localhost:3000/admin
  Email             ${email}
  Password          ${password}

Keep the password private. You can change both in ${TARGET} at any time.
Next, run "npm run dev" for a quick preview or "npm run preview" for full speed.`);
