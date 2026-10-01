import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { slugify } from "@/lib/utils";

export type Heading = { id: string; text: string };

function decodeEntities(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Renders article Markdown to safe HTML and collects H2 headings for the
 * on-page contents list. Output is sanitised even though only admins write it.
 */
export function renderMarkdown(markdown: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Set<string>();

  const marked = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        const text = decodeEntities(inner);
        let id = slugify(text) || "section";
        let suffix = 2;
        while (used.has(id)) id = `${slugify(text)}-${suffix++}`;
        used.add(id);
        if (depth === 2) headings.push({ id, text });
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
      },
    },
  });

  const raw = marked.parse(markdown, { async: false }) as string;
  const wrapped = raw.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, "</table></div>");

  const html = sanitizeHtml(wrapped, {
    allowedTags: [
      "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "a", "blockquote", "table", "thead", "tbody",
      "tr", "th", "td", "code", "pre", "hr", "br", "div", "span", "sup", "sub",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      div: ["class"],
      th: ["align", "style"],
      td: ["align", "style"],
      code: ["class"],
    },
    allowedClasses: { div: ["table-wrap"] },
    allowedStyles: { th: { "text-align": [/^(left|right|center)$/] }, td: { "text-align": [/^(left|right|center)$/] } },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href);
        return {
          tagName,
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
        };
      },
    },
  });

  return { html, headings };
}
