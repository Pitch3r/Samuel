import type { ReactNode } from "react";
import { CircleDot } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { organisation } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Period } from "@/lib/metrics";

/**
 * The report's title block: on screen it opens the page, on paper it is the
 * first thing read. Carries the period, the comparison period, when it was
 * generated and by whom, then the key findings in plain English.
 */
export function ReportCover({
  periodLabel,
  period,
  previous,
  generatedAt,
  preparedBy,
  highlights,
}: {
  periodLabel: string;
  period: Period;
  previous: Period;
  generatedAt: string;
  preparedBy: string;
  highlights: string[];
}) {
  return (
    <section aria-labelledby="report-title" className="overflow-hidden rounded-card border border-mist bg-white shadow-card print:break-inside-avoid print:shadow-none">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-10">
        <div className="min-w-0">
          <Logo width={168} />
          <p className="mt-6 text-xs font-semibold tracking-[0.08em] text-slate uppercase">{organisation.system}</p>
          <h2 id="report-title" className="mt-1.5 text-2xl font-bold tracking-tight sm:text-[1.75rem]">
            {organisation.name}: management report
          </h2>
          <p className="mt-2 text-[0.9375rem] text-charcoal">
            <span className="font-semibold text-navy">{periodLabel}</span>
            {/* A custom range is already labelled with its dates. */}
            {periodLabel !== `${formatDate(period.from)} to ${formatDate(period.to)}` && (
              <span className="text-slate">
                {" "}
                ({formatDate(period.from)} to {formatDate(period.to)})
              </span>
            )}
          </p>
          <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <CoverFact label="Compared with">
              {formatDate(previous.from)} to {formatDate(previous.to)}
            </CoverFact>
            <CoverFact label="Generated">{formatDateTime(generatedAt)}</CoverFact>
            <CoverFact label="Prepared by">{preparedBy}</CoverFact>
            <CoverFact label="Office">{organisation.city}</CoverFact>
          </dl>
        </div>
        <div className="min-w-0 rounded-xl bg-cloud p-5 print:border print:border-mist">
          <h3 className="text-sm font-bold tracking-wide uppercase">Key findings</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-charcoal">
            {highlights.map((line) => (
              <li key={line} className="flex gap-2.5">
                <CircleDot className="mt-0.5 size-3.5 shrink-0 text-blue" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CoverFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold tracking-wide text-slate uppercase">{label}</dt>
      <dd className="mt-0.5 text-charcoal">{children}</dd>
    </div>
  );
}

/** In-page contents for the report's sections (screen only). */
export function ReportContents({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Report sections" className="no-print -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="shrink-0 rounded-full border border-mist bg-white px-3 py-1.5 text-[0.8125rem] font-semibold whitespace-nowrap text-slate transition-colors hover:border-blue/40 hover:text-navy"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

/** A titled block of the report, with an anchor for the contents. */
export function ReportSection({ id, title, description, children }: { id: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-10 scroll-mt-24 print:mt-8">
      <div className="report-section-head mb-4 border-b border-mist pb-2">
        <h2 id={`${id}-title`} className="text-lg font-bold">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-slate">{description}</p>}
      </div>
      {children}
    </section>
  );
}
