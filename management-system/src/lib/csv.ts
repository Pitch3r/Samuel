/** RFC 4180 CSV, with formula-injection protection for spreadsheet apps. */
export function toCsv(rows: Record<string, unknown>[], columns?: { key: string; label: string }[]) {
  const cols = columns ?? Object.keys(rows[0] ?? {}).map((key) => ({ key, label: key }));
  const escape = (value: unknown) => {
    let text = value === null || value === undefined ? "" : Array.isArray(value) ? value.join("; ") : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [cols.map((col) => escape(col.label)).join(",")];
  for (const row of rows) lines.push(cols.map((col) => escape(row[col.key])).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}

export function csvResponse(filename: string, body: string) {
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename.replace(/[^\w.-]+/g, "-")}"`,
      "cache-control": "no-store",
    },
  });
}
