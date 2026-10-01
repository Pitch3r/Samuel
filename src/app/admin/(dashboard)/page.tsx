import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Panel, PageTitle, StatTile, StatusBadge } from "@/components/admin/ui";
import { BarChart } from "@/components/charts/bar-chart";
import { getDashboardData, statusLabels, submissionKinds } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { kindLabels } from "@/lib/submission-fields";
import { formatDateTime } from "@/lib/utils";

const dayFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function DashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();
  const today = new Date().toISOString().slice(0, 10);
  const series = data.series.map((point) => ({
    label: dayFormatter.format(new Date(`${point.date}T00:00:00Z`)),
    value: point.total,
    highlight: point.date === today,
    detail: `${dayFormatter.format(new Date(`${point.date}T00:00:00Z`))}: ${point.total} submission${point.total === 1 ? "" : "s"}`,
  }));
  const maxKind = Math.max(1, ...submissionKinds.map((kind) => data.kindTotals[kind]));

  return (
    <div className="space-y-8">
      <PageTitle
        title="Overview"
        description="Enquiries, proposals, applications and subscribers from the website."
        actions={
          // A file download from a route handler, so a plain anchor is correct here.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/admin/export/submissions"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-mist bg-white px-4 font-display text-sm font-semibold text-navy hover:border-navy/40"
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      {!emailConfigured() && (
        <p className="rounded-xl bg-gold-tint px-4 py-3 text-sm text-navy ring-1 ring-gold/40">
          Email notifications are off because SMTP is not configured. Submissions are still saved here. See the README to connect
          your mailbox.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="New, awaiting reply" value={data.statusTotals.new} context="Across all submission types" />
        <StatTile label="Submissions, last 7 days" value={data.lastSevenDays} context={`${data.totalSubmissions.toLocaleString("en-GB")} in total`} />
        <StatTile label="Newsletter subscribers" value={data.activeSubscribers} context="Active subscriptions" />
        <StatTile label="Published insights" value={data.publishedArticles} context={`${data.draftArticles} draft${data.draftArticles === 1 ? "" : "s"}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Submissions per day, last 30 days">
          <p className="-mt-2 mb-4 text-xs text-slate">Today is highlighted.</p>
          <BarChart data={series} height={240} xLabelEvery={5} ariaLabel="Website submissions per day over the last 30 days" tableCaption="Submissions per day" />
        </Panel>
        <Panel title="By type">
          <ul className="space-y-4">
            {submissionKinds.map((kind) => (
              <li key={kind}>
                <Link href={`/admin/submissions?kind=${kind}`} className="group block">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold text-navy group-hover:text-blue">{kindLabels[kind]}</span>
                    <span className="font-semibold text-navy tabular-nums">{data.kindTotals[kind].toLocaleString("en-GB")}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-cloud">
                    <div className="h-full rounded-full bg-navy" style={{ width: `${(data.kindTotals[kind] / maxKind) * 100}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-mist pt-5">
            {(Object.keys(statusLabels) as (keyof typeof statusLabels)[]).map((status) => (
              <Link key={status} href={`/admin/submissions?status=${status}`} className="flex items-center justify-between rounded-xl bg-cloud px-3 py-2 text-sm hover:bg-blue-tint">
                <StatusBadge status={status} label={statusLabels[status]} />
                <span className="font-semibold text-navy tabular-nums">{data.statusTotals[status]}</span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <Panel
        title="Latest submissions"
        action={
          <Link href="/admin/submissions" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue hover:text-navy">
            View all
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      >
        {data.recent.length === 0 ? (
          <p className="text-sm text-slate">No submissions yet. When someone uses a form on the website, it will appear here.</p>
        ) : (
          <div className="-m-6 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-cloud text-xs text-slate">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">From</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Subject</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Received</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((row) => (
                  <tr key={row.id} className="border-t border-mist hover:bg-cloud/60">
                    <td className="px-6 py-3">
                      <Link href={`/admin/submissions/${row.id}`} className="font-semibold text-navy hover:text-blue">
                        {row.name}
                      </Link>
                      <p className="text-xs text-slate">{row.organisation || row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-charcoal">{kindLabels[row.kind]}</td>
                    <td className="max-w-[16rem] truncate px-4 py-3 text-charcoal">{row.subject}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={statusLabels[row.status]} />
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-slate">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
