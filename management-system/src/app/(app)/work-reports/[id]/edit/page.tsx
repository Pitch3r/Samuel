import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getWorkReport } from "@/lib/data/work-reports";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { ReportForm } from "@/components/work-reports/report-form";
import { reportTitle } from "@/components/work-reports/periods";
import { loadReportFormData } from "../../_lib/form-data";
import { updateReportAction } from "./actions";

export const metadata: Metadata = { title: "Edit work report" };

export default async function EditWorkReportPage(props: PageProps<"/work-reports/[id]/edit">) {
  const viewer = await requireUser();
  const { id } = await props.params;
  const report = await getWorkReport(viewer, id);
  if (!report) notFound();
  const back = { href: `/work-reports/${report.id}`, label: "Back to the report" };

  // Only the author edits, and only until the administrator has reviewed it.
  if (report.uid !== viewer.uid || report.status === "reviewed") {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader back={back} title="Edit work report" />
        <Card className="mx-auto max-w-xl">
          <EmptyState
            icon={<Lock aria-hidden="true" />}
            title="This report can no longer be edited"
            description={
              report.uid !== viewer.uid
                ? "Only the person who wrote a report can edit it."
                : "It has been reviewed by the administrator. Write a new report if something needs adding."
            }
            action={<ButtonLink href={back.href}>Open the report</ButtonLink>}
          />
        </Card>
      </div>
    );
  }

  const { today, assignments, logs } = await loadReportFormData(viewer, { from: report.periodStart, linked: report.assignmentIds });
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader back={back} eyebrow="Edit report" title={reportTitle(report)} description="Update your report. Changes are visible to the administrator straight away." />
      <ReportForm
        action={updateReportAction.bind(null, report.id)}
        values={{
          period: report.period,
          periodStart: report.periodStart,
          periodEnd: report.periodEnd,
          summary: report.summary,
          accomplishments: report.accomplishments,
          challenges: report.challenges,
          nextSteps: report.nextSteps,
          hours: report.hours,
          assignmentIds: report.assignmentIds,
        }}
        assignments={assignments}
        logs={logs}
        today={today}
        submitLabel="Save changes"
        cancelHref={back.href}
      />
    </div>
  );
}
