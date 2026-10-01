import type { Metadata } from "next";
import { Download, Trash2 } from "lucide-react";
import { deleteSubscriber, setSubscriberStatus } from "@/app/admin/actions";
import { ConfirmButton, PageTitle, StatTile, StatusBadge } from "@/components/admin/ui";
import { listSubscribers } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  await requireAdmin();
  const subscribers = await listSubscribers();
  const active = subscribers.filter((row) => row.status === "active").length;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Newsletter subscribers"
        description="People who subscribed to The Prime Insight from the website."
        actions={
          // A file download from a route handler, so a plain anchor is correct here.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a
            href="/admin/export/subscribers"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-mist bg-white px-4 font-display text-sm font-semibold text-navy hover:border-navy/40"
          >
            <Download className="size-4" aria-hidden="true" />
            Export active subscribers
          </a>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Active" value={active} />
        <StatTile label="Unsubscribed" value={subscribers.length - active} />
        <StatTile label="All time" value={subscribers.length} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-mist bg-white">
        {subscribers.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate">No subscribers yet. The sign-up form is in the footer of every page.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-cloud text-xs text-slate">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Email</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Source</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Subscribed</th>
                  <th scope="col" className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((row) => (
                  <tr key={row.id} className="border-t border-mist">
                    <td className="px-6 py-3 font-semibold text-navy">{row.email}</td>
                    <td className="px-4 py-3 text-slate">{row.source || "Website"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} label={row.status === "active" ? "Active" : "Unsubscribed"} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate">{formatDateTime(row.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <form action={setSubscriberStatus}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="status" value={row.status === "active" ? "unsubscribed" : "active"} />
                          <button type="submit" className="rounded-full border border-mist px-3 py-1.5 text-xs font-semibold text-navy hover:border-navy/40">
                            {row.status === "active" ? "Unsubscribe" : "Reactivate"}
                          </button>
                        </form>
                        <form action={deleteSubscriber}>
                          <input type="hidden" name="id" value={row.id} />
                          <ConfirmButton
                            message={`Delete ${row.email} permanently?`}
                            className="grid size-8 place-items-center rounded-full border border-danger/30 text-danger hover:bg-danger-tint"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            <span className="sr-only">Delete {row.email}</span>
                          </ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
