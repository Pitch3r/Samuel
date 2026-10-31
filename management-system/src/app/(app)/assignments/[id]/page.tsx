import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  Clock,
  FileStack,
  Flag,
  Gauge,
  History,
  Hourglass,
  Info,
  ListChecks,
  Pencil,
  ScrollText,
  Star,
  Timer,
  Trash2,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { allowedTransitions, getAssignmentFor, listFiles, listUpdates } from "@/lib/data/assignments";
import { listTimeLogsForAssignment } from "@/lib/data/time-logs";
import { listUsers } from "@/lib/data/users";
import { MAX_UPLOAD_BYTES, PAYMENT_LABELS, STATUS_DESCRIPTIONS, TRACK_LABELS } from "@/lib/constants";
import { describeDue, formatDate, formatDateTime, formatHours, formatMoney, formatRelative, todayISO } from "@/lib/format";
import { dayOf, wasOnTime } from "@/lib/metrics";
import { cn, plural, round } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink, buttonClasses } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge, PriorityBadge, StatusBadge, TrackBadge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { ProgressBar } from "@/components/ui/progress";
import { DescriptionList, Meta } from "@/components/ui/misc";
import { ConfirmForm } from "@/components/ui/form";
import { AssigneeStack, DueLabel } from "@/components/assignments/assignment-list";
import { ProgressForm } from "@/components/assignments/progress-form";
import { StatusActions } from "@/components/assignments/status-actions";
import { MilestoneList, type MilestoneView } from "@/components/assignments/milestone-list";
import { ActivityTimeline } from "@/components/assignments/activity-timeline";
import { CommentForm } from "@/components/assignments/comment-form";
import { FileUpload } from "@/components/assignments/file-upload";
import { FileList } from "@/components/assignments/file-list";
import { ReviewPanel } from "@/components/assignments/review-panel";
import { PaymentForm } from "@/components/assignments/payment-form";
import { TimeSummary } from "@/components/assignments/time-summary";
import { RATING_LABELS, StarRating } from "@/components/assignments/star-rating";
import { transitionButtons } from "@/components/assignments/workflow";
import { toPeopleMap } from "@/components/assignments/people";
import {
  addCommentAction,
  addMilestoneAction,
  changeStatusAction,
  deleteAssignmentAction,
  deleteFileAction,
  removeMilestoneAction,
  reviewAction,
  toggleMilestoneAction,
  updatePaymentAction,
  updateProgressAction,
} from "./actions";

/** One read per request, shared by the page and its metadata. */
const loadAssignment = cache(async (id: string) => {
  const viewer = await requireUser();
  return { viewer, assignment: await getAssignmentFor(viewer, id) };
});

export async function generateMetadata(props: PageProps<"/assignments/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { assignment } = await loadAssignment(id);
  return { title: assignment ? `${assignment.ref} ${assignment.title}` : "Assignment" };
}

