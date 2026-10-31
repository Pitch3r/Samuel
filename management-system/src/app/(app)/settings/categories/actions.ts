"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { createCategory, getCategory, listCategories, updateCategory } from "@/lib/data/categories";
import { logActivity } from "@/lib/data/activity";
import { actionError } from "@/lib/actions";
import { categorySchema, parseForm } from "@/lib/validation";
import { TRACK_LABELS, type Track } from "@/lib/constants";
import type { ActionResult, Category } from "@/lib/types";

/*
 * Category actions, administrator only. A category's track is fixed once it
 * exists, because assignments filed under it carry that track.
 */

type State = ActionResult | null;

const GONE: ActionResult = { ok: false, message: "That category could not be found. Refresh the page and try again." };

const idField = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/, "Not a valid id.");

const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Another category in the same track with this name, if any. */
async function duplicateOf(name: string, track: Track, exceptId?: string) {
  return (await listCategories({ includeInactive: true })).find(
    (category) => category.track === track && category.id !== exceptId && sameName(category.name, name),
  );
}

const DUPLICATE = (track: Track): ActionResult => ({
  ok: false,
  message: "Please check the highlighted fields.",
  fieldErrors: { name: [`${TRACK_LABELS[track]} already has a category with this name.`] },
});

export async function createCategoryAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(categorySchema, formData);
  if (!parsed.ok) return parsed.result;
  const input = parsed.data;
  try {
    if (await duplicateOf(input.name, input.track)) return DUPLICATE(input.track);
    const id = await createCategory(input);
    await logActivity(viewer, {
      action: "category.created",
      entityType: "category",
      entityId: id,
      summary: `Added the category "${input.name}" to ${TRACK_LABELS[input.track].toLowerCase()}`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: `${input.name} added.` };
}

const editSchema = categorySchema.omit({ track: true }).extend({ id: idField });

export async function updateCategoryAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(editSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { id, name, description } = parsed.data;
  try {
    const category = await getCategory(id);
    if (!category) return GONE;
    if (await duplicateOf(name, category.track, id)) return DUPLICATE(category.track);
    await updateCategory(id, { name, description });
    await logActivity(viewer, {
      action: "category.updated",
      entityType: "category",
      entityId: id,
      summary: category.name === name ? `Updated the description of "${name}"` : `Renamed the category "${category.name}" to "${name}"`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: "Category saved." };
}

const toggleSchema = z.object({ id: idField, active: z.enum(["true", "false"]).transform((value) => value === "true") });

export async function setCategoryActiveAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(toggleSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { id, active } = parsed.data;
  try {
    const all = await listCategories({ includeInactive: true });
    const category = all.find((item) => item.id === id);
    if (!category) return GONE;
    // New assignments always need somewhere to go in each track.
    const othersActive = all.filter((item) => item.track === category.track && item.active && item.id !== id).length;
    if (!active && othersActive === 0) {
      return {
        ok: false,
        message: `Keep at least one active category in ${TRACK_LABELS[category.track].toLowerCase()}, so new assignments can be filed.`,
      };
    }
    await updateCategory(id, { active });
    await logActivity(viewer, {
      action: active ? "category.activated" : "category.deactivated",
      entityType: "category",
      entityId: id,
      summary: `${active ? "Reactivated" : "Retired"} the category "${category.name}"`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true, message: active ? "Category is active again." : "Category retired. Existing assignments keep it." };
}

const moveSchema = z.object({ id: idField, direction: z.enum(["up", "down"]) });

/** Moves a category one place up or down within its track, renumbering the track so the order is always clean. */
export async function moveCategoryAction(_state: State, formData: FormData): Promise<ActionResult> {
  const viewer = await requireAdmin();
  const parsed = parseForm(moveSchema, formData);
  if (!parsed.ok) return parsed.result;
  const { id, direction } = parsed.data;
  try {
    const all = await listCategories({ includeInactive: true });
    const category = all.find((item) => item.id === id);
    if (!category) return GONE;
    const track: Category[] = all.filter((item) => item.track === category.track);
    const from = track.findIndex((item) => item.id === id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (to < 0 || to >= track.length) return { ok: true };
    const reordered = [...track];
    reordered.splice(from, 1);
    reordered.splice(to, 0, category);
    await Promise.all(reordered.map((item, index) => (item.order === index ? null : updateCategory(item.id, { order: index }))));
    await logActivity(viewer, {
      action: "category.reordered",
      entityType: "category",
      entityId: id,
      summary: `Moved the category "${category.name}" ${direction} the list`,
    });
  } catch (error) {
    return actionError(error);
  }
  refresh();
  return { ok: true };
}
