import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CircleCheck, CircleDashed, CircleDollarSign, CircleMinus, ClipboardList, FileClock, HandCoins, Info, Mail, MapPin, NotebookPen, Pencil, Phone, Plus, Receipt, Trash2, UserRound, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getClient } from "@/lib/data/clients";
import { listAssignmentsForClient } from "@/lib/data/assignments";
import { peopleMap } from "@/lib/people";
import { isOpenStatus, PAYMENT_LABELS, type PaymentStatus } from "@/lib/constants";
import { formatDate, formatDateTime, formatMoney, formatRelative } from "@/lib/format";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge, type Tone } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { ConfirmForm, SubmitButton } from "@/components/ui/form";
import { DescriptionList, TableWrap } from "@/components/ui/misc";
import { ProgressBar } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { AssignmentList } from "@/components/assignments/assignment-list";
import type { ReactNode } from "react";
import Link from "next/link";
import { ClientTypeBadge, isAcademicClient } from "@/components/clients/client-type-badge";
import { clientTotals } from "@/components/clients/client-totals";
import { deleteClientAction } from "./actions";

const PAYMENT_STYLE: Record<PaymentStatus, { tone: Tone; icon: ReactNode }> = {
  not_invoiced: { tone: "neutral", icon: <CircleDashed aria-hidden="true" /> },
  invoiced: { tone: "blue", icon: <FileClock aria-hidden="true" /> },
  part_paid: { tone: "warning", icon: <HandCoins aria-hidden="true" /> },
  paid: { tone: "good", icon: <CircleCheck aria-hidden="true" /> },
  waived: { tone: "neutral", icon: <CircleMinus aria-hidden="true" /> },
};

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const style = PAYMENT_STYLE[status];
  return (
    <Badge tone={style.tone} icon={style.icon}>
      {PAYMENT_LABELS[status]}
    </Badge>
  );
}

const loadClient = cache(async (id: string) => {
  await requireAdmin();
  const valid = id.length > 0 && id.length <= 128 && !id.includes("/");
  return valid ? getClient(id) : null;
});

export async function generateMetadata(props: PageProps<"/clients/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const client = await loadClient(id);
  return { title: client ? client.name : "Client" };
}

