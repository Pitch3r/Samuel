import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth/session";
import { unreadCount } from "@/lib/data/notifications";
import { listDevices, getDevice } from "@/lib/data/devices";
import { listAssignmentsFor } from "@/lib/data/assignments";
import { signOutAction } from "./actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireUser();
  const [unread, devices, device, assignments] = await Promise.all([
    unreadCount(viewer.uid),
    viewer.isAdmin ? listDevices() : Promise.resolve([]),
    viewer.deviceId ? getDevice(viewer.deviceId) : Promise.resolve(null),
    viewer.isAdmin ? listAssignmentsFor(viewer) : Promise.resolve([]),
  ]);
  const computer = device && device.status === "approved" ? device.label : null;
  return (
    <AppShell
      viewer={{
        uid: viewer.uid,
        name: viewer.name,
        email: viewer.email,
        isAdmin: viewer.isAdmin,
        jobTitle: viewer.profile.jobTitle,
        photoVersion: viewer.profile.photoUpdatedAt,
      }}
      counts={{
        unread,
        pendingDevices: devices.filter((d) => d.status === "pending").length,
        reviewQueue: assignments.filter((a) => a.status === "under_review").length,
      }}
      computer={computer}
      signOut={signOutAction}
    >
      {children}
    </AppShell>
  );
}
