import "server-only";
import { listUsers } from "@/lib/data/users";
import type { PersonLite } from "@/components/assignments/assignment-list";

/** uid to name and photo, for avatars and labels. Deleted staff are included so past work keeps their name. */
export async function peopleMap(): Promise<Map<string, PersonLite>> {
  const users = await listUsers({ includeDeleted: true });
  return new Map(users.map((user) => [user.uid, { uid: user.uid, name: user.displayName, photoVersion: user.photoUpdatedAt }]));
}
