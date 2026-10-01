import "server-only";
import { after } from "next/server";
import type { z } from "zod";
import { site } from "@/config/site";
import { getDb, schema } from "@/lib/db";
import { emailLayout, fieldsTable, fieldsText, sendMail, teamInbox } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, createReference, escapeHtml, hashIp } from "@/lib/request";
import { describePayload, kindLabels, messageFor, subjectFor } from "@/lib/submission-fields";
import { fieldErrorsFrom, type ApiResult, type SubmissionKind } from "@/lib/validation";

const MAX_BODY_BYTES = 60_000;

export function json(result: ApiResult, status = 200, headers?: Record<string, string>) {
  return Response.json(result, { status, headers });
}

/** Parse a JSON body defensively: size cap, content type and syntax. */
export async function readJson(request: Request): Promise<{ ok: true; data: unknown } | { ok: false; response: Response }> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    return { ok: false, response: json({ ok: false, error: "bad_request", message: "Expected a JSON request." }, 415) };
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return { ok: false, response: json({ ok: false, error: "bad_request", message: "That submission is too large." }, 413) };
  }
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return { ok: false, response: json({ ok: false, error: "bad_request", message: "That submission is too large." }, 413) };
    }
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: false, response: json({ ok: false, error: "bad_request", message: "We could not read that submission." }, 400) };
  }
}

/** True when the request looks automated: honeypot filled or submitted implausibly fast. */
export function looksLikeSpam(data: { company_website?: string; startedAt?: number }, minFillMs: number) {
  if (data.company_website && data.company_website.trim() !== "") return true;
  if (typeof data.startedAt === "number" && data.startedAt > 0) {
    const elapsed = Date.now() - data.startedAt;
    if (elapsed >= 0 && elapsed < minFillMs) return true;
  }
  return false;
}

