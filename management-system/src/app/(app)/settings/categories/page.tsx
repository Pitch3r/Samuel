import type { Metadata } from "next";
import { Archive, ArchiveRestore, ArrowDown, ArrowUp, Briefcase, CircleMinus, FolderTree, GraduationCap } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { listCategories } from "@/lib/data/categories";
import { listAllAssignments } from "@/lib/data/assignments";
import { TRACKS, TRACK_DESCRIPTIONS, TRACK_LABELS, isOpenStatus, type Track } from "@/lib/constants";
import { plural } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { ConfirmActionForm, QuickActionForm } from "@/components/settings/toast-forms";
import { buttonClasses } from "@/components/ui/button";
import { AddCategoryButton, EditCategoryButton } from "@/components/settings/category-forms";
import { createCategoryAction, moveCategoryAction, setCategoryActiveAction, updateCategoryAction } from "./actions";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Categories" };

const TRACK_ICONS: Record<Track, React.ReactNode> = {
  corporate: <Briefcase aria-hidden="true" />,
  academic: <GraduationCap aria-hidden="true" />,
};

type Usage = { total: number; open: number };

export default async function CategoriesPage() {
  const viewer = await requireAdmin();
  const [categories, assignments] = await Promise.all([listCategories({ includeInactive: true }), listAllAssignments(viewer)]);

  const usage = new Map<string, Usage>();
  for (const assignment of assignments) {
    const entry = usage.get(assignment.categoryId) ?? { total: 0, open: 0 };
    entry.total += 1;
    if (isOpenStatus(assignment.status)) entry.open += 1;
    usage.set(assignment.categoryId, entry);
  }
  const known = new Set(categories.map((category) => category.id));
  const unfiled = assignments.filter((assignment) => !known.has(assignment.categoryId)).length;
  const mostUsed = [...categories].sort((a, b) => (usage.get(b.id)?.total ?? 0) - (usage.get(a.id)?.total ?? 0))[0];
  const retired = categories.filter((category) => !category.active).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        back={{ href: "/settings", label: "Settings" }}
        title="Categories"
        description="The service lines that assignments are filed under. Reports and performance break work down by these categories. Retire a category to stop it being chosen for new work; existing assignments keep it."
        actions={<AddCategoryButton action={createCategoryAction} />}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {TRACKS.map((track) => {
          const inTrack = categories.filter((category) => category.track === track);
          return (
            <StatCard
              key={track}
              label={TRACK_LABELS[track]}
              value={inTrack.filter((category) => category.active).length}
              icon={TRACK_ICONS[track]}
              hint={`active ${inTrack.filter((category) => category.active).length === 1 ? "category" : "categories"}`}
            />
          );
        })}
        <StatCard
          label="Retired"
          value={retired}
          icon={<Archive aria-hidden="true" />}
          hint={retired ? "Kept on past assignments" : "None retired"}
        />
        <StatCard
          label="Most used"
          value={mostUsed ? (usage.get(mostUsed.id)?.total ?? 0) : 0}
          icon={<FolderTree aria-hidden="true" />}
          hint={mostUsed && usage.get(mostUsed.id) ? mostUsed.name : "No assignments yet"}
        />
      </div>

      {unfiled > 0 && (
        <Callout tone="info" className="mb-6" title={`${plural(unfiled, "assignment")} filed under a category that no longer exists`}>
          They still show the category name they were filed under. Edit those assignments to move them into a current category.
        </Callout>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {TRACKS.map((track) => (
          <TrackCard key={track} track={track} categories={categories.filter((category) => category.track === track)} usage={usage} />
        ))}
      </div>
    </div>
  );
}

function TrackCard({ track, categories, usage }: { track: Track; categories: Category[]; usage: Map<string, Usage> }) {
  const activeCount = categories.filter((category) => category.active).length;
  return (
    <Card className="overflow-hidden">
      <CardHeader icon={TRACK_ICONS[track]} title={TRACK_LABELS[track]} description={TRACK_DESCRIPTIONS[track]} />
      {categories.length === 0 ? (
        <EmptyState icon={<FolderTree aria-hidden="true" />} title="No categories yet" description="Add the service lines this track offers." />
      ) : (
        <ol className="divide-y divide-mist">
          {categories.map((category, index) => {
            const used = usage.get(category.id) ?? { total: 0, open: 0 };
            const lastActive = category.active && activeCount === 1;
            return (
              <li key={category.id} className={category.active ? "" : "bg-cloud/60"}>
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className="flex shrink-0 flex-col gap-0.5 pt-0.5">
                    <MoveButton id={category.id} direction="up" disabled={index === 0} name={category.name} />
                    <MoveButton id={category.id} direction="down" disabled={index === categories.length - 1} name={category.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={category.active ? "font-semibold text-navy" : "font-semibold text-slate"}>{category.name}</p>
                      {!category.active && (
                        <Badge tone="neutral" icon={<CircleMinus aria-hidden="true" />}>
                          Retired
                        </Badge>
                      )}
                    </div>
                    {category.description && <p className="mt-1 text-sm text-slate">{category.description}</p>}
                    <p className="mt-1.5 text-xs text-slate">
                      {used.total ? (
                        <>
                          <span className="tabular font-semibold text-navy">{plural(used.total, "assignment")}</span>
                          {used.open ? `, ${used.open} open` : ", none open"}
                        </>
                      ) : (
                        "Not used yet"
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <EditCategoryButton
                      action={updateCategoryAction}
                      category={{ id: category.id, name: category.name, description: category.description, track: category.track }}
                    />
                    <ConfirmActionForm
                      action={setCategoryActiveAction}
                      hidden={{ id: category.id, active: category.active ? "false" : "true" }}
                      confirm={
                        category.active
                          ? `Retire "${category.name}"? It will no longer be offered for new assignments. ${used.total ? `The ${plural(used.total, "assignment")} filed under it keep it.` : ""}`
                          : `Make "${category.name}" available for new assignments again?`
                      }
                    >
                      <button
                        type="submit"
                        disabled={lastActive}
                        title={lastActive ? "Each track needs at least one active category" : undefined}
                        className={buttonClasses({ variant: "ghost", size: "sm" })}
                      >
                        {category.active ? <Archive aria-hidden="true" /> : <ArchiveRestore aria-hidden="true" />}
                        {category.active ? "Retire" : "Reactivate"}
                      </button>
                    </ConfirmActionForm>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 bg-cloud/40">
        <p className="text-xs text-slate">
          {plural(activeCount, "active category", "active categories")}
          {categories.length > activeCount ? `, ${categories.length - activeCount} retired` : ""}. Use the arrows to set the order staff see.
        </p>
        <AddCategoryButton action={createCategoryAction} track={track} variant="secondary" />
      </CardFooter>
    </Card>
  );
}

function MoveButton({ id, direction, disabled, name }: { id: string; direction: "up" | "down"; disabled: boolean; name: string }) {
  return (
    <QuickActionForm action={moveCategoryAction} hidden={{ id, direction }}>
      <button
        type="submit"
        disabled={disabled}
        className="grid size-6 place-items-center rounded-md text-slate hover:bg-cloud hover:text-navy disabled:opacity-30"
        aria-label={`Move ${name} ${direction}`}
      >
        {direction === "up" ? <ArrowUp className="size-3.5" aria-hidden="true" /> : <ArrowDown className="size-3.5" aria-hidden="true" />}
      </button>
    </QuickActionForm>
  );
}
