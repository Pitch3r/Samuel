<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Primeresearch Management System rules

- All Firestore and Storage access goes through `src/lib/data/*` on the server, which enforces permissions with the viewer. Browsers never talk to Firebase directly (rules deny everything).
- Pages call `requireUser()` or `requireAdmin()` first; server actions call them before any `try`, then validate with `parseForm` and return `actionError(error)` on failure.
- Office access checks live in `src/lib/auth/session.ts` (every request) and `src/lib/auth/sign-in.ts` (sign-in). The administrator is never restricted.
- Avoid queries that need composite Firestore indexes: one `where` filter, sort in memory.
- House style: British English, sentence case, no em or en dashes (`npm run check:copy`). Brand: navy leads, blue and slate support, at most one gold accent, teal only in data.
- Run `npm run verify` before committing; `npm run test:e2e` for the office-access suite.