export default async function ClientPage(props: PageProps<"/clients/[id]">) {
  const viewer = await requireAdmin();
  const [{ id }, params] = await Promise.all([props.params, props.searchParams]);
  const client = await loadClient(id);
  if (!client) notFound();

  const [assignments, people] = await Promise.all([listAssignmentsForClient(viewer, client.id), peopleMap()]);
  const totals = clientTotals(assignments);
  // Open work first, soonest due first; then everything else, newest first.
  const open = assignments
    .filter((assignment) => isOpenStatus(assignment.status))
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
  const closed = assignments.filter((assignment) => !isOpenStatus(assignment.status));
  const paidShare = totals.fees ? (totals.paid / totals.fees) * 100 : 0;
  const academic = isAcademicClient(client.type);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        back={{ href: "/clients", label: "Clients" }}
        eyebrow={academic ? "Academic client" : "Corporate client"}
        title={client.name}
        description={[client.sector, client.institution].filter(Boolean).join(", ") || undefined}
        actions={
          <>
            <ButtonLink href={`/clients/${client.id}/edit`} variant="secondary">
              <Pencil aria-hidden="true" />
              Edit
            </ButtonLink>
            <ButtonLink href={`/assignments/new?client=${encodeURIComponent(client.id)}`}>
              <Plus aria-hidden="true" />
              New assignment
            </ButtonLink>
          </>
        }
      />

      {params.created === "1" && (
        <Callout tone="success" title="Client added" className="mb-6">
          Link assignments to {client.name} to track their work and fees here.
        </Callout>
      )}
      {params.saved === "1" && (
        <Callout tone="success" title="Changes saved" className="mb-6">
          Any change to the name also shows on the client&apos;s assignments.
        </Callout>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Assignments" value={totals.count} icon={<ClipboardList aria-hidden="true" />} hint={`${totals.open} open`} />
        <StatCard label="Completed" value={totals.completed} icon={<CircleCheck aria-hidden="true" />} hint={`Revenue ${formatMoney(totals.revenue, { compact: true })}`} />
        <StatCard label="Total fees" value={formatMoney(totals.fees, { compact: true })} icon={<Receipt aria-hidden="true" />} hint="Excluding cancelled work" />
        <StatCard label="Paid" value={formatMoney(totals.paid, { compact: true })} icon={<Wallet aria-hidden="true" />} hint={totals.fees ? `${Math.round(paidShare)}% of fees` : "No fees yet"} />
        <StatCard
          label="Outstanding"
          value={formatMoney(totals.outstanding, { compact: true })}
          icon={<Wallet aria-hidden="true" />}
          hint="On completed work"
          tone={totals.outstanding > 0 ? "warning" : "default"}
          className="col-span-2 md:col-span-1"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              icon={<ClipboardList aria-hidden="true" />}
              title="Open assignments"
              description={open.length ? `${plural(open.length, "assignment")} in progress or waiting, soonest due first.` : "Nothing in progress for this client."}
            />
            <AssignmentList assignments={open} people={people} showClient={false} empty="No open assignments for this client." />
          </Card>
          <Card>
            <CardHeader
              icon={<CircleCheck aria-hidden="true" />}
              title="Completed and closed"
              description={closed.length ? `${plural(closed.length, "assignment")}, newest first.` : undefined}
            />
            <AssignmentList assignments={closed} people={people} showClient={false} empty="No completed or cancelled work yet." />
          </Card>
          <Card>
            <CardHeader
              icon={<CircleDollarSign aria-hidden="true" />}
              title="Fees by assignment"
              description="What was agreed, what has been paid and where each piece of work stands on invoicing."
            />
            {assignments.length ? (
              <>
                <TableWrap>
                  <table className="data-table min-w-[34rem]">
                    <thead>
                      <tr>
                        <th scope="col">Assignment</th>
                        <th scope="col" className="text-right">
                          Fee
                        </th>
                        <th scope="col" className="text-right">
                          Paid
                        </th>
                        <th scope="col">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td className="max-w-80">
                            <Link href={`/assignments/${assignment.id}`} className="block truncate font-semibold text-navy hover:text-blue">
                              {assignment.title}
                            </Link>
                            <span className="tabular text-xs text-slate">{assignment.ref}</span>
                          </td>
                          <td className="tabular text-right whitespace-nowrap">{assignment.fee !== null ? formatMoney(assignment.fee) : <span className="text-slate">Not set</span>}</td>
                          <td className="tabular text-right whitespace-nowrap">{formatMoney(assignment.amountPaid)}</td>
                          <td>
                            <PaymentBadge status={assignment.paymentStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
                <CardFooter className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-slate">Totals, excluding cancelled work</span>
                  <span className="tabular">
                    <span className="font-semibold text-navy">{formatMoney(totals.paid)}</span> <span className="text-slate">paid of</span>{" "}
                    <span className="font-semibold text-navy">{formatMoney(totals.fees)}</span>
                  </span>
                </CardFooter>
              </>
            ) : (
              <CardBody>
                <p className="text-sm text-slate">No assignments yet, so no fees to show.</p>
              </CardBody>
            )}
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader icon={<UserRound aria-hidden="true" />} title="Contact" />
            <CardBody className="space-y-3 text-sm">
              <p className="font-semibold text-navy">{client.contactName || <span className="font-normal text-slate">No contact person recorded</span>}</p>
              {client.email && (
                <p className="flex min-w-0 items-center gap-2">
                  <Mail className="size-4 shrink-0 text-slate" aria-hidden="true" />
                  <a href={`mailto:${client.email}`} className="truncate text-blue-dark hover:underline">
                    {client.email}
                  </a>
                </p>
              )}
              {client.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-slate" aria-hidden="true" />
                  <a href={`tel:${client.phone.replace(/\s+/g, "")}`} className="tabular text-blue-dark hover:underline">
                    {client.phone}
                  </a>
                </p>
              )}
              {client.address && (
                <p className="flex items-start gap-2 text-charcoal">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-slate" aria-hidden="true" />
                  <span className="break-words">{client.address}</span>
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={<Wallet aria-hidden="true" />} title="Fees" description="Across all of this client's work, excluding cancelled assignments." />
            <CardBody className="space-y-4">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-slate">Paid</span>
                <span className="tabular">
                  <span className="font-semibold text-navy">{formatMoney(totals.paid)}</span> <span className="text-slate">of {formatMoney(totals.fees)}</span>
                </span>
              </div>
              <ProgressBar value={paidShare} tone={paidShare >= 100 ? "good" : "blue"} showValue label="Share of fees paid" />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-cloud px-3 py-2">
                  <dt className="text-xs text-slate">Revenue, completed</dt>
                  <dd className="tabular font-semibold text-navy">{formatMoney(totals.revenue)}</dd>
                </div>
                <div className="rounded-xl bg-cloud px-3 py-2">
                  <dt className="text-xs text-slate">Outstanding</dt>
                  <dd className={totals.outstanding > 0 ? "tabular font-semibold text-warning" : "tabular font-semibold text-navy"}>{formatMoney(totals.outstanding)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={<Info aria-hidden="true" />} title="Details" />
            <CardBody>
              <DescriptionList
                className="sm:grid-cols-1"
                items={[
                  { label: "Type", value: <ClientTypeBadge type={client.type} /> },
                  { label: "Sector", value: client.sector },
                  { label: "Institution", value: client.institution },
                  { label: "Added", value: formatDate(client.createdAt) },
                  { label: "Last updated", value: formatDateTime(client.updatedAt) },
                  { label: "Last assignment activity", value: totals.lastActivity ? formatRelative(totals.lastActivity) : "" },
                ]}
              />
            </CardBody>
          </Card>

          {client.notes && (
            <Card>
              <CardHeader icon={<NotebookPen aria-hidden="true" />} title="Notes" />
              <CardBody>
                <p className="prose-plain text-sm text-charcoal">{client.notes}</p>
              </CardBody>
            </Card>
          )}

          <Card className="border-danger/30">
            <CardHeader icon={<Trash2 aria-hidden="true" />} title="Delete client" className="border-danger/20" />
            <CardBody className="space-y-4">
              <p className="text-sm text-charcoal">
                Removes this client record.{" "}
                {totals.count
                  ? `Its ${plural(totals.count, "assignment")} stay and keep the name "${client.name}" as text, but will no longer be linked to a client.`
                  : "It has no assignments."}
              </p>
              <ConfirmForm
                action={deleteClientAction}
                hidden={{ id: client.id }}
                confirm={`Delete the client "${client.name}"? Assignments keep the client's name. This cannot be undone.`}
              >
                <SubmitButton variant="danger" pendingLabel="Deleting">
                  <Trash2 aria-hidden="true" />
                  Delete client
                </SubmitButton>
              </ConfirmForm>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
