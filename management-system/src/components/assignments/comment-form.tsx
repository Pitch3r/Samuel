"use client";

import { Send } from "lucide-react";
import { ActionForm, SubmitButton, Textarea, useFieldError } from "@/components/ui/form";
import { Avatar } from "@/components/ui/avatar";
import type { ActionResult } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

function CommentBox() {
  const error = useFieldError("text");
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="comment-text" className="sr-only">
        Comment
      </label>
      <Textarea
        id="comment-text"
        name="text"
        rows={3}
        maxLength={4000}
        placeholder="Share an update, ask a question or leave a note for the team."
        onKeyDown={(event) => {
          // Ctrl or Cmd and Enter posts the comment.
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) event.currentTarget.form?.requestSubmit();
        }}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function CommentForm({
  assignmentId,
  action,
  viewer,
}: {
  assignmentId: string;
  action: Action;
  viewer: { uid: string; name: string; photoVersion: string | null };
}) {
  return (
    <ActionForm action={action} resetOnSuccess className="flex gap-3">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <Avatar name={viewer.name} uid={viewer.uid} photoVersion={viewer.photoVersion} size="sm" className="mt-1 hidden ring-mist sm:inline-grid" />
      <div className="min-w-0 flex-1 space-y-2">
        <CommentBox />
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-xs text-slate sm:block">Everyone on the assignment is notified. Press Ctrl and Enter to post.</p>
          <SubmitButton size="sm" pendingLabel="Posting" className="ml-auto">
            <Send aria-hidden="true" />
            Post comment
          </SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}
