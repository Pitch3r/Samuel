import { Building } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClientNotFound() {
  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <EmptyState
        icon={<Building aria-hidden="true" />}
        title="That client could not be found"
        description="It may have been deleted. Its assignments are kept and still show the client's name."
        action={<ButtonLink href="/clients">Back to clients</ButtonLink>}
      />
    </Card>
  );
}
