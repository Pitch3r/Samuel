import { Ban, CircleCheck, Hourglass } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/badge";
import type { DeviceStatus } from "@/lib/constants";

const STATUS: Record<DeviceStatus, { label: string; tone: Tone; icon: React.ReactNode }> = {
  approved: { label: "Approved", tone: "good", icon: <CircleCheck aria-hidden="true" /> },
  pending: { label: "Waiting for approval", tone: "warning", icon: <Hourglass aria-hidden="true" /> },
  blocked: { label: "Blocked", tone: "danger", icon: <Ban aria-hidden="true" /> },
};

/** Office computer status, always with an icon and a label. */
export function DeviceStatusBadge({ status }: { status: DeviceStatus }) {
  const style = STATUS[status];
  return (
    <Badge tone={style.tone} icon={style.icon}>
      {style.label}
    </Badge>
  );
}
