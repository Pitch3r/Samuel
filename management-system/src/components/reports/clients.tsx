import Link from "next/link";
import { Building2, HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TableWrap } from "@/components/ui/misc";
import { PanelHeader, reportCard } from "@/components/reports/panel";
import { formatDate, formatMoney } from "@/lib/format";
import { cn, plural, sum } from "@/lib/utils";
import type { ClientType } from "@/lib/constants";

export type ClientRow = {
  key: string;
  id: string | null;
  name: string;
  type: ClientType | null;
  active: number;
  completed: number;
  revenue: number;
  billed: number;
};

export type OutstandingRow = { key: string; id: string | null; name: string; count: number; balance: number; oldest: string | null };

const TOP = 10;

function ClientName({ id, name, sub }: { id: string | null; name: string; sub?: string | null }) {
  return (
    <div className="min-w-[11rem]">
      {id ? (
        <Link href={`/clients/${encodeURIComponent(id)}`} className="font-semibold text-navy hover:text-blue hover:underline">
          {name}
        </Link>
      ) : (
        <span className="font-semibold text-navy">{name}</span>
      )}
      {sub && <p className="text-xs text-slate">{sub}</p>}
    </div>
  );
}

/** Who the work is for: top clients in the period, and who owes money today. */
export function ClientsSection({ top, outstanding, today }: { top: ClientRow[]; outstanding: OutstandingRow[]; today: string }) {
  const owed = sum(outstanding.map((row) => row.balance));
  return (
    <div className="grid items-start gap-6 2xl:grid-cols-2">
      <Card className={reportCard}>
        <PanelHeader
          icon={<Building2 aria-hidden="true" />}
          title="Top clients"
          description={`By revenue from work completed in the period, then by active assignments.${top.length > TOP ? ` Top ${TOP} of ${top.length}.` : ""}`}
        />
        {top.length ? (
          <TableWrap>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Client</th>
                  <th scope="col" className="text-right">
                    Active
                  </th>
                  <th scope="col" className="text-right">
                    Done
                  </th>
                  <th scope="col" className="text-right">
                    Revenue
                  </th>
                  <th scope="col" className="text-right">
                    Fees on active work
                  </th>
                </tr>
              </thead>
              <tbody>
                {top.slice(0, TOP).map((row) => (
                  <tr key={row.key}>
                    <td>
                      <ClientName id={row.id} name={row.name} sub={row.type} />
                    </td>
                    <td className="tabular text-right">{row.active}</td>
                    <td className="tabular text-right">{row.completed}</td>
                    <td className={cn("tabular text-right whitespace-nowrap", row.revenue ? "font-semibold text-navy" : "text-slate")}>{formatMoney(row.revenue)}</td>
                    <td className="tabular text-right whitespace-nowrap">{formatMoney(row.billed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <EmptyState icon={<Building2 aria-hidden="true" />} title="No client work in this period" className="py-10" />
        )}
      </Card>

      <Card className={reportCard}>
        <PanelHeader
          icon={<HandCoins aria-hidden="true" />}
          title="Outstanding by client"
          description={`Fees still owed on completed work, as of ${formatDate(today)}.`}
          action={owed > 0 ? <span className="tabular text-sm font-bold text-navy">{formatMoney(owed)}</span> : undefined}
        />
        {outstanding.length ? (
          <TableWrap>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Client</th>
                  <th scope="col" className="text-right">
                    Assignments
                  </th>
                  <th scope="col" className="text-right">
                    Balance
                  </th>
                  <th scope="col" className="text-right">
                    Oldest completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {outstanding.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <ClientName id={row.id} name={row.name} />
                    </td>
                    <td className="tabular text-right">{row.count}</td>
                    <td className="tabular text-right font-semibold whitespace-nowrap text-navy">{formatMoney(row.balance)}</td>
                    <td className="tabular text-right whitespace-nowrap">{formatDate(row.oldest, "Unknown")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-cloud font-semibold text-navy">
                  <th scope="row" className="px-4 py-3 text-left text-sm">
                    {plural(outstanding.length, "client")}
                  </th>
                  <td className="tabular px-4 py-3 text-right">{sum(outstanding.map((row) => row.count))}</td>
                  <td className="tabular px-4 py-3 text-right whitespace-nowrap">{formatMoney(owed)}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            </table>
          </TableWrap>
        ) : (
          <EmptyState icon={<HandCoins aria-hidden="true" />} title="Nothing outstanding" description="All completed work has been paid or settled." className="py-10" />
        )}
      </Card>
    </div>
  );
}
