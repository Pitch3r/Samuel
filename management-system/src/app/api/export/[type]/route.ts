import { viewerOrNull } from "@/lib/auth/session";
import { csvResponse, toCsv } from "@/lib/csv";
import { resolvePeriod } from "@/lib/period";
import { EXPORTS, exportFilename, isExportType } from "@/components/reports/exports";
import { SHEETS } from "../_lib/builders";

/*
 * GET /api/export/[type]?from=YYYY-MM-DD&to=YYYY-MM-DD (or ?period=this-month, &uid= for one
 * person, and ?period=all on assignments for the full history)
 * CSV downloads for reports and records.
 *  - assignments, performance: administrator only (whole team).
 *  - time, reports, attendance: the administrator gets the whole team; an
 *    employee gets only their own records (the data layer scopes by viewer).
 * The proxy does not run for /api, so the session and office rules are
 * checked here through viewerOrNull.
 */

function reply(status: number, message: string) {
  return new Response(message, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}

export async function GET(request: Request, context: RouteContext<"/api/export/[type]">) {
  const viewer = await viewerOrNull();
  if (!viewer) return reply(401, "Please sign in again.");

  const { type } = await context.params;
  if (!isExportType(type)) return reply(404, "There is no export of that kind.");
  if (!viewer.isAdmin && !EXPORTS[type].employees) return reply(403, "Only the administrator can download this export.");

  // The first value of each query parameter, as resolvePeriod expects from a page.
  const params: Record<string, string> = {};
  for (const [key, value] of new URL(request.url).searchParams) if (!Object.hasOwn(params, key)) params[key] = value;

  try {
    const { period } = resolvePeriod(params, "this-month");
    // ?uid= narrows the administrator's export to one person; employees always get their own.
    const uid = viewer.isAdmin && params.uid ? params.uid : undefined;
    const allTime = type === "assignments" && params.period === "all";
    const sheet = await SHEETS[type](viewer, period, { uid, allTime });
    const filename = allTime ? `primeresearch-${type}-all.csv` : exportFilename(type, period);
    return csvResponse(filename, toCsv(sheet.rows, sheet.columns));
  } catch (error) {
    console.error(error);
    return reply(500, "The export could not be prepared. Please try again.");
  }
}
