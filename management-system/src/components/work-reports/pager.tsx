import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

/** Reads ?page= as a positive whole number. */
export function pageFrom(value: unknown) {
  const page = typeof value === "string" ? Number.parseInt(value, 10) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Previous and next links for a long list, keeping the other query parameters. */
export function Pager({
  page,
  pageSize,
  total,
  basePath,
  params,
  noun = "items",
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  params: Record<string, string | undefined>;
  noun?: string;
}) {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  if (pages <= 1) return null;
  const href = (target: number) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return (
    <nav className="no-print flex items-center justify-between gap-3 border-t border-mist px-4 py-3" aria-label="Pages">
      <p className="tabular text-xs text-slate">
        {first} to {last} of {total} {noun}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={buttonClasses({ variant: "secondary", size: "sm" })}>
            <ChevronLeft aria-hidden="true" />
            Newer
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={href(page + 1)} className={buttonClasses({ variant: "secondary", size: "sm" })}>
            Older
            <ChevronRight aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