/** A label and value cell in the summary strip under the header. */
function Fact({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0 bg-white px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate uppercase [&_svg]:size-3.5">
        {icon}
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default async function AssignmentPage(props: PageProps<"/assignments/[id]">) {
  const viewer = await requireUser();
  const { id } = await props.params;
  const search = await props.searchParams;
  const { assignment } = await loadAssignment(id);
  if (!assignment) notFound();

  const [updates, files, allLogs, users] = await Promise.all([
    listUpdates(viewer, assignment.id),
    listFiles(viewer, assignment.id),
    listTimeLogsForAssignment(viewer, assignment.id),
    listUsers(),
  ]);
  // Employees only ever see their own time, even on shared work.
  const logs = viewer.isAdmin ? allLogs : allLogs.filter((log) => log.uid === viewer.uid);
  const people = toPeopleMap(users);
  const today = todayISO();

  const closed = assignment.status === "completed" || assignment.status === "cancelled";
  const isAssignee = assignment.assigneeIds.includes(viewer.uid);
  // Closed work is read-only until the administrator reopens it from the status options.
  const canWork = !closed && (viewer.isAdmin || isAssignee);
  const reviewing = viewer.isAdmin && assignment.status === "under_review";
  const dateSpan =
    assignment.startDate && assignment.dueDate
      ? `${formatDate(assignment.startDate)} to ${formatDate(assignment.dueDate)}`
      : assignment.startDate
        ? `From ${formatDate(assignment.startDate)}, no due date`
        : assignment.dueDate
          ? `Due ${formatDate(assignment.dueDate)}`
          : "No dates set";
  const buttons = transitionButtons(assignment.status, allowedTransitions(viewer, assignment), viewer.isAdmin);
  const due = describeDue(assignment.dueDate, today);
  const onTime = wasOnTime(assignment);
  const doneCount = assignment.milestones.filter((milestone) => milestone.done).length;
  const hoursPct = assignment.estimatedHours ? (assignment.loggedHours / assignment.estimatedHours) * 100 : null;
  const outstanding = Math.max((assignment.fee ?? 0) - assignment.amountPaid, 0);
  const creator = people.get(assignment.createdBy)?.name ?? "Former staff member";
  const teamNames = assignment.assigneeIds.map((uid) => people.get(uid)?.name ?? "Former staff member");

  const milestones: MilestoneView[] = assignment.milestones.map((milestone) => ({
    id: milestone.id,
    title: milestone.title,
    dueDate: milestone.dueDate,
    dueLabel: milestone.dueDate ? formatDate(milestone.dueDate) : null,
    overdue: Boolean(milestone.dueDate && milestone.dueDate < today),
    done: milestone.done,
    doneNote: milestone.done
      ? `Done${milestone.doneBy ? ` by ${people.get(milestone.doneBy)?.name ?? "a former staff member"}` : ""}${milestone.doneAt ? `, ${formatDate(dayOf(milestone.doneAt))}` : ""}`
      : null,
  }));

  return (
    <>
      <PageHeader
        back={{ href: "/assignments", label: "All assignments" }}
        eyebrow={<span className="tabular">{assignment.ref}</span>}
        title={assignment.title}
        className="mb-4"
        actions={
          <>
            {isAssignee && !closed && (
              <ButtonLink href="/timesheet" variant="subtle">
                <Timer aria-hidden="true" />
                Log time
              </ButtonLink>
            )}
            {viewer.isAdmin && (
              <ButtonLink href={`/assignments/${assignment.id}/edit`} variant="secondary">
                <Pencil aria-hidden="true" />
                Edit
              </ButtonLink>
            )}
          </>
        }
      />

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={assignment.status} />
          <TrackBadge track={assignment.track} />
          <PriorityBadge priority={assignment.priority} />
          <Badge>{assignment.categoryName}</Badge>
          {assignment.academicLevel && <Badge>{assignment.academicLevel}</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Meta icon={<Building2 aria-hidden="true" />}>
            {viewer.isAdmin && assignment.clientId ? (
              <Link href={`/clients/${assignment.clientId}`} className="font-semibold text-navy hover:text-blue hover:underline">
                {assignment.clientName}
              </Link>
            ) : (
              <span className="font-semibold text-navy">{assignment.clientName || "No client"}</span>
            )}
          </Meta>
          <span className="inline-flex items-center gap-2 text-sm text-slate">
            <AssigneeStack ids={assignment.assigneeIds} people={people} size="xs" />
            {teamNames.join(", ")}
          </span>
          <Meta icon={<CalendarDays aria-hidden="true" />}>
            {dateSpan}
          </Meta>
          {/* Later due dates are already in the date range; only call out the close or overdue ones. */}
          {due.tone !== "neutral" && <DueLabel assignment={assignment} />}
        </div>
      </div>

      <div className="mb-6 space-y-3">
        {search.created === "1" && (
          <Callout tone="success" title="Assignment created">
            Everyone assigned has been notified. Add files or milestones below to get the work started.
          </Callout>
        )}
        {search.saved === "1" && <Callout tone="success" title="Changes saved" />}
        {assignment.status === "revision" && (
          <Callout tone="warning" title="Changes requested">
            {assignment.reviewNote ? <span className="prose-plain">{assignment.reviewNote}</span> : "The administrator returned the work for revision."}
          </Callout>
        )}
        {assignment.status === "under_review" && !viewer.isAdmin && (
          <Callout title="Submitted for review">
            Sent {assignment.submittedAt ? formatRelative(assignment.submittedAt) : "recently"}. The administrator will approve it or return it with
            notes, and you will be notified either way.
          </Callout>
        )}
        {assignment.status === "completed" && (
          <Callout tone="success" title={`Completed ${assignment.completedAt ? formatDate(dayOf(assignment.completedAt)) : ""}`.trim()}>
            {onTime === null ? "Approved and delivered." : onTime ? "Approved and delivered on time." : "Approved and delivered after the due date."}
          </Callout>
        )}
        {assignment.status === "cancelled" && (
          <Callout tone="warning" title="This assignment was cancelled">
            It no longer counts as open work.{viewer.isAdmin ? " Reopen it from the status options if it restarts." : ""}
          </Callout>
        )}
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="grid grid-cols-2 gap-px bg-mist lg:grid-cols-4">
        <Fact label="Progress" icon={<Gauge aria-hidden="true" />}>
          <p className="font-display text-xl leading-none font-bold text-navy sm:text-2xl tabular">{assignment.progress}%</p>
          <ProgressBar value={assignment.progress} size="sm" tone={assignment.status === "completed" ? "good" : "blue"} className="mt-2.5" label="Progress" />
        </Fact>
        <Fact label="Due" icon={<CalendarDays aria-hidden="true" />}>
          <p className="font-display text-xl leading-none font-bold text-navy sm:text-2xl">{assignment.dueDate ? formatDate(assignment.dueDate) : "Not set"}</p>
          <p
            className={cn(
              "mt-2 text-xs font-semibold",
              closed ? "text-slate" : due.tone === "danger" ? "text-danger" : due.tone === "warning" ? "text-warning" : "text-slate",
            )}
          >
            {closed
              ? onTime === null
                ? "Closed"
                : onTime
                  ? "Delivered on time"
                  : "Delivered late"
              : due.tone === "neutral" && due.days !== null
                ? `In ${due.days} days`
                : due.label}
          </p>
        </Fact>
        <Fact label="Time logged" icon={<Clock aria-hidden="true" />}>
          <p className="font-display text-xl leading-none font-bold text-navy sm:text-2xl tabular">{formatHours(round(assignment.loggedHours, 2))}</p>
          <p className={cn("mt-2 text-xs font-semibold", hoursPct !== null && hoursPct > 100 ? "text-warning" : "text-slate")}>
            {assignment.estimatedHours ? `of ${formatHours(assignment.estimatedHours)} estimated (${Math.round(hoursPct ?? 0)}%)` : "No estimate set"}
          </p>
        </Fact>
        <Fact label="Milestones" icon={<Flag aria-hidden="true" />}>
          <p className="font-display text-xl leading-none font-bold text-navy sm:text-2xl tabular">
            {doneCount}
            <span className="text-base text-slate"> of {assignment.milestones.length}</span>
          </p>
          <p className="mt-2 text-xs font-semibold text-slate">
            {assignment.milestones.length ? (doneCount === assignment.milestones.length ? "All done" : `${assignment.milestones.length - doneCount} to go`) : "None set"}
          </p>
        </Fact>
        </div>
      </Card>

      {/*
        The review panel is its own grid item: first on narrow screens, so the
        administrator does not scroll past everything to reach it, and at the
        top of the side column on wide ones.
      */}
      <div className={cn("grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_23rem]", reviewing && "xl:grid-rows-[auto_1fr]")}>
        {reviewing && (
          <Card className="ring-2 ring-blue/20 xl:col-start-2 xl:row-start-1">
            <CardHeader
              icon={<Hourglass aria-hidden="true" />}
              title="Review this submission"
              description={`Submitted ${assignment.submittedAt ? formatRelative(assignment.submittedAt) : "for review"}. Approve it with a rating, or return it with notes.`}
            />
            <CardBody>
              <ReviewPanel assignmentId={assignment.id} action={reviewAction} />
            </CardBody>
          </Card>
        )}

        {/* Main column */}
        <div className={cn("min-w-0 space-y-6 xl:col-start-1 xl:row-start-1", reviewing && "xl:row-span-2")}>
          <Card>
            <CardHeader
              icon={<Gauge aria-hidden="true" />}
              title="Progress and status"
              description={canWork ? "Keep this current so the team and the administrator can see where the work stands." : STATUS_DESCRIPTIONS[assignment.status]}
            />
            <CardBody className="space-y-6">
              {canWork ? (
                <ProgressForm
                  key={assignment.progress}
                  assignmentId={assignment.id}
                  progress={assignment.progress}
                  max={viewer.isAdmin ? 100 : 99}
                  action={updateProgressAction}
                  completed={assignment.status === "completed"}
                />
              ) : (
                <div>
                  <p className="font-display text-5xl leading-none font-bold text-navy tabular">
                    {assignment.progress}
                    <span className="text-2xl text-slate">%</span>
                  </p>
                  <ProgressBar value={assignment.progress} tone={assignment.status === "completed" ? "good" : "blue"} className="mt-4" label="Progress" />
                  <p className="mt-3 text-sm text-slate">
                    {viewer.isAdmin
                      ? "This assignment is closed. Reopen it below to change the progress or milestones."
                      : "This assignment is closed. Ask the administrator if it needs to be reopened."}
                  </p>
                </div>
              )}
              <div className="border-t border-mist pt-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold">Status</h3>
                  <StatusBadge status={assignment.status} />
                  <span className="text-sm text-slate">{STATUS_DESCRIPTIONS[assignment.status]}</span>
                </div>
                {buttons.length ? (
                  <StatusActions key={assignment.status} assignmentId={assignment.id} buttons={buttons} action={changeStatusAction} />
                ) : (
                  <p className="text-sm text-slate">There are no status changes you can make at this stage.</p>
                )}
              </div>
            </CardBody>
          </Card>

          {(assignment.description || assignment.tags.length > 0) && (
            <Card>
              <CardHeader icon={<ScrollText aria-hidden="true" />} title="Brief" description="Scope, deliverables and notes from the administrator." />
              <CardBody className="space-y-4">
                {assignment.description ? (
                  <div className="prose-plain text-[0.9375rem] text-charcoal">{assignment.description}</div>
                ) : (
                  <p className="text-sm text-slate">No brief has been written yet.</p>
                )}
                {assignment.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {assignment.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader
              icon={<ListChecks aria-hidden="true" />}
              title="Milestones"
              description={
                assignment.milestones.length
                  ? `${doneCount} of ${assignment.milestones.length} done. Ticking milestones moves the progress meter.`
                  : "Steps on the way to delivery. Ticking them moves the progress meter."
              }
              action={
                assignment.milestones.length ? (
                  <div className="w-28">
                    <ProgressBar value={(doneCount / assignment.milestones.length) * 100} size="sm" tone="good" showValue label="Milestones done" />
                  </div>
                ) : undefined
              }
            />
            <CardBody>
              <MilestoneList
                assignmentId={assignment.id}
                milestones={milestones}
                canEdit={canWork}
                canRemove={viewer.isAdmin && !closed}
                toggleAction={toggleMilestoneAction}
                addAction={addMilestoneAction}
                removeAction={removeMilestoneAction}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<FileStack aria-hidden="true" />}
              title="Files"
              description={files.length ? `${plural(files.length, "file")}. Briefs, data, drafts and final deliverables.` : "Briefs, data, drafts and final deliverables."}
            />
            <CardBody className="space-y-4">
              <FileUpload assignmentId={assignment.id} maxBytes={MAX_UPLOAD_BYTES} defaultKind={viewer.isAdmin && assignment.status === "not_started" ? "brief" : "draft"} />
              <FileList files={files} viewer={{ uid: viewer.uid, isAdmin: viewer.isAdmin }} deleteAction={deleteFileAction} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={<History aria-hidden="true" />} title="Activity" description="Comments, progress, status changes, files and reviews, newest first." />
            <CardBody className="space-y-6">
              <CommentForm
                assignmentId={assignment.id}
                action={addCommentAction}
                viewer={{ uid: viewer.uid, name: viewer.name, photoVersion: viewer.profile.photoUpdatedAt }}
              />
              <div className="border-t border-mist pt-6">
                <ActivityTimeline updates={updates} />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Side column */}
        <aside className={cn("min-w-0 space-y-6 xl:col-start-2", reviewing ? "xl:row-start-2" : "xl:row-start-1")} aria-label="Assignment details">
          {viewer.isAdmin && assignment.status === "completed" && (
            <Card>
              <CardHeader icon={<Star aria-hidden="true" />} title="Quality" description="Your rating feeds the performance score." />
              <CardBody className="space-y-3">
                {assignment.qualityRating ? (
                  <div className="flex items-center gap-3">
                    <StarRating value={assignment.qualityRating} size="lg" />
                    <span className="text-sm font-semibold text-navy">
                      {assignment.qualityRating}/5, {RATING_LABELS[assignment.qualityRating]}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate">Completed without a rating.</p>
                )}
                {assignment.reviewNote && <p className="prose-plain rounded-xl bg-cloud px-3.5 py-2.5 text-sm text-charcoal ring-1 ring-mist">{assignment.reviewNote}</p>}
                <p className="text-xs text-slate">
                  {onTime === null ? "No due date to measure against." : onTime ? "Delivered on or before the due date." : "Delivered after the due date."}
                </p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader icon={<Info aria-hidden="true" />} title="Details" />
            <CardBody>
              <DescriptionList
                className="sm:grid-cols-2 xl:grid-cols-1"
                items={[
                  { label: "Reference", value: <span className="tabular">{assignment.ref}</span> },
                  { label: "Category", value: assignment.categoryName },
                  { label: "Track", value: TRACK_LABELS[assignment.track] },
                  ...(assignment.track === "academic" ? [{ label: "Academic level", value: assignment.academicLevel ?? "" }] : []),
                  { label: "Client", value: assignment.clientName },
                  { label: "Start date", value: assignment.startDate ? formatDate(assignment.startDate) : "" },
                  { label: "Due date", value: assignment.dueDate ? formatDate(assignment.dueDate) : "" },
                  {
                    label: "Hours",
                    value: (
                      <div className="space-y-1.5">
                        <p>
                          <span className="tabular font-semibold text-navy">{formatHours(round(assignment.loggedHours, 2))}</span> logged
                          {assignment.estimatedHours ? (
                            <>
                              {" of "}
                              <span className="tabular">{formatHours(assignment.estimatedHours)}</span> estimated
                            </>
                          ) : (
                            ", no estimate"
                          )}
                        </p>
                        {hoursPct !== null && (
                          <ProgressBar value={hoursPct} size="sm" tone={hoursPct > 100 ? "danger" : hoursPct > 85 ? "warning" : "navy"} label="Hours used of the estimate" />
                        )}
                        {hoursPct !== null && hoursPct > 100 && <p className="text-xs font-semibold text-danger">Over the estimate</p>}
                      </div>
                    ),
                  },
                  { label: "Created", value: `${creator}, ${formatDateTime(assignment.createdAt)}` },
                  { label: "Last updated", value: formatRelative(assignment.updatedAt) },
                  ...(assignment.submittedAt ? [{ label: "Submitted for review", value: formatDateTime(assignment.submittedAt) }] : []),
                  ...(assignment.completedAt ? [{ label: "Completed", value: formatDateTime(assignment.completedAt) }] : []),
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={<Clock aria-hidden="true" />}
              title="Time on this assignment"
              description={viewer.isAdmin ? "Hours logged by each person." : "Your hours on this assignment."}
            />
            <CardBody>
              <TimeSummary logs={logs} people={people} showPeople={viewer.isAdmin} />
            </CardBody>
            <CardFooter>
              <Link href="/timesheet" className="text-sm font-semibold text-blue hover:underline">
                {isAssignee && !closed ? "Log time on the timesheet" : "Open the timesheet"}
              </Link>
            </CardFooter>
          </Card>

          {viewer.isAdmin && (
            <Card>
              <CardHeader icon={<Wallet aria-hidden="true" />} title="Fee and payment" description="Only you can see this." />
              <CardBody className="space-y-4">
                {assignment.fee ? (
                  <>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold tracking-wide text-slate uppercase">Fee</p>
                        <p className="mt-1 font-display text-2xl font-bold text-navy tabular">{formatMoney(assignment.fee)}</p>
                      </div>
                      <Badge tone={assignment.paymentStatus === "paid" ? "good" : assignment.paymentStatus === "part_paid" || assignment.paymentStatus === "invoiced" ? "blue" : "neutral"}>
                        {PAYMENT_LABELS[assignment.paymentStatus]}
                      </Badge>
                    </div>
                    <ProgressBar value={(assignment.amountPaid / assignment.fee) * 100} tone="good" label="Share of the fee paid" />
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate">Paid</dt>
                        <dd className="tabular font-semibold text-navy">{formatMoney(assignment.amountPaid)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate">Outstanding</dt>
                        <dd className={cn("tabular font-semibold", outstanding > 0 && assignment.paymentStatus !== "waived" ? "text-danger" : "text-navy")}>
                          {assignment.paymentStatus === "waived" ? "Waived" : formatMoney(outstanding)}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <p className="text-sm text-slate">No fee has been set for this assignment.</p>
                )}
                <PaymentForm
                  key={`${assignment.fee}-${assignment.paymentStatus}-${assignment.amountPaid}`}
                  assignmentId={assignment.id}
                  fee={assignment.fee}
                  paymentStatus={assignment.paymentStatus}
                  amountPaid={assignment.amountPaid}
                  action={updatePaymentAction}
                />
              </CardBody>
            </Card>
          )}

          {viewer.isAdmin && (
            <Card className="border-danger/20">
              <CardHeader icon={<Trash2 aria-hidden="true" />} title="Delete assignment" />
              <CardBody className="space-y-3">
                <p className="text-sm text-slate">
                  Removes the assignment with its files, milestones and activity. Time already logged stays on the timesheet. This cannot be undone.
                </p>
                <ConfirmForm
                  action={deleteAssignmentAction}
                  confirm={`Delete ${assignment.ref} "${assignment.title}" with all its files and activity? This cannot be undone.`}
                  hidden={{ assignmentId: assignment.id }}
                >
                  <button type="submit" className={buttonClasses({ variant: "danger", className: "w-full" })}>
                    <Trash2 aria-hidden="true" />
                    Delete assignment
                  </button>
                </ConfirmForm>
              </CardBody>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
