import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AssignmentNotFound() {
  return (
    <Card className="mx-auto max-w-xl">
      <EmptyState
        icon={<SearchX aria-hidden="true" />}
        title="Assignment not found"
        description="It may have been deleted, or it is not one of the assignments given to you."
        action={<ButtonLink href="/assignments">Back to assignments</ButtonLink>}
      />
    </Card>
  );
}
