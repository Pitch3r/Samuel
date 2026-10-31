import type { ReactNode } from "react";
import { Circle, CircleCheck, CircleDashed, CircleSlash, Receipt, Send } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge, type Tone } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap } from "@/components/ui/misc";
import { PanelHeader, reportCard } from "@/components/reports/panel";
import { SplitBar } from "@/components/reports/split-bar";
import { PAYMENT_FILLS } from "@/components/charts/scale";
import { PAYMENT_LABELS, type PaymentStatus } from "@/lib/constants";
import { formatMoney } from "@/lib/format";
import { cn, sum } from "@/lib/utils";

export type PaymentRow = { status: PaymentStatus; count: number; fees: number; paid: number; balance: number };

const PAYMENT_TONES: Record<PaymentStatus, Tone> = {
  paid: "good",
  part_paid: "teal",
  invoiced: "blue",
  not_invoiced: "neutral",
  waived: "neutral",
};

const PAYMENT_ICONS: Record<PaymentStatus, ReactNode> = {
  paid: <CircleCheck aria-hidden="true" />,
  part_paid: <CircleDashed aria-hidden="true" />,
  invoiced: <Send aria-hidden="true" />,
  not_invoiced: <Circle aria-hidden="true" />,
  waived: <CircleSlash aria-hidden="true" />,
};

/** Fees on work active in the period, by payment status. */
export function PaymentsSection({ rows, count }: { rows: PaymentRow[]; count: number }) {
  const fees = sum(rows.map((row) => row.fees));
  const paid = sum(rows.map((row) => row.paid));
  const balance = sum(rows.map((row) => row.balance));
  return (
    <Card className={reportCard}>
      <PanelHeader
        icon={<Receipt aria-hidden="true" />}
        title="Fees by payment status"
        description="Every assignment with a fee that was active in the period, completed or not."
      />
      {count ? (
        <>
          <CardBody>
            <dl className="mb-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate uppercase">Fees agreed</dt>
                <dd className="tabular mt-1 font-display text-2xl font-bold text-navy">{formatMoney(fees)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate uppercase">Received</dt>
                <dd className="tabular mt-1 font-display text-2xl font-bold text-navy">{formatMoney(paid)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold tracking-wide text-slate uppercase">Still to collect</dt>
                <dd className="tabular mt-1 font-display text-2xl font-bold text-navy">{formatMoney(balance)}</dd>
              </div>
            </dl>
            <SplitBar
              title="Fees by payment status"
              parts={rows.map((row) => ({
                label: PAYMENT_LABELS[row.status],
                value: row.fees,
                display: formatMoney(row.fees, { compact: true }),
                color: PAYMENT_FILLS[row.status],
              }))}
            />
          </CardBody>
          <TableWrap className="border-t border-mist">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Payment status</th>
                  <th scope="col" className="text-right">
                    Assignments
                  </th>
                  <th scope="col" className="text-right">
                    Fees
                  </th>
                  <th scope="col" className="text-right">
                    Received
                  </th>
                  <th scope="col" className="text-right">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.status} className={cn(row.count === 0 && "text-slate")}>
                    <td>
                      <Badge tone={PAYMENT_TONES[row.status]} icon={PAYMENT_ICONS[row.status]}>{PAYMENT_LABELS[row.status]}</Badge>
                    </td>
                    <td className="tabular text-right">{row.count}</td>
                    <td className="tabular text-right whitespace-nowrap">{formatMoney(row.fees)}</td>
                    <td className="tabular text-right whitespace-nowrap">{formatMoney(row.paid)}</td>
                    <td className={cn("tabular text-right whitespace-nowrap", row.balance > 0 && "font-semibold text-navy")}>{formatMoney(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-cloud font-semibold text-navy">
                  <th scope="row" className="px-4 py-3 text-left text-sm">
                    Total
                  </th>
                  <td className="tabular px-4 py-3 text-right">{count}</td>
                  <td className="tabular px-4 py-3 text-right whitespace-nowrap">{formatMoney(fees)}</td>
                  <td className="tabular px-4 py-3 text-right whitespace-nowrap">{formatMoney(paid)}</td>
                  <td className="tabular px-4 py-3 text-right whitespace-nowrap">{formatMoney(balance)}</td>
                </tr>
              </tfoot>
            </table>
          </TableWrap>
        </>
      ) : (
        <EmptyState icon={<Receipt aria-hidden="true" />} title="No fees recorded" description="No assignment active in this period has a fee." />
      )}
    </Card>
  );
}
