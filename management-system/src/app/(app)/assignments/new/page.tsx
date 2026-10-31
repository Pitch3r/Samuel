import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { organisation } from "@/lib/constants";
import { todayISO } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { AssignmentForm, type AssignmentFormDefaults } from "@/components/assignments/assignment-form";
import { loadFormOptions } from "../_lib/form-options";
import { createAssignmentAction } from "./actions";

export const metadata: Metadata = { title: "New assignment" };

const ACADEMIC_CLIENTS = ["Student or researcher", "University or institute"];

export default async function NewAssignmentPage(props: PageProps<"/assignments/new">) {
  await requireAdmin();
  const params = await props.searchParams;
  const options = await loadFormOptions();

  // "New assignment" links from a client's page or the calendar can pre-fill the client, track and due date.
  const clientParam = typeof params.client === "string" ? params.client : "";
  const client = options.clients.find((item) => item.id === clientParam);
  const track = params.track === "academic" || (params.track !== "corporate" && client && ACADEMIC_CLIENTS.includes(client.type)) ? "academic" : "corporate";
  const due = typeof params.due === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.due) ? params.due : null;

  const defaults: AssignmentFormDefaults = {
    title: "",
    description: "",
    track,
    categoryId: "",
    academicLevel: null,
    clientId: client?.id ?? null,
    clientName: "",
    assigneeIds: [],
    priority: "normal",
    startDate: todayISO(),
    dueDate: due,
    estimatedHours: null,
    fee: null,
    paymentStatus: "not_invoiced",
    amountPaid: 0,
    tags: [],
  };

  return (
    <>
      <PageHeader
        back={{ href: "/assignments", label: "All assignments" }}
        title="New assignment"
        description="Set out the work, choose who does it and when it is due. The people you assign are notified straight away."
        className="mx-auto max-w-4xl"
      />
      <AssignmentForm
        mode="create"
        action={createAssignmentAction}
        defaults={defaults}
        categories={options.categories}
        clients={options.clients}
        people={options.people}
        cancelHref="/assignments"
        integrityNote={organisation.integrityNote}
      />
    </>
  );
}
