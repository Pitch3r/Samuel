"use client";

import { Trash2 } from "lucide-react";
import { ConfirmForm } from "@/components/ui/form";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

/** Remove a file after confirming. The row disappears on success, so the toast is raised straight away. */
export function RemoveFileButton({ assignmentId, fileId, name, action }: { assignmentId: string; fileId: string; name: string; action: Action }) {
  return (
    <ConfirmForm action={action} confirm={`Remove "${name}"? This cannot be undone.`} hidden={{ assignmentId, fileId }}>
      <button type="submit" className="rounded-lg p-2 text-slate hover:bg-danger-tint hover:text-danger" aria-label={`Remove ${name}`} title="Remove">
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </ConfirmForm>
  );
}