function stripMeta<T extends Record<string, unknown>>(data: T) {
  const rest: Record<string, unknown> = { ...data };
  delete rest.company_website;
  delete rest.startedAt;
  delete rest.consent;
  return rest;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

const acknowledgements: Record<SubmissionKind, { heading: string; lines: string[] }> = {
  contact: {
    heading: "We have received your enquiry",
    lines: ["A researcher will read your message and reply within one working day."],
  },
  proposal: {
    heading: "Your proposal request is with us",
    lines: [
      "A researcher will review your brief and contact you within one working day to arrange a short scoping conversation.",
      "After that call we will send a written proposal with a clear method, workplan and transparent budget.",
    ],
  },
  training: {
    heading: "Thank you for your training enquiry",
    lines: ["We will be in touch within one working day with dates, a course outline and a quote for your group."],
  },
  careers: {
    heading: "Thank you for applying to our field network",
    lines: [
      "We review applications as new studies are planned and will contact you when there is a suitable opportunity in your area.",
      "There is no need to apply again; we keep your details on file in line with our privacy notice.",
    ],
  },
};

async function notify(kind: SubmissionKind, reference: string, record: { name: string; email: string; phone: string; organisation: string }, payload: Record<string, unknown>) {
  const rows = [
    { label: "Reference", value: reference },
    { label: "Name", value: record.name },
    { label: "Email", value: record.email },
    ...(record.phone ? [{ label: "Phone", value: record.phone }] : []),
    ...(record.organisation ? [{ label: "Organisation", value: record.organisation }] : []),
    ...describePayload(payload),
  ];
  const adminUrl = `${site.url}/admin/submissions`;

  const team = sendMail({
    to: teamInbox(),
    replyTo: record.email,
    subject: `[${kindLabels[kind]}] ${subjectFor(kind, payload)} from ${record.name} (${reference})`,
    text: `${kindLabels[kind]} received via the website.\n\n${fieldsText(rows)}\n\nManage it in the dashboard: ${adminUrl}`,
    html: emailLayout({
      preheader: `${kindLabels[kind]} from ${record.name}`,
      heading: `New ${kindLabels[kind].toLowerCase()}`,
      body: `<p style="margin:0 0 8px;">Received via the website. Reply directly to this email to respond to ${escapeHtml(record.name)}.</p>${fieldsTable(rows)}`,
      cta: { label: "Open the dashboard", href: adminUrl },
    }),
  });

  const ack = acknowledgements[kind];
  const visitorRows = describePayload(payload);
  const visitor = sendMail({
    to: record.email,
    subject: `${ack.heading} (${reference})`,
    text: `Dear ${firstName(record.name)},\n\n${ack.lines.join("\n\n")}\n\nYour reference is ${reference}.\n\n${fieldsText(visitorRows)}\n\n${site.name}\n${site.contact.email} · ${site.contact.phone}`,
    html: emailLayout({
      preheader: `Reference ${reference}. ${ack.lines[0]}`,
      heading: ack.heading,
      body: `<p style="margin:0 0 14px;">Dear ${escapeHtml(firstName(record.name))},</p>${ack.lines
        .map((line) => `<p style="margin:0 0 14px;">${escapeHtml(line)}</p>`)
        .join("")}<p style="margin:0 0 14px;">Your reference is <strong>${reference}</strong>. Here is a copy of what you sent:</p>${fieldsTable(visitorRows)}`,
    }),
  });

  const results = await Promise.allSettled([team, visitor]);
  for (const result of results) {
    if (result.status === "rejected") console.error("[mail] failed to send", result.reason);
  }
  return results[0]?.status === "fulfilled" && results[0].value.sent;
}

/**
 * Shared pipeline for every public form: rate limit, parse, validate, spam
 * check, store, then email the team and the visitor after responding.
 */
export async function handleSubmission<S extends z.ZodType<Record<string, unknown> & { name: string; email: string }>>(
  request: Request,
  { kind, schema: inputSchema, minFillMs = 3000 }: { kind: SubmissionKind; schema: S; minFillMs?: number },
) {
  const ip = clientIp(request.headers);
  const limit = rateLimit(`${kind}:${ip}`, { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return json(
      { ok: false, error: "rate_limited", message: "You have sent several requests in a short time. Please wait a few minutes and try again." },
      429,
      { "Retry-After": String(limit.retryAfter) },
    );
  }

  const body = await readJson(request);
  if (!body.ok) return body.response;

  const parsed = inputSchema.safeParse(body.data);
  if (!parsed.success) {
    return json(
      { ok: false, error: "validation", message: "Please check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) },
      422,
    );
  }

  const data = parsed.data as Record<string, unknown> & {
    name: string;
    email: string;
    phone?: string;
    organisation?: string;
    company_website?: string;
    startedAt?: number;
  };
  const reference = createReference();

  if (looksLikeSpam(data, minFillMs)) {
    // Answer like a success so automated senders learn nothing.
    return json({ ok: true, reference, message: "Thank you." });
  }

  const payload = stripMeta(data);
  const now = new Date().toISOString();
  const record = {
    name: data.name,
    email: data.email,
    phone: data.phone ?? "",
    organisation: data.organisation ?? "",
  };

  try {
    const db = await getDb();
    await db.insert(schema.submissions).values({
      reference,
      kind,
      status: "new",
      ...record,
      subject: subjectFor(kind, payload),
      message: messageFor(kind, payload),
      payload: JSON.stringify(payload),
      ipHash: hashIp(ip),
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, 300),
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error(`[${kind}] could not store submission ${reference}`, error);
    // Do not lose the lead: fall back to email before reporting failure.
    const delivered = await notify(kind, reference, record, payload).catch(() => false);
    if (delivered) return json({ ok: true, reference });
    return json(
      {
        ok: false,
        error: "server",
        message: `Something went wrong on our side. Please email us at ${site.contact.email} and we will respond quickly.`,
      },
      500,
    );
  }

  after(() => notify(kind, reference, record, payload).catch((error) => console.error("[mail]", error)));

  return json({ ok: true, reference });
}
