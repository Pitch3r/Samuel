import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/csv";
import { renderMarkdown } from "@/lib/markdown";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";
import { clientIp, createReference, escapeHtml } from "@/lib/request";
import { looksLikeSpam, minFillTime } from "@/lib/spam";

describe("rateLimit", () => {
  it("allows the limit, then blocks with a retry time", () => {
    resetRateLimits();
    const key = "test:1.2.3.4";
    for (let i = 0; i < 3; i++) expect(rateLimit(key, { limit: 3, windowMs: 60_000 }).ok).toBe(true);
    const blocked = rateLimit(key, { limit: 3, windowMs: 60_000 });
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(rateLimit("test:other", { limit: 3, windowMs: 60_000 }).ok).toBe(true);
  });
});

describe("spam checks", () => {
  it("flags a filled honeypot", () => {
    expect(looksLikeSpam({ company_website: "http://spam.example" }, 3000)).toBe(true);
  });

  it("flags forms submitted faster than a person could", () => {
    const now = 1_000_000;
    expect(looksLikeSpam({ startedAt: now - 500 }, 3000, now)).toBe(true);
    expect(looksLikeSpam({ startedAt: now - 8000 }, 3000, now)).toBe(false);
    expect(looksLikeSpam({}, 3000, now)).toBe(false);
  });

  it("can be relaxed by environment for automated tests", () => {
    process.env.FORM_MIN_FILL_MS = "0";
    expect(minFillTime(3000)).toBe(0);
    delete process.env.FORM_MIN_FILL_MS;
    expect(minFillTime(3000)).toBe(3000);
  });
});

describe("request helpers", () => {
  it("creates readable references", () => {
    expect(createReference(new Date("2026-10-01T10:00:00Z"))).toMatch(/^PRC-2610-[A-HJ-NP-Z2-9]{5}$/);
  });

  it("reads the first forwarded IP", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "41.72.1.2, 10.0.0.1" }))).toBe("41.72.1.2");
    expect(clientIp(new Headers())).toBe("unknown");
  });

  it("escapes HTML for emails", () => {
    expect(escapeHtml(`<script>alert("x")</script> & 'y'`)).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;");
  });
});

describe("csv", () => {
  it("quotes commas, quotes and new lines", () => {
    expect(csvCell('He said "hi", then left\nlater')).toBe('"He said ""hi"", then left\nlater"');
  });

  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe(`"'=HYPERLINK(""http://evil"")"`);
    expect(csvCell("+260 97")).toBe("'+260 97");
    expect(toCsv(["a", "b"], [[1, ["x", "y"]]])).toBe("a,b\r\n1,x; y");
  });
});

describe("renderMarkdown", () => {
  it("strips scripts and event handlers", () => {
    const { html } = renderMarkdown('Hello <script>alert(1)</script><img src=x onerror="alert(1)"> [x](javascript:alert(1))');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });

  it("adds heading anchors and collects the contents list", () => {
    const { html, headings } = renderMarkdown("## First part\n\nText\n\n## Second & last\n\nMore");
    expect(headings).toEqual([
      { id: "first-part", text: "First part" },
      { id: "second-last", text: "Second & last" },
    ]);
    expect(html).toContain('<h2 id="first-part">');
  });

  it("wraps tables for horizontal scrolling and opens external links safely", () => {
    const { html } = renderMarkdown("| A | B |\n| --- | --- |\n| 1 | 2 |\n\n[site](https://example.com)");
    expect(html).toContain('<div class="table-wrap"><table>');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});

describe("metaDescription", async () => {
  const { metaDescription } = await import("@/lib/utils");
  it("keeps short text whole and trims long text near 160 characters", () => {
    expect(metaDescription("A short summary.")).toBe("A short summary.");
    const long = "First sentence that is reasonably long and descriptive for testing purposes here. Second sentence that pushes the total well beyond the limit of one hundred and sixty characters.";
    const result = metaDescription(long);
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.length).toBeGreaterThan(100);
  });
});
