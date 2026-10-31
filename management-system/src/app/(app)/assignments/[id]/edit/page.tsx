import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getAssignmentFor } from "@/lib/data/assignments";
import { organisation } from "@/lib/constants";
import { PageHeader } from "@/components/ui/page-header";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { loadFormOptions } from "../../_lib/form-options";
import { updateAssignmentAction } from "./actions";

export const metadata: Metadata = { title: "Edit assignment" };

export default async function EditAssignmentPage(props: PageProps<"/assignments/[id]/edit">) {
  const viewer = await requireAdmin();
  const { id } = await props.params;
  const assignment = await getAssignmentFor(viewer, id);
  if (!assignment) notFound();
  const options = await loadFormOptions(assignment.assigneeIds);

  return (
    <>
      <PageHeader
        back={{ href: `/assignments/${assignment.id}`, label: `Back to ${assignment.ref}` }}
        eyebrow={assignment.ref}
        title="Edit assignment"
        description="Change the details, team, dates or fee. Anyone newly assigned is notified, and so is the team if the due date moves."
        className="mx-auto max-w-4xl"
      />
      <AssignmentForm
        mode="edit"
        action={updateAssignmentAction}
        assignmentId={assignment.id}
        defaults={{
          title: assignment.title,
          description: assignment.description,
          track: assignment.track,
          categoryId: assignment.categoryId,
          academicLevel: assignment.academicLevel,
          clientId: assignment.clientId,
          clientName: assignment.clientName,
          assigneeIds: assignment.assigneeIds,
          priority: assignment.priority,
          startDate: assignment.startDate,
          dueDate: assignment.dueDate,
          estimatedHours: assignment.estimatedHours,
          fee: assignment.fee,
          paymentStatus: assignment.paymentStatus,
          amountPaid: assignment.amountPaid,
          tags: assignment.tags,
        }}
        categories={options.categories}
        clients={options.clients}
        people={options.people}
        cancelHref={`/assignments/${assignment.id}`}
        integrityNote={organisation.integrityNote}
      />
    </>
  );
}
