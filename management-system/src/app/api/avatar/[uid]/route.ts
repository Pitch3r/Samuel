import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { viewerOrNull } from "@/lib/auth/session";
import { getUser, updateProfile } from "@/lib/data/users";
import { logActivity } from "@/lib/data/activity";
import { nowISO } from "@/lib/data/core";
import { bucket } from "@/lib/firebase/admin";
import type { Viewer } from "@/lib/types";

/*
 * /api/avatar/[uid]: staff profile photos.
 *  GET     any signed-in person may view a colleague's photo (they appear on
 *          shared assignments). Streams the image from Firebase Storage.
 *  POST    upload a new photo (multipart field `photo`): the person themself
 *          or the administrator. JPEG, PNG or WebP up to 3 MB, checked by
 *          content as well as by declared type.
 *  DELETE  remove the photo: the person themself or the administrator.
 * The proxy does not run for /api, so every method checks the session (and
 * the office rules) itself through viewerOrNull.
 */

const MAX_BYTES = 3 * 1024 * 1024;
// Allows for the multipart envelope around the image itself.
const ENVELOPE_BYTES = 64 * 1024;

const TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;
type ImageType = keyof typeof TYPES;

type Reply = { ok: boolean; message: string };

function reply(status: number, body: Reply) {
  return NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });
}

const unauthorised = () => reply(401, { ok: false, message: "Please sign in again." });

/** A uid from the URL: non-empty, short and without path separators. */
function validUid(uid: string) {
  return uid.length > 0 && uid.length <= 128 && !uid.includes("/") && !uid.includes("..");
}

/** Rejects cross-site posts: browsers always send Origin on a POST or DELETE from another site. */
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

/** The image type from the file's first bytes, so a renamed file cannot pass as an image. */
function sniffImage(data: Buffer): ImageType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "image/jpeg";
  if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

function mayChange(viewer: Viewer, uid: string) {
  return viewer.isAdmin || viewer.uid === uid;
}

async function removeStored(path: string | null) {
  if (!path) return;
  await bucket()
    .file(path)
    .delete({ ignoreNotFound: true })
    .catch((error: unknown) => console.error("Could not delete old profile photo", error));
}

export async function GET(_request: Request, context: RouteContext<"/api/avatar/[uid]">) {
  const viewer = await viewerOrNull();
  if (!viewer) return unauthorised();

  const { uid } = await context.params;
  if (!validUid(uid)) return reply(404, { ok: false, message: "No photo." });
  const user = await getUser(uid);
  if (!user?.photoPath) return reply(404, { ok: false, message: "No photo." });

  const object = bucket().file(user.photoPath);
  const [exists] = await object.exists();
  if (!exists) return reply(404, { ok: false, message: "No photo." });
  const [metadata] = await object.getMetadata();
  const declared = String(metadata.contentType ?? "");
  // Only ever serve the image types we accept, whatever the stored metadata says.
  const contentType = Object.hasOwn(TYPES, declared) ? declared : "application/octet-stream";

  const body = Readable.toWeb(object.createReadStream()) as ReadableStream<Uint8Array>;
  const headers: Record<string, string> = {
    "content-type": contentType,
    "cache-control": "private, max-age=3600",
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; sandbox",
  };
  if (metadata.size) headers["content-length"] = String(metadata.size);
  return new Response(body, { headers });
}

export async function POST(request: Request, context: RouteContext<"/api/avatar/[uid]">) {
  const viewer = await viewerOrNull();
  if (!viewer) return unauthorised();
  if (!sameOrigin(request)) return reply(403, { ok: false, message: "Photos must be uploaded from the management system itself." });

  const { uid } = await context.params;
  if (!validUid(uid)) return reply(404, { ok: false, message: "That member of staff could not be found." });
  if (!mayChange(viewer, uid)) return reply(403, { ok: false, message: "You can only change your own photo." });

  const tooLarge = "Photos can be up to 3 MB.";
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BYTES + ENVELOPE_BYTES) return reply(413, { ok: false, message: tooLarge });

  const user = await getUser(uid);
  if (!user) return reply(404, { ok: false, message: "That member of staff could not be found." });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(400, { ok: false, message: "The photo could not be read. Please try again." });
  }
  const file = form.get("photo");
  if (!file || typeof file === "string") return reply(400, { ok: false, message: "Choose a photo to upload." });
  if (file.size === 0) return reply(400, { ok: false, message: "That file is empty." });
  if (file.size > MAX_BYTES) return reply(413, { ok: false, message: tooLarge });

  const data = Buffer.from(await file.arrayBuffer());
  const type = sniffImage(data);
  if (!type || !Object.hasOwn(TYPES, file.type)) return reply(415, { ok: false, message: "Use a JPEG, PNG or WebP image." });

  const photoPath = `profiles/${uid}/photo-${Date.now()}.${TYPES[type]}`;
  try {
    await bucket()
      .file(photoPath)
      .save(data, { resumable: false, contentType: type, metadata: { metadata: { uploadedBy: viewer.uid } } });
    await updateProfile(uid, { photoPath, photoUpdatedAt: nowISO() });
  } catch (error) {
    console.error(error);
    await removeStored(photoPath);
    return reply(500, { ok: false, message: "The photo could not be saved. Please try again." });
  }
  if (user.photoPath && user.photoPath !== photoPath) await removeStored(user.photoPath);

  const self = viewer.uid === uid;
  await logActivity(viewer, {
    action: "user.photo-updated",
    entityType: "user",
    entityId: uid,
    summary: self ? "Updated their profile photo" : `Updated the profile photo of ${user.displayName}`,
  });
  return reply(201, { ok: true, message: self ? "Your photo has been saved." : `Photo saved for ${user.displayName}.` });
}

export async function DELETE(request: Request, context: RouteContext<"/api/avatar/[uid]">) {
  const viewer = await viewerOrNull();
  if (!viewer) return unauthorised();
  if (!sameOrigin(request)) return reply(403, { ok: false, message: "Photos must be removed from the management system itself." });

  const { uid } = await context.params;
  if (!validUid(uid)) return reply(404, { ok: false, message: "That member of staff could not be found." });
  if (!mayChange(viewer, uid)) return reply(403, { ok: false, message: "You can only change your own photo." });

  const user = await getUser(uid);
  if (!user) return reply(404, { ok: false, message: "That member of staff could not be found." });
  if (!user.photoPath) return reply(200, { ok: true, message: "There was no photo to remove." });

  try {
    await updateProfile(uid, { photoPath: null, photoUpdatedAt: null });
  } catch (error) {
    console.error(error);
    return reply(500, { ok: false, message: "The photo could not be removed. Please try again." });
  }
  await removeStored(user.photoPath);

  const self = viewer.uid === uid;
  await logActivity(viewer, {
    action: "user.photo-removed",
    entityType: "user",
    entityId: uid,
    summary: self ? "Removed their profile photo" : `Removed the profile photo of ${user.displayName}`,
  });
  return reply(200, { ok: true, message: self ? "Your photo has been removed." : `Photo removed for ${user.displayName}.` });
}
