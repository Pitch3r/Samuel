import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/tokens";

/**
 * Optimistic gate: reads only the signed session cookie. Every page, action
 * and route handler still runs the full session and office checks itself.
 */
const PUBLIC = ["/login", "/setup"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return NextResponse.next();
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/login", request.url);
    if (pathname !== "/" && pathname !== "/dashboard") url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Route handlers under /api check the session themselves and answer 401; keeping them
  // out of the proxy also avoids buffering file uploads.
  matcher: ["/((?!api/|_next/|brand/|favicon.ico|icon.svg|apple-icon.png).*)"],
};
