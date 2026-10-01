import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/config/site";
import { escapeHtml } from "@/lib/request";

let transporter: Transporter | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    transporter = null;
    return transporter;
  }
  const port = Number(process.env.SMTP_PORT ?? 465);
  const secure = (process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false")) === "true";
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
  });
  return transporter;
}

export function emailConfigured() {
  return Boolean(process.env.SMTP_HOST?.trim());
}

export function teamInbox() {
  return process.env.MAIL_TO?.trim() || site.contact.email;
}

export async function sendMail(message: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  headers?: Record<string, string>;
}) {
  const client = getTransporter();
  if (!client) {
    console.info(`[mail] SMTP is not configured, so this email was not sent: "${message.subject}" to ${message.to}`);
    return { sent: false };
  }
  await client.sendMail({
    from: process.env.MAIL_FROM?.trim() || `"${site.name}" <${site.contact.email}>`,
    ...message,
  });
  return { sent: true };
}

/** Branded, table-based HTML email that renders in Outlook, Gmail and Apple Mail. */
export function emailLayout({
  preheader,
  heading,
  body,
  cta,
}: {
  preheader: string;
  heading: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  const logo = `${site.url}/brand/logo-horizontal-reversed-800.png`;
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#F6F8FB;font-family:Inter,Calibri,Arial,sans-serif;color:#1F2933;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F8FB;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E3E8EF;">
<tr><td style="background:#0B2447;padding:28px 36px;">
<img src="${logo}" width="190" alt="Primeresearch Consultants" style="display:block;border:0;width:190px;height:auto;">
</td></tr>
<tr><td style="height:4px;background:#E4AC3F;line-height:4px;font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:36px 36px 8px;">
<h1 style="margin:0 0 16px;font-family:'Plus Jakarta Sans',Arial,sans-serif;font-size:24px;line-height:1.25;color:#0B2447;">${escapeHtml(heading)}</h1>
<div style="font-size:15px;line-height:1.65;color:#1F2933;">${body}</div>
${
  cta
    ? `<p style="margin:28px 0 8px;"><a href="${cta.href}" style="display:inline-block;background:#2B67C5;color:#FFFFFF;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;font-family:'Plus Jakarta Sans',Arial,sans-serif;">${escapeHtml(cta.label)}</a></p>`
    : ""
}
</td></tr>
<tr><td style="padding:28px 36px 32px;">
<p style="margin:0;border-top:1px solid #E3E8EF;padding-top:20px;font-size:12px;line-height:1.6;color:#5B6B7F;">
${escapeHtml(site.name)} · ${escapeHtml(site.tagline)}<br>
${escapeHtml(site.contact.address.street)}, ${escapeHtml(site.contact.address.city)}, ${escapeHtml(site.contact.address.country)} · ${escapeHtml(site.contact.phone)}<br>
${escapeHtml(site.legal.line)}
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function fieldsTable(rows: { label: string; value: string }[]) {
  const cells = rows
    .map(
      (row) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid #E3E8EF;width:38%;vertical-align:top;font-weight:600;color:#0B2447;font-size:13px;">${escapeHtml(row.label)}</td><td style="padding:10px 12px;border-bottom:1px solid #E3E8EF;vertical-align:top;font-size:14px;white-space:pre-wrap;">${escapeHtml(row.value)}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E3E8EF;border-radius:12px;border-collapse:separate;overflow:hidden;margin-top:12px;">${cells}</table>`;
}

export function fieldsText(rows: { label: string; value: string }[]) {
  return rows.map((row) => `${row.label}: ${row.value}`).join("\n");
}
