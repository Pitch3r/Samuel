import "server-only";
import type { z } from "zod";
import { listCategories } from "@/lib/data/categories";
import { getClient } from "@/lib/data/clients";
import { listUsers } from "@/lib/data/users";
import type { AssignmentInput } from "@/lib/data/assignments";
import { parseMilestoneLines, type assignmentSchema } from "@/lib/validation";
import type { ActionResult, Assignment } from "@/lib/types";

type FormValues = z.output<typeof assignmentSchema>;

function fieldError(field: string, message: string): { ok: false; result: ActionResult<never> } {
  return { ok: false, result: { ok: false, message: "Please check the highlighted fields.", fieldErrors: { [field]: [message] } } };
}

/**
 * Turns validated form values into the data layer's input, checking every
 * reference against the database rather than trusting the form: the category
 * must exist and belong to the chosen track, the client must exist, and the
 * people must be real, active members of staff.
 */
export async function buildAssignmentInput(
  values: FormValues,
  existing?: Assignment,
): Promise<{ ok: true; input: AssignmentInput } | { ok: false; result: ActionResult<never> }> {
  const [categories, users] = await Promise.all([listCategories({ includeInactive: true }), listUsers()]);

  const category = categories.find((item) => item.id === values.categoryId);
  // A retired category stays valid on an assignment that already uses it.
  if (!category || (!category.active && existing?.categoryId !== category.id)) {
    return fieldError("categoryId", "Choose a category from the list.");
  }
  if (category.track !== values.track) return fieldError("categoryId", "Choose a category from the selected track.");

  let clientId: string | null = null;
  let clientName = values.clientName;
  if (values.clientId) {
    const client = await getClient(values.clientId);
    if (!client) return fieldError("clientId", "That client could not be found. Choose another, or type the client's name.");
    clientId = client.id;
    clientName = client.name;
  } else if (!clientName) {
    return fieldError("clientName", "Choose a client from the list, or type the client's name.");
  }

  const staff = new Map(users.map((user) => [user.uid, user]));
  const assigneeIds = [...new Set(values.assigneeIds)];
  for (const uid of assigneeIds) {
    const user = staff.get(uid);
    // Someone already on the assignment can stay on it after being suspended; nobody new can be added.
    if (!user || (user.status !== "active" && !existing?.assigneeIds.includes(uid))) {
      return fieldError("assigneeIds", "One of the selected people cannot be assigned. Refresh the page and try again.");
    }
  }

  return {
    ok: true,
    input: {
      title: values.title,
      description: values.description,
      track: values.track,
      categoryId: category.id,
      categoryName: category.name,
      academicLevel: values.track === "academic" ? values.academicLevel : null,
      clientId,
      clientName,
      assigneeIds,
      priority: values.priority,
      startDate: values.startDate,
      dueDate: values.dueDate,
      estimatedHours: values.estimatedHours,
      fee: values.fee,
      paymentStatus: values.paymentStatus,
      amountPaid: values.amountPaid,
      tags: values.tags.slice(0, 20).map((tag) => tag.slice(0, 40)),
      milestones: existing ? undefined : parseMilestoneLines(values.milestones),
    },
  };
}
