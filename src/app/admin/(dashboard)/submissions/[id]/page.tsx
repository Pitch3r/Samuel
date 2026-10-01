import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Trash2 } from "lucide-react";
import { deleteSubmission } from "@/app/admin/actions";
import { SubmissionStatusForm } from "@/components/admin/submission-status-form";
import { ConfirmButton, Panel, StatusBadge } from "@/components/admin/ui";
import { getSubmission, statusLabels } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { describePayload, kindLabels } from "@/lib/submission-fields";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Submission" };

type Props = { params: Promise<{ id: string }> };

export default async function SubmissionPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const submission = await getSubmission(Number(id));
  if (!submission) notFound();

  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(submission.payload) as Record<string, unknown>;
  } catch {
    payload = {};
  }
  const rows = describePayload(payload);

  return (
    <div className="space-y-6">
      <Link href="/admin/submissions" className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All submissions
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs text-slate">{submission.reference}</p>
          <h1 className="mt-1 font-display text-[1.75rem] font-bold text-navy">{submission.name}</h1>
          <p className="mt-1 text-slate">
            {kindLabels[submission.kind]} · received {formatDateTime(submission.createdAt)}
          </p>
        </div>
        <StatusBadge status={submission.status} label={statusLabels[submission.status]} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Details">
            <dl className="-m-6 divide-y divide-mist">
              {rows.map((row) => (
                <div key={row.label} className="grid gap-1 px-6 py-4 text-sm sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <dt className="font-semibold text-navy">{row.label}</dt>
                  <dd className="whitespace-pre-wrap text-charcoal">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title="Technical">
            <dl className="grid gap-3 text-xs text-slate sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-navy">Last updated</dt>
                <dd>{formatDateTime(submission.updatedAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-navy">Browser</dt>
                <dd className="truncate" title={submission.userAgent}>
                  {submission.userAgent || "Not recorded"}
                </dd>
              </div>
            </dl>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Contact">
            <p className="font-display text-lg font-bold text-navy">{submission.name}</p>
            {submission.organisation && <p className="text-sm text-slate">{submission.organisation}</p>}
            <div className="mt-4 space-y-2 text-sm">
              <a href={`mailto:${submission.email}?subject=${encodeURIComponent(`Re: ${submission.subject} (${submission.reference})`)}`} className="flex items-center gap-2 font-semibold text-blue hover:text-navy">
                <Mail className="size-4" aria-hidden="true" />
                {submission.email}
              </a>
              {submission.phone && (
                <a href={`tel:${submission.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2 font-semibold text-blue hover:text-navy">
                  <Phone className="size-4" aria-hidden="true" />
                  {submission.phone}
                </a>
              )}
            </div>
          </Panel>

          <Panel title="Status and notes">
            <SubmissionStatusForm id={submission.id} status={submission.status} notes={submission.notes} />
          </Panel>

          <form action={deleteSubmission} className="rounded-2xl border border-danger/20 bg-white p-6">
            <input type="hidden" name="id" value={submission.id} />
            <p className="font-display font-bold text-navy">Delete this submission</p>
            <p className="mt-1 text-sm text-slate">Use this for spam, or when someone asks us to erase their data.</p>
            <ConfirmButton
              message="Delete this submission permanently? This cannot be undone."
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-danger/30 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger-tint"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete permanently
            </ConfirmButton>
          </form>
        </div>
      </div>
    </div>
  );
}
