import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { viewerOrNull } from "@/lib/auth/session";
import { getFileFor } from "@/lib/data/assignments";
import { bucket } from "@/lib/firebase/admin";

/*
 * GET /api/files/[assignmentId]/[fileId]: downloads a file. getFileFor only
 * returns the file when the viewer may see the assignment, so a guessed link
 * gives a 404 rather than revealing that the file exists.
 */

function notFound(message = "That file could not be found.") {
  return NextResponse.json({ ok: false, message }, { status: 404, headers: { "cache-control": "no-store" } });
}

/** RFC 6266 / RFC 5987: a plain ASCII fallback plus the exact UTF-8 name. */
function contentDisposition(name: string) {
  const fallback = name.replace(/[^\x20-\x7e]+/g, "_").replace(/["\\]/g, "_") || "download";
  const encoded = encodeURIComponent(name).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(_request: Request, context: RouteContext<"/api/files/[assignmentId]/[fileId]">) {
  const viewer = await viewerOrNull();
  if (!viewer) return NextResponse.json({ ok: false, message: "Please sign in again." }, { status: 401, headers: { "cache-control": "no-store" } });

  const { assignmentId, fileId } = await context.params;
  const file = await getFileFor(viewer, assignmentId, fileId);
  if (!file) return notFound();

  const object = bucket().file(file.storagePath);
  const [exists] = await object.exists();
  if (!exists) return notFound("That file is missing from storage. Ask the person who uploaded it to upload it again.");

  const body = Readable.toWeb(object.createReadStream()) as ReadableStream<Uint8Array>;
  return new Response(body, {
    headers: {
      "content-type": file.contentType || "application/octet-stream",
      "content-length": String(file.size),
      "content-disposition": contentDisposition(file.name),
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      // Never let an uploaded file run as a page on this origin, even if opened directly.
      "content-security-policy": "default-src 'none'; sandbox",
    },
  });
}
