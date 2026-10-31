import { UserX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function TeamMemberNotFound() {
  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <EmptyState
        icon={<UserX aria-hidden="true" />}
        title="That member of staff could not be found"
        description="The account may have been deleted. Their past work still shows their name on assignments and reports."
        action={<ButtonLink href="/team">Back to the team</ButtonLink>}
      />
    </Card>
  );
}
