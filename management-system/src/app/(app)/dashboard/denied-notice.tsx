import { Callout } from "@/components/ui/callout";

/** Shown when requireAdmin() sends someone back here from an administrator-only page. */
export function DeniedNotice() {
  return (
    <Callout tone="warning" title="That page needs administrator access" className="mb-6">
      It is only available to the administrator, so you have been brought back to your dashboard. If you need something from it, please ask the administrator.
    </Callout>
  );
}
