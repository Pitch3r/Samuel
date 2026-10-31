import type { PersonLite } from "@/components/assignments/assignment-list";
import type { UserProfile } from "@/lib/types";

/** uid to name and photo, built from a user list the page has already loaded. */
export function toPeopleMap(users: UserProfile[]): Map<string, PersonLite> {
  return new Map(users.map((user) => [user.uid, { uid: user.uid, name: user.displayName, photoVersion: user.photoUpdatedAt }]));
}
