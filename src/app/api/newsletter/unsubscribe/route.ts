import { NextResponse, type NextRequest } from "next/server";
import { unsubscribe } from "@/lib/newsletter";

async function handle(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  let ok = false;
  try {
    ok = await unsubscribe(token);
  } catch (error) {
    console.error("[newsletter] unsubscribe failed", error);
  }
  const target = new URL(`/newsletter/unsubscribed?status=${ok ? "done" : "invalid"}`, request.nextUrl.origin);
  return NextResponse.redirect(target, { status: 303 });
}

/** Link in the email footer. */
export const GET = handle;

/** RFC 8058 one-click unsubscribe from mail clients. */
export const POST = handle;
