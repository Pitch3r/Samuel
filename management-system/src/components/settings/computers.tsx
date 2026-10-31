import { Ban, Hourglass, Monitor, MonitorSmartphone, ShieldCheck, Trash2, Undo2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Callout } from "@/components/ui/callout";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmActionForm } from "@/components/settings/toast-forms";
import { TableWrap } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { DeviceStatusBadge } from "@/components/settings/device-badges";
import { ApproveDeviceButton, EditDeviceButton, RegisterComputerForm, type DeviceFormValues } from "@/components/settings/device-forms";
import { DEVICE_VIA_LABELS, deviceSystem } from "@/components/settings/policy-text";
import type { EmployeeOption } from "@/components/settings/employee-picker";
import { formatDateTime, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActionResult, Device } from "@/lib/types";

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export type ComputerActions = {
  register: Action;
  approve: Action;
  update: Action;
  setBlocked: Action;
  remove: Action;
};

type Person = { name: string; photoVersion: string | null };

function formValues(device: Device): DeviceFormValues {
  return {
    id: device.id,
    label: device.label,
    assignedUids: device.assignedUids,
    requestedByName: device.requestedByName,
    system: deviceSystem(device),
  };
}

/** Short, recognisable fragment of a computer's id, for telling records apart. */
function shortId(id: string) {
  return id.slice(0, 6).toUpperCase();
}

function SystemDetails({ device }: { device: Device }) {
  const extras = [device.details.screen && `Screen ${device.details.screen}`, device.details.timeZone, device.details.language].filter(Boolean);
  return (
    <div className="min-w-0 text-sm">
      <p className="text-charcoal">{deviceSystem(device)}</p>
      {extras.length > 0 && <p className="mt-0.5 text-xs text-slate">{extras.join(", ")}</p>}
    </div>
  );
}

function AssignedPeople({ uids, people }: { uids: string[]; people: Map<string, Person> }) {
  if (!uids.length) return <span className="text-sm text-slate">Any employee</span>;
  return (
    <ul className="space-y-1.5">
      {uids.map((uid) => {
        const person = people.get(uid);
        return (
          <li key={uid} className="flex items-center gap-2 text-sm">
            <Avatar name={person?.name ?? "?"} uid={person ? uid : undefined} photoVersion={person?.photoVersion} size="xs" />
            <span className="truncate text-charcoal">{person?.name ?? "Removed account"}</span>
          </li>
        );
      })}
    </ul>
  );
}

function BlockButton({ device, action }: { device: Device; action: Action }) {
  const blocking = device.status !== "blocked";
  return (
    <ConfirmActionForm
      action={action}
      hidden={{ deviceId: device.id, intent: blocking ? "block" : "unblock" }}
      confirm={
        blocking
          ? `Block "${device.label}"? Employees using it are signed out at once and cannot sign in on it until you unblock it.`
          : `Unblock "${device.label}"?`
      }
    >
      <button type="submit" className={buttonClasses({ variant: "secondary", size: "sm" })}>
        {blocking ? <Ban aria-hidden="true" /> : <Undo2 aria-hidden="true" />}
        {blocking ? "Block" : "Unblock"}
      </button>
    </ConfirmActionForm>
  );
}

function RemoveButton({ device, action }: { device: Device; action: Action }) {
  return (
    <ConfirmActionForm
      action={action}
      hidden={{ deviceId: device.id }}
      confirm={`Remove "${device.label}" from the list? If the computer lock is on, it will need approving again before an employee can sign in on it.`}
    >
      <button type="submit" className={buttonClasses({ variant: "ghost", size: "sm", className: "text-danger hover:bg-danger-tint" })}>
        <Trash2 aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Remove</span>
      </button>
    </ConfirmActionForm>
  );
}

/* ------------------------------------------------------------------ this computer */

