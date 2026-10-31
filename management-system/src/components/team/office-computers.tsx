import { Monitor, MonitorOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { Device } from "@/lib/types";

const VIA: Record<Device["registeredVia"], string> = {
  "first-sign-in": "Bound on first office sign-in",
  admin: "Registered by the administrator",
  request: "Approved on request",
};

/** The approved office computers an employee is bound to. */
export function OfficeComputerList({ devices, empty = "No office computer registered." }: { devices: Device[]; empty?: string }) {
  if (!devices.length) return <EmptyState icon={<MonitorOff aria-hidden="true" />} title={empty} className="py-6" />;
  return (
    <ul className="space-y-3">
      {devices.map((device) => (
        <li key={device.id} className="flex items-start gap-3 rounded-xl border border-mist bg-cloud/50 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-navy ring-1 ring-mist">
            <Monitor className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-navy">{device.label}</p>
              <Badge tone="good">Approved</Badge>
              {device.assignedUids.length > 1 && <Badge tone="neutral">Shared</Badge>}
              {device.status === "blocked" && <Badge tone="danger">Blocked</Badge>}
              {device.status === "pending" && <Badge tone="warning">Waiting for approval</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-slate">
              {device.details.browser} on {device.details.os}
              {device.details.screen ? `, ${device.details.screen}` : ""}
            </p>
            <p className="mt-1 text-xs text-slate">
              {VIA[device.registeredVia] ?? "Registered"}
              {device.approvedAt ? ` on ${formatDateTime(device.approvedAt)}` : ""}. Last used{" "}
              <time dateTime={device.lastSeenAt} title={formatDateTime(device.lastSeenAt)}>
                {formatRelative(device.lastSeenAt)}
              </time>
              {device.lastIp ? ` from ${device.lastIp}` : ""}.
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
