import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CircleAlert, ClipboardList, Clock, FileText, Flag, MessageSquareQuote, Pencil, Sparkles, Trash2, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getWorkReport } from "@/lib/data/work-reports";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { listTimeLogs } from "@/lib/data/time-logs";
import { getUser } from "@/lib/data/users";
import { REPORT_PERIOD_LABELS, type Track } from "@/lib/constants";
import { formatDateTime, formatHours, formatRelative, startOfWeek } from "@/lib/format";
import { round, sum } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmForm } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/badge";
import { HBarList } from "@/components/charts/hbar-list";
import { PeriodBadge, RATING_LABELS, ReportStatusBadge, Stars } from "@/components/work-reports/report-badges";
import { ReviewForm } from "@/components/work-reports/review-form";
import { PrintButton } from "@/components/work-reports/print-button";
import { rangeLabel, reportTitle } from "@/components/work-reports/periods";
import { totalsByWork, WorkLegend } from "@/components/timesheet/week-summary";
import { workSlot } from "@/components/timesheet/series";
import { timesheetHref } from "@/components/timesheet/week-toolbar";
import { deleteReportAction, reviewReportAction } from "./actions";

/** One read per request, shared by the page and its metadata. */
const loadReport = cache(async (id: string) => {
  const viewer = await requireUser();
  return { viewer, report: await getWorkReport(viewer, id) };
});

export async function generateMetadata(props: PageProps<"/work-reports/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { report } = await loadReport(id);
  return { title: report ? reportTitle(report) : "Work report" };
}

function Section({ icon, title, text, empty }: { icon: React.ReactNode; title: string; text: string; empty: string }) {
  return (
    <section className="border-t border-mist px-5 py-5 first:border-t-0 sm:px-6">
      <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-navy uppercase [&_svg]:size-4 [&_svg]:text-blue">
        {icon}
        {title}
      </h2>
      {text ? <p className="prose-plain mt-2.5 text-[0.9375rem] text-charcoal">{text}</p> : <p className="mt-2.5 text-sm text-slate">{empty}</p>}
    </section>
  );
}

