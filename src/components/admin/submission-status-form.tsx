"use client";

import { useActionState, useEffect } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { updateSubmission, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-controls";
import { cn } from "@/lib/utils";

const statuses = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
];

export function SubmissionStatusForm({ id, status, notes }: { id: number; status: string; notes: string }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSubmission, undefined);

  useEffect(() => {
    if (state?.ok) toast.success("Submission updated");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={id} />
      <fieldset>
        <legend className="text-sm font-semibold text-navy">Status</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {statuses.map((item) => (
            <label key={item.value} className="cursor-pointer">
              <input type="radio" name="status" value={item.value} defaultChecked={status === item.value} className="peer sr-only" />
              <span
                className={cn(
                  "block rounded-xl border border-mist px-3 py-2 text-center text-sm font-semibold text-charcoal transition-colors",
                  "peer-checked:border-blue peer-checked:bg-blue peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-blue/20",
                )}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="notes" className="text-sm font-semibold text-navy">
          Internal notes
        </label>
        <Textarea id="notes" name="notes" rows={5} defaultValue={notes} placeholder="Only visible to your team." className="mt-2" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
        Save changes
      </Button>
    </form>
  );
}
