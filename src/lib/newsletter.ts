import "server-only";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { site } from "@/config/site";
import { getDb, schema } from "@/lib/db";
import { emailLayout, sendMail } from "@/lib/email";

export async function subscribe({ email, name, source }: { email: string; name?: string; source?: string }) {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await db.select().from(schema.subscribers).where(eq(schema.subscribers.email, email)).get();

  if (existing?.status === "active") return { status: "existing" as const, token: existing.token };

  if (existing) {
    await db
      .update(schema.subscribers)
      .set({ status: "active", name: name || existing.name, source: source || existing.source, updatedAt: now })
      .where(eq(schema.subscribers.id, existing.id));
    return { status: "reactivated" as const, token: existing.token };
  }

  const token = randomBytes(24).toString("base64url");
  await db.insert(schema.subscribers).values({
    email,
    name: name ?? "",
    source: source ?? "",
    status: "active",
    token,
    createdAt: now,
    updatedAt: now,
  });
  return { status: "created" as const, token };
}

export async function unsubscribe(token: string) {
  if (!token || token.length > 100) return false;
  const db = await getDb();
  const existing = await db.select().from(schema.subscribers).where(eq(schema.subscribers.token, token)).get();
  if (!existing) return false;
  await db
    .update(schema.subscribers)
    .set({ status: "unsubscribed", updatedAt: new Date().toISOString() })
    .where(eq(schema.subscribers.id, existing.id));
  return true;
}

export function unsubscribeUrl(token: string) {
  return `${site.url}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export async function sendWelcome(email: string, token: string) {
  const link = unsubscribeUrl(token);
  await sendMail({
    to: email,
    subject: `Welcome to ${site.newsletterName}`,
    headers: { "List-Unsubscribe": `<${link}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    text: `Thank you for subscribing to ${site.newsletterName}, a short monthly note from ${site.name} on research methods, data and what the evidence says.\n\nYou can unsubscribe at any time: ${link}`,
    html: emailLayout({
      preheader: "A short monthly note on methods, data and what the evidence says.",
      heading: `Welcome to ${site.newsletterName}`,
      body: `<p style="margin:0 0 14px;">Thank you for subscribing. Once a month we send a short note on research methods, data and what the evidence says, with practical guidance you can use in your own work.</p><p style="margin:0 0 14px;">No spam, and we never share your address.</p><p style="margin:0;font-size:13px;color:#5B6B7F;">Changed your mind? <a href="${link}" style="color:#2B67C5;">Unsubscribe in one click</a>.</p>`,
      cta: { label: "Read the latest insights", href: `${site.url}/insights` },
    }),
  });
}
