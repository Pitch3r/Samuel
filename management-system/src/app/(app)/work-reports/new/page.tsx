import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { REPORT_PERIODS, type ReportPeriod } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { Callout } from "@/components/ui/callout";
import { ReportForm } from "@/components/work-reports/report-form";
import { defaultRange } from "@/components/work-reports/periods";
import { loadReportFormData } from "../_lib/form-data";
import { createReportAction } from "./actions";

export const metadata: Metadata = { title: "New work report" };

export default async function NewWorkReportPage(props: PageProps<"/work-reports/new">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const period: ReportPeriod = REPORT_PERIODS.find((value) => value === params.period) ?? "weekly";
  const { today, assignments, logs } = await loadReportFormData(viewer);
  const range = defaultRange(period, today);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/work-reports", label: "Work reports" }}
        title="New work report"
        description="Summarise a day, a week or a month of work. Weekly reports are due by the end of Friday."
      />
      {viewer.isAdmin && (
        <Callout className="mb-6" title="Reports are normally written by staff">
          As the administrator you can keep your own reports here too. Nobody is notified when you submit one.
        </Callout>
      )}
      <ReportForm
        action={createReportAction}
        values={{
          period,
          periodStart: range.start,
          periodEnd: range.end,
          summary: "",
          accomplishments: "",
          challenges: "",
          nextSteps: "",
          hours: null,
          assignmentIds: [],
        }}
        assignments={assignments}
        logs={logs}
        today={today}
        submitLabel="Submit report"
        cancelHref="/work-reports"
      />
    </div>
  );
}
