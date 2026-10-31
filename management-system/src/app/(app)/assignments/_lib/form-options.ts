import "server-only";
import { listCategories } from "@/lib/data/categories";
import { listClients } from "@/lib/data/clients";
import { listUsers } from "@/lib/data/users";
import type { FormCategory, FormClient, FormPerson } from "@/components/assignments/assignment-form";

/**
 * The plain, serialisable choices the assignment form needs. Only active staff
 * can be picked, plus anyone already on the assignment being edited.
 */
export async function loadFormOptions(currentAssigneeIds: string[] = []) {
  const [categories, clients, users] = await Promise.all([listCategories({ includeInactive: true }), listClients(), listUsers()]);
  return {
    categories: categories.map(
      (category): FormCategory => ({
        id: category.id,
        name: category.name,
        track: category.track,
        description: category.description,
        active: category.active,
      }),
    ),
    clients: clients.map((client): FormClient => ({ id: client.id, name: client.name, type: client.type })),
    people: users
      .filter((user) => user.status === "active" || currentAssigneeIds.includes(user.uid))
      .map(
        (user): FormPerson => ({
          uid: user.uid,
          name: user.status === "active" ? user.displayName : `${user.displayName} (suspended)`,
          jobTitle: user.jobTitle,
          isAdmin: user.role === "admin",
          photoVersion: user.photoUpdatedAt,
        }),
      ),
  };
}
