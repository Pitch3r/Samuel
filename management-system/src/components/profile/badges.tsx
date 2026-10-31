import { Ban, CircleCheck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/constants";

/** Active or suspended, with an icon and a label. */
export function UserStatusBadge({ status }: { status: UserStatus }) {
  return status === "suspended" ? (
    <Badge tone="danger" icon={<Ban aria-hidden="true" />}>
      Suspended
    </Badge>
  ) : (
    <Badge tone="good" icon={<CircleCheck aria-hidden="true" />}>
      Active
    </Badge>
  );
}

export function AdminBadge() {
  return (
    <Badge tone="navy" icon={<ShieldCheck aria-hidden="true" />}>
      Administrator
    </Badge>
  );
}