export default async function WorkReportPage(props: PageProps<"/work-reports/[id]">) {
  const viewer = await requireUser();
  const [{ id }, params] = await Promise.all([props.params, props.searchParams]);
  const { report } = await loadReport(id);
  if (!report) notFound();

  const isAuthor = report.uid === viewer.uid;
  const editable = isAuthor && report.status === "submitted";
  const canDelete = viewer.isAdmin || editable;

  const [assignments, logs, author, reviewer] = await Promise.all([
    listAssignmentsFor(viewer),
    listTimeLogs(viewer, { uid: report.uid, from: report.periodStart, to: report.periodEnd }),
    isAuthor ? Promise.resolve(viewer.profile) : getUser(report.uid),
    report.reviewedBy ? getUser(report.reviewedBy) : Promise.resolve(null),
  ]);
  const linked = report.assignmentIds
    .map((assignmentId) => assignments.find((assignment) => assignment.id === assignmentId))
    .filter((assignment) => assignment !== undefined);
  const trackOf = new Map<string, Track>(assignments.map((assignment) => [assignment.id, assignment.track]));
  const logged = round(sum(logs.map((log) => log.hours)), 2);
  const totals = totalsByWork(logs, trackOf);
  const reviewerName = reviewer?.displayName ?? "The administrator";
  const timesheetLink = timesheetHref({ week: startOfWeek(report.periodStart), uid: viewer.isAdmin ? report.uid : undefined });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/work-reports", label: "Work reports" }}
        eyebrow={
          <span className="flex flex-wrap items-center gap-2 normal-case">
            <PeriodBadge period={report.period} />
            <ReportStatusBadge status={report.status} />
          </span>
        }
        title={rangeLabel(report.periodStart, report.periodEnd)}
        description={`${REPORT_PERIOD_LABELS[report.period]} by ${report.authorName}, submitted ${formatDateTime(report.createdAt)}.`}
        actions={
          <>
            <PrintButton />
            {editable && (
              <ButtonLink href={`/work-reports/${report.id}/edit`} variant="secondary">
                <Pencil aria-hidden="true" />
                Edit
              </ButtonLink>
            )}
            {canDelete && (
              <ConfirmForm
                action={deleteReportAction}
                hidden={{ id: report.id }}
                confirm={isAuthor ? "Delete this report? This cannot be undone." : `Delete ${report.authorName}'s report? This cannot be undone.`}
              >
                <button type="submit" className={buttonClasses({ variant: "secondary", className: "text-danger hover:border-danger/40 hover:bg-danger-tint" })}>
                  <Trash2 aria-hidden="true" />
                  Delete
                </button>
              </ConfirmForm>
            )}
          </>
        }
      />

      {params.submitted === "1" && (
        <Callout tone="success" title="Report submitted" className="no-print mb-6">
          {viewer.isAdmin ? "Your report is saved." : "The administrator has been notified. You can still edit it until it has been reviewed."}
        </Callout>
      )}
      {params.updated === "1" && (
        <Callout tone="success" title="Changes saved" className="no-print mb-6">
          The updated report is visible to the administrator.
        </Callout>
      )}

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card className="print-area overflow-hidden">
            <div className="border-b border-mist bg-cloud/60 px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold tracking-wide text-slate uppercase">Summary</p>
              <p className="prose-plain mt-2 font-display text-lg leading-relaxed text-navy">{report.summary}</p>
            </div>
            <Section icon={<Trophy aria-hidden="true" />} title="Accomplishments" text={report.accomplishments} empty="No accomplishments listed." />
            <Section icon={<CircleAlert aria-hidden="true" />} title="Challenges" text={report.challenges} empty="No challenges reported." />
            <Section icon={<Flag aria-hidden="true" />} title="Next steps" text={report.nextSteps} empty="No next steps given." />
          </Card>

          {report.status === "reviewed" ? (
            <Card className="print-area">
              <CardHeader
                icon={<MessageSquareQuote aria-hidden="true" />}
                title={isAuthor ? "Feedback on your report" : "Feedback"}
                description={`${reviewerName}, ${report.reviewedAt ? formatDateTime(report.reviewedAt) : "date not recorded"}`}
              />
              <CardBody className="space-y-3 py-5">
                {report.rating !== null && (
                  <div className="flex items-center gap-3">
                    <Stars value={report.rating} size="md" />
                    <span className="text-sm font-semibold text-navy">{RATING_LABELS[report.rating]}</span>
                  </div>
                )}
                {report.feedback ? (
                  <blockquote className="prose-plain border-l-4 border-blue/40 pl-4 text-[0.9375rem] text-charcoal">{report.feedback}</blockquote>
                ) : (
                  <p className="text-sm text-slate">Reviewed without written feedback.</p>
                )}
              </CardBody>
            </Card>
          ) : (
            !viewer.isAdmin && (
              <Callout title="Awaiting review" className="no-print">
                The administrator will read your report and may leave feedback and a rating. You will get a notification when they do.
              </Callout>
            )
          )}

          {viewer.isAdmin && !isAuthor && (
            <Card className="no-print">
              <CardHeader
                icon={<Sparkles aria-hidden="true" />}
                title={report.status === "reviewed" ? "Update your review" : "Review this report"}
                description={
                  report.status === "reviewed"
                    ? "Changes are shown to the author straight away and they are notified again."
                    : `Leave feedback and a rating for ${report.authorName}. They will be notified.`
                }
              />
              <CardBody className="py-5">
                <ReviewForm
                  key={report.reviewedAt ?? "new"}
                  action={reviewReportAction}
                  reportId={report.id}
                  defaultFeedback={report.feedback}
                  defaultRating={report.rating}
                  reviewed={report.status === "reviewed"}
                />
              </CardBody>
            </Card>
          )}
        </div>

        <aside className="min-w-0 space-y-6">
          <Card>
            <CardHeader icon={<FileText aria-hidden="true" />} title="Details" />
            <CardBody>
              <div className="flex items-center gap-3">
                <Avatar name={report.authorName} uid={report.uid} photoVersion={author?.photoUpdatedAt} size="md" />
                <div className="min-w-0">
                  {viewer.isAdmin && !isAuthor ? (
                    <Link href={`/team/${report.uid}`} className="block truncate font-semibold text-navy hover:text-blue">
                      {report.authorName}
                    </Link>
                  ) : (
                    <p className="truncate font-semibold text-navy">{report.authorName}</p>
                  )}
                  <p className="truncate text-xs text-slate">{author?.jobTitle || "Primeresearch staff"}</p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Type</dt>
                  <dd className="font-semibold text-navy">{REPORT_PERIOD_LABELS[report.period]}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Period</dt>
                  <dd className="text-right font-semibold text-navy">{rangeLabel(report.periodStart, report.periodEnd)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Hours reported</dt>
                  <dd className="tabular font-semibold text-navy">{report.hours === null ? "Not given" : formatHours(report.hours)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">On the timesheet</dt>
                  <dd className="tabular font-semibold text-navy">{formatHours(logged)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate">Submitted</dt>
                  <dd className="text-right text-navy" title={formatDateTime(report.createdAt)}>
                    {formatRelative(report.createdAt)}
                  </dd>
                </div>
                {report.updatedAt !== report.createdAt && report.updatedAt !== report.reviewedAt && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate">Last edited</dt>
                    <dd className="text-right text-navy" title={formatDateTime(report.updatedAt)}>
                      {formatRelative(report.updatedAt)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate">Status</dt>
                  <dd>
                    <ReportStatusBadge status={report.status} />
                  </dd>
                </div>
              </dl>
              {report.hours !== null && logged > 0 && Math.abs(report.hours - logged) >= 1 && (
                <p className="mt-4 rounded-lg bg-cloud px-3 py-2 text-xs text-slate">
                  The hours reported differ from the timesheet by {formatHours(Math.abs(round(report.hours - logged, 2)))}.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={<ClipboardList aria-hidden="true" />} title="Assignments" description="Work this report covers." />
            {linked.length === 0 ? (
              <CardBody>
                <p className="text-sm text-slate">{report.assignmentIds.length ? "The linked assignments are no longer available." : "No assignments were linked."}</p>
              </CardBody>
            ) : (
              <ul className="divide-y divide-mist">
                {linked.map((assignment) => (
                  <li key={assignment.id}>
                    <Link href={`/assignments/${assignment.id}`} className="group block px-5 py-3 transition-colors hover:bg-cloud/70">
                      <span className="tabular block text-xs font-semibold text-slate">{assignment.ref}</span>
                      <span className="block font-semibold text-navy group-hover:text-blue">{assignment.title}</span>
                      <span className="mt-1.5 block">
                        <StatusBadge status={assignment.status} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="no-print">
            <CardHeader
              icon={<Clock aria-hidden="true" />}
              title="Timesheet for this period"
              description={`${formatHours(logged)} logged`}
              action={
                <Link href={timesheetLink} className="text-[0.8125rem] font-semibold text-blue-dark hover:underline">
                  Open
                </Link>
              }
            />
            <CardBody>
              {totals.length === 0 ? (
                <p className="text-sm text-slate">No time was logged for these dates.</p>
              ) : (
                <>
                  <HBarList
                    title="Hours logged in this period by assignment"
                    items={totals.slice(0, 6).map((item) => ({ label: item.label, value: item.hours, slot: workSlot(item.track) }))}
                    valueFormat={formatHours}
                  />
                  <WorkLegend totals={totals.slice(0, 6)} className="mt-4" />
                </>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
