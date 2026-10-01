import { after } from "next/server";
import { subscribe, sendWelcome } from "@/lib/newsletter";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { json, looksLikeSpam, readJson } from "@/lib/submissions";
import { fieldErrorsFrom, newsletterSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const limit = rateLimit(`newsletter:${clientIp(request.headers)}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return json(
      { ok: false, error: "rate_limited", message: "Too many attempts. Please try again in a few minutes." },
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = newsletterSchema.safeParse(body.data);
  if (!parsed.success) {
    return json(
      { ok: false, error: "validation", message: "Please enter a valid email address.", fieldErrors: fieldErrorsFrom(parsed.error) },
      422,
    );
  }

  if (looksLikeSpam(parsed.data, 1200)) {
    return json({ ok: true, message: "You are subscribed. Thank you." });
  }

  try {
    const result = await subscribe(parsed.data);
    if (result.status !== "existing") {
      after(() => sendWelcome(parsed.data.email, result.token).catch((error) => console.error("[newsletter]", error)));
    }
    return json({
      ok: true,
      message: result.status === "existing" ? "You are already subscribed. Thank you." : "You are subscribed. Thank you.",
    });
  } catch (error) {
    console.error("[newsletter] subscribe failed", error);
    return json({ ok: false, error: "server", message: "We could not subscribe you just now. Please try again later." }, 500);
  }
}
