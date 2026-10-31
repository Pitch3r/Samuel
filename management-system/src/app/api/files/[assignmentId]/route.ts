import { NextResponse } from "next/server";
import { viewerOrNull } from "@/lib/auth/session";
import { addFile } from "@/lib/data/assignments";
import { NotAllowedError, NotFoundError } from "@/lib/data/core";
import { fileKindSchema } from "@/lib/validation";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";

/*
 * POST /api/files/[assignmentId]: upload one file to an assignment as
 * multipart form data with the fields `file` and `kind`. The proxy does not
 * run for /api, so this handler checks the session (and office rules) itself.
 */

type Body = { ok: true; message: string; file: { id: string; name: string; size: number; kind: string } } | { ok: false; message: string };

function reply(status: number, body: Body) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

/** Rejects cross-site posts: browsers always send Origin on a POST from another site. */
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Allows for the multipart envelope around the file itself.
const ENVELOPE_BYTES = 64 * 1024;

export async function POST(request: Request, context: RouteContext<"/api/files/[assignmentId]">) {
  const viewer = await viewerOrNull();
  if (!viewer) return reply(401, { ok: false, message: "Your session has ended. Please sign in again." });
  if (!sameOrigin(request)) return reply(403, { ok: false, message: "Uploads must come from the management system itself." });

  const { assignmentId } = await context.params;
  const tooLarge = `Files can be up to ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`;

  // Refuse oversized uploads before reading the body when the size is declared.
  // Browsers always send Content-Length for a form upload; refusing requests
  // without it means the size limit holds before anything is read.
  const declared = Number(request.headers.get("content-length") ?? "NaN");
  if (!Number.isFinite(declared) || declared <= 0) return reply(411, { ok: false, message: "The upload did not say how large it is. Please try again." });
  if (Number.isFinite(declared) && declared > MAX_UPLOAD_BYTES + ENVELOPE_BYTES) return reply(413, { ok: false, message: tooLarge });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { ok: false, message: "The upload could not be read. Please try again." });
  }

  const file = form.get("file");
  if (!file || typeof file === "string") return reply(400, { ok: false, message: "Choose a file to upload." });
  if (file.size === 0) return reply(400, { ok: false, message: "That file is empty." });
  if (file.size > MAX_UPLOAD_BYTES) return reply(413, { ok: false, message: tooLarge });

  const kind = fileKindSchema.safeParse(form.get("kind") ?? "other");
  if (!kind.success) return reply(400, { ok: false, message: "Choose what kind of file this is." });

  try {
    const record = await addFile(viewer, assignmentId, {
      name: file.name || "file",
      contentType: file.type,
      data: Buffer.from(await file.arrayBuffer()),
      kind: kind.data,
    });
    return reply(201, {
      ok: true,
      message: `Uploaded "${record.name}".`,
      file: { id: record.id, name: record.name, size: record.size, kind: record.kind },
    });
  } catch (error) {
    if (error instanceof NotFoundError) return reply(404, { ok: false, message: error.message });
    if (error instanceof NotAllowedError) return reply(403, { ok: false, message: error.message });
    console.error(error);
    return reply(500, { ok: false, message: "The file could not be saved. Please try again." });
  }
}