export function ThisComputerCard({
  deviceId,
  device,
  employees,
  people,
  suggestedLabel,
  actions,
}: {
  deviceId: string | null;
  device: Device | null;
  employees: EmployeeOption[];
  people: Map<string, Person>;
  suggestedLabel: string;
  actions: ComputerActions;
}) {
  const approved = device?.status === "approved";
  return (
    <Card className={cn(approved && "ring-1 ring-good/25")}>
      <CardHeader
        icon={<MonitorSmartphone aria-hidden="true" />}
        title="This computer"
        description="Sign in as administrator on each office computer and register it here. Employees can then sign in on it."
        action={
          device ? (
            <div className="flex flex-wrap items-center gap-2">
              <DeviceStatusBadge status={device.status} />
              {approved && <EditDeviceButton action={actions.update} device={formValues(device)} employees={employees} />}
            </div>
          ) : (
            <Badge tone="neutral">Not registered</Badge>
          )
        }
      />
      <CardBody>
        {approved && device ? (
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate uppercase">Name</p>
              <p className="mt-1 font-semibold text-navy">{device.label}</p>
              <p className="mt-0.5 text-xs text-slate">
                Computer ID {shortId(device.id)}, {DEVICE_VIA_LABELS[device.registeredVia]?.toLowerCase() ?? "registered"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold tracking-wide text-slate uppercase">Who may use it</p>
              <AssignedPeople uids={device.assignedUids} people={people} />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold tracking-wide text-slate uppercase">System</p>
              <SystemDetails device={device} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {device?.status === "blocked" && (
              <Callout tone="warning" title="This computer is blocked">
                Registering it approves it again as an office computer.
              </Callout>
            )}
            {device?.status === "pending" && (
              <Callout tone="info" title="This computer is waiting for approval">
                {device.requestedByName ? `${device.requestedByName} asked to use it. ` : ""}Registering it here approves it.
              </Callout>
            )}
            {!device && (
              <p className="text-sm text-slate">
                {deviceId ? `This browser is known as computer ${shortId(deviceId)}, ` : "This browser has not been seen before, "}
                but it is not an office computer yet. Register it if this is one of the office computers employees will use.
              </p>
            )}
            <RegisterComputerForm
              action={actions.register}
              employees={employees}
              suggestedLabel={suggestedLabel}
              currentLabel={device && !device.label.includes(" on ") ? device.label : undefined}
              selected={device?.assignedUids.length ? device.assignedUids : device?.requestedBy ? [device.requestedBy] : []}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ pending */

export function PendingRequests({ devices, employees, actions }: { devices: Device[]; employees: EmployeeOption[]; actions: ComputerActions }) {
  if (!devices.length) return null;
  return (
    <Card className="border-warning/30 ring-1 ring-warning/20">
      <CardHeader
        icon={<Hourglass aria-hidden="true" />}
        title={`Waiting for approval (${devices.length})`}
        description="Employees tried to sign in on these computers. Approve the ones that belong to the office and block the rest."
        className="bg-warning-tint/50"
      />
      <ul className="divide-y divide-mist">
        {devices.map((device) => (
          <li key={device.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning-tint text-warning">
                <Monitor className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-navy">
                  {device.requestedByName ? `${device.requestedByName} asked to use this computer` : "A new computer asked to be registered"}
                </p>
                <p className="mt-0.5 text-slate">
                  {deviceSystem(device)}
                  {device.details.screen ? `, screen ${device.details.screen}` : ""}
                  {device.lastIp ? `, from ${device.lastIp}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-slate">
                  First seen{" "}
                  <time dateTime={device.firstSeenAt} title={formatDateTime(device.firstSeenAt)}>
                    {formatRelative(device.firstSeenAt)}
                  </time>
                  {device.lastSeenAt !== device.firstSeenAt && (
                    <>
                      , last tried{" "}
                      <time dateTime={device.lastSeenAt} title={formatDateTime(device.lastSeenAt)}>
                        {formatRelative(device.lastSeenAt)}
                      </time>
                    </>
                  )}
                  . Computer ID {shortId(device.id)}.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
              <ApproveDeviceButton
                action={actions.approve}
                device={{ ...formValues(device), requestedBy: device.requestedBy }}
                employees={employees}
              />
              <BlockButton device={device} action={actions.setBlocked} />
              <RemoveButton device={device} action={actions.remove} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------ table */

export function ComputersTable({
  devices,
  currentId,
  employees,
  people,
  actions,
}: {
  devices: Device[];
  currentId: string | null;
  employees: EmployeeOption[];
  people: Map<string, Person>;
  actions: ComputerActions;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<ShieldCheck aria-hidden="true" />}
        title="Office computers"
        description="Approved and blocked computers. An approved computer can be limited to named employees, or left open to any employee."
      />
      {devices.length === 0 ? (
        <EmptyState
          icon={<Monitor aria-hidden="true" />}
          title="No office computers yet"
          description="Register this computer above, or approve computers as employees sign in on them."
        />
      ) : (
        <TableWrap className="relative">
          <table className="data-table min-w-[60rem]">
            <thead>
              <tr>
                <th scope="col">Computer</th>
                <th scope="col">Status</th>
                <th scope="col">Who may use it</th>
                <th scope="col">System</th>
                <th scope="col">Last used</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id} className={cn(device.status === "blocked" && "[&>td]:bg-danger-tint/25")}>
                  <td className="max-w-64">
                    <p className="flex flex-wrap items-center gap-2 font-semibold text-navy">
                      {device.label}
                      {device.id === currentId && <Badge tone="blue">This computer</Badge>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate">
                      {DEVICE_VIA_LABELS[device.registeredVia] ?? "Registered"}
                      {device.approvedAt ? `, ${formatDateTime(device.approvedAt)}` : ""}
                    </p>
                  </td>
                  <td>
                    <DeviceStatusBadge status={device.status} />
                  </td>
                  <td>
                    <AssignedPeople uids={device.assignedUids} people={people} />
                  </td>
                  <td>
                    <SystemDetails device={device} />
                  </td>
                  <td className="text-sm">
                    <time dateTime={device.lastSeenAt} title={formatDateTime(device.lastSeenAt)} className="text-charcoal">
                      {formatRelative(device.lastSeenAt)}
                    </time>
                    <p className="mt-0.5 text-xs text-slate">
                      {[device.lastUserName && `by ${device.lastUserName}`, device.lastIp && `from ${device.lastIp}`].filter(Boolean).join(", ") ||
                        "No sign-ins yet"}
                    </p>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      {device.status === "approved" && <EditDeviceButton action={actions.update} device={formValues(device)} employees={employees} />}
                      <BlockButton device={device} action={actions.setBlocked} />
                      <RemoveButton device={device} action={actions.remove} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </Card>
  );
}
