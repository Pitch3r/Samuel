import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function WorkReportNotFound() {
  return (
    <Card className="mx-auto max-w-xl">
      <EmptyState
        icon={<SearchX aria-hidden="true" />}
        title="Report not found"
        description="It may have been deleted, or it belongs to someone else."
        action={<ButtonLink href="/work-reports">Back to work reports</ButtonLink>}
      />
    </Card>
  );
}
