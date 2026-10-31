import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Ban, Camera, ClipboardList, FileText, History, KeyRound, LogOut, Mail, Monitor, ShieldCheck, Trash2, UserCheck, UserRound } from "lucide-react";
import { approvedDevicesFor, devicesFor } from "@/lib/data/devices";
import { listSessionsForUser } from "@/lib/data/sessions";
import { listActivityByActor, listActivityForEntity } from "@/lib/data/activity";
import { getAccessSettings } from "@/lib/data/settings";
import { peopleMap } from "@/lib/people";
import { DEVICE_MODE_LABELS } from "@/lib/constants";
import { plural } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { ActionForm, ConfirmForm, Field, Input, SubmitButton } from "@/components/ui/form";
import { AssignmentList } from "@/components/assignments/assignment-list";
import { ActivityList } from "@/components/profile/activity-list";
import { DeliveryChart } from "@/components/profile/delivery-chart";
import { PerformanceSummary } from "@/components/profile/performance-summary";
import { BackgroundCard, EmergencyContactCard, TargetsCard, WorkDetailsCard } from "@/components/profile/profile-details";
import { PhotoUploader } from "@/components/profile/photo-uploader";
import { PasswordInput } from "@/components/profile/password-input";
import { ReportList } from "@/components/profile/report-list";
import { SessionsTable } from "@/components/profile/sessions-table";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { OfficeComputerList } from "@/components/team/office-computers";
import { StaffProfileForm } from "@/components/team/staff-profile-form";
import { deviceLabelsFor, loadWorkProfile } from "../../profile/_lib/load-profile";
import {
  changeEmailAction,
  deleteAccountAction,
  endSessionsAction,
  resetPasswordAction,
  setStatusAction,
  unbindDevicesAction,
  updateStaffProfileAction,
} from "./actions";
import type { UserProfile, Viewer } from "@/lib/types";

/** Small "see more" link for card headers. */
function HeaderLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[0.8125rem] font-semibold whitespace-nowrap text-blue-dark transition-colors hover:bg-blue-tint"
    >
      {children}
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

/* ------------------------------------------------------------------ overview */

export async function OverviewTab({ viewer, user }: { viewer: Viewer; user: UserProfile }) {
  if (user.role === "admin") {
    const activity = await listActivityByActor(user.uid, 8);
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Callout tone="info" title="Administrator account">
            The administrator manages assignments, staff, clients and office access, and is never restricted to the office. Administrator accounts
            are not given a performance score.
          </Callout>
          <WorkDetailsCard user={user} />
          <Card>
            <CardHeader icon={<History aria-hidden="true" />} title="Recent activity" action={<HeaderLink href={`/team/${user.uid}?tab=activity`}>All activity</HeaderLink>} />
            <ActivityList entries={activity} />
          </Card>
        </div>
        <div className="space-y-6">
          <BackgroundCard user={user} />
          <EmergencyContactCard user={user} />
        </div>
      </div>
    );
  }

  const [work, people, devices] = await Promise.all([loadWorkProfile(viewer, user), peopleMap(), approvedDevicesFor(user.uid)]);
  const firstName = user.displayName.split(" ")[0] ?? user.displayName;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <PerformanceSummary
          name={user.displayName}
          month={work.month}
          quarter={work.quarter}
          monthLabel="This month"
          quarterLabel="This quarter"
          action={<HeaderLink href="/performance">Team performance</HeaderLink>}
        />
        <DeliveryChart assignments={work.assignments} title={`Completed by ${firstName}`} />
        <Card>
          <CardHeader
            icon={<ClipboardList aria-hidden="true" />}
            title="Open assignments"
            description={`${plural(work.open.length, "assignment")} in progress or waiting, soonest due first.`}
            action={<HeaderLink href={`/assignments?assignee=${encodeURIComponent(user.uid)}`}>All assignments</HeaderLink>}
          />
          <AssignmentList assignments={work.open.slice(0, 10)} people={people} empty={`${firstName} has no open assignments.`} />
        </Card>
        <Card>
          <CardHeader
            icon={<FileText aria-hidden="true" />}
            title="Recent work reports"
            description="The latest daily, weekly and monthly reports."
            action={<HeaderLink href="/work-reports">All reports</HeaderLink>}
          />
          <ReportList reports={work.reports.slice(0, 5)} empty={`${firstName} has not submitted a work report yet.`} />
        </Card>
      </div>
      <div className="min-w-0 space-y-6">
        <WorkDetailsCard user={user} />
        <BackgroundCard user={user} />
        <TargetsCard user={user} />
        <EmergencyContactCard user={user} />
        <Card>
          <CardHeader icon={<Monitor aria-hidden="true" />} title="Office computer" description="Where they are allowed to sign in." />
          <CardBody>
            <OfficeComputerList devices={devices} empty="Not bound to an office computer yet." />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ edit */

export function EditTab({ viewer, user }: { viewer: Viewer; user: UserProfile }) {
  const isSelf = viewer.uid === user.uid;
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-start-3 lg:row-start-1">
        <Card>
          <CardHeader icon={<Camera aria-hidden="true" />} title="Profile photo" />
          <CardBody>
            <PhotoUploader uid={user.uid} name={user.displayName} photoVersion={user.photoUpdatedAt} self={isSelf} />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            icon={<Mail aria-hidden="true" />}
            title="Sign-in email"
            description={isSelf ? "The address you sign in with." : `The address ${user.displayName} signs in with.`}
          />
          <CardBody>
            <ActionForm action={changeEmailAction} className="grid gap-4">
              <KeepValuesAfterSubmit />
              <input type="hidden" name="uid" value={user.uid} />
              <Field label="Email address" name="email" required hint={isSelf ? "Use the new address the next time you sign in." : "The change takes effect at once. Tell them before you change it."}>
                <Input name="email" type="email" defaultValue={user.email} autoComplete="off" maxLength={200} />
              </Field>
              <div className="flex justify-end">
                <SubmitButton variant="secondary" pendingLabel="Changing email">
                  Change email
                </SubmitButton>
              </div>
            </ActionForm>
          </CardBody>
        </Card>
      </div>
      <div className="min-w-0 lg:col-span-2 lg:col-start-1 lg:row-start-1">
        <StaffProfileForm
          mode="edit"
          action={updateStaffProfileAction}
          uid={user.uid}
          cancelHref={`/team/${user.uid}`}
          values={{
            displayName: user.displayName,
            email: user.email,
            jobTitle: user.jobTitle,
            department: user.department,
            staffNumber: user.staffNumber,
            employmentType: user.employmentType,
            startDate: user.startDate,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            specialisations: user.specialisations,
            qualifications: user.qualifications,
            emergencyContact: user.emergencyContact,
            targets: user.targets,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ security */

export async function SecurityTab({ viewer, user }: { viewer: Viewer; user: UserProfile }) {
  const isSelf = viewer.uid === user.uid;
  const isEmployee = user.role === "employee";
  const [sessions, devices, settings] = await Promise.all([
    listSessionsForUser(user.uid, 15),
    // Blocked computers are listed too, so an employee whose only computer was
    // blocked can still be unlocked.
    isEmployee ? devicesFor(user.uid) : Promise.resolve([]),
    getAccessSettings(),
  ]);
  const deviceLabels = await deviceLabelsFor(sessions);
  const now = new Date().toISOString();
  const openSessions = sessions.filter((session) => !session.endedAt && session.expiresAt > now).length;
  const lockOn = settings.enforce && settings.device.enabled;
  const hidden = { uid: user.uid };

  const sessionsCard = (
    <Card className="lg:col-span-2">
      <CardHeader
        icon={<History aria-hidden="true" />}
        title="Recent sign-ins"
        description={`The last ${plural(sessions.length, "session")}, newest first. ${plural(openSessions, "session")} open now.`}
      />
      <SessionsTable sessions={sessions} deviceLabels={deviceLabels} currentSessionId={isSelf ? viewer.sessionId : undefined} />
    </Card>
  );

  if (isSelf) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Callout tone="info" title="This is your own account" className="lg:col-span-2" action={<HeaderLink href="/profile?tab=security">My profile</HeaderLink>}>
          Change your password and review your own sign-ins from My profile. Suspending, signing out and deleting are not available on your own
          account.
        </Callout>
        {sessionsCard}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader
          icon={<KeyRound aria-hidden="true" />}
          title="Reset password"
          description={`Set a new password for ${user.displayName}. They are signed out everywhere and need the new password to sign in.`}
        />
        <CardBody>
          <ActionForm action={resetPasswordAction} className="grid gap-4">
            <input type="hidden" name="uid" value={user.uid} />
            <PasswordInput name="password" label="New password" generate hint="At least 10 characters with letters and numbers." />
            <div className="flex justify-end">
              <SubmitButton pendingLabel="Setting password">
                <KeyRound aria-hidden="true" />
                Set new password
              </SubmitButton>
            </div>
          </ActionForm>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<ShieldCheck aria-hidden="true" />} title="Account access" description="Pause or restore access without losing any records." />
        <CardBody className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 basis-60">
              <p className="text-sm font-semibold text-navy">{user.status === "suspended" ? "Suspended" : "Active"}</p>
              <p className="mt-0.5 text-sm text-slate">
                {user.status === "suspended"
                  ? "They cannot sign in. Reactivate to let them back in with their existing password."
                  : "Suspending blocks sign-in at once and ends every open session. Their assignments, reports and time stay."}
              </p>
            </div>
            {user.status === "suspended" ? (
              <ConfirmForm action={setStatusAction} hidden={{ ...hidden, status: "active" }} confirm={`Reactivate ${user.displayName}'s account?`}>
                <SubmitButton variant="secondary" pendingLabel="Reactivating">
                  <UserCheck aria-hidden="true" />
                  Reactivate
                </SubmitButton>
              </ConfirmForm>
            ) : (
              <ConfirmForm
                action={setStatusAction}
                hidden={{ ...hidden, status: "suspended" }}
                confirm={`Suspend ${user.displayName}? They will be signed out at once and cannot sign in until you reactivate the account.`}
              >
                <SubmitButton variant="danger" pendingLabel="Suspending">
                  <Ban aria-hidden="true" />
                  Suspend
                </SubmitButton>
              </ConfirmForm>
            )}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-3 border-t border-mist pt-5">
            <div className="min-w-0 flex-1 basis-60">
              <p className="text-sm font-semibold text-navy">Sign out everywhere</p>
              <p className="mt-0.5 text-sm text-slate">
                {openSessions
                  ? `${plural(openSessions, "open session")} will end. They can sign in again straight away.`
                  : "No open sessions right now."}
              </p>
            </div>
            <ConfirmForm action={endSessionsAction} hidden={hidden} confirm={`Sign ${user.displayName} out on every computer?`}>
              <SubmitButton variant="secondary" pendingLabel="Signing out" disabled={!openSessions}>
                <LogOut aria-hidden="true" />
                Sign out everywhere
              </SubmitButton>
            </ConfirmForm>
          </div>
        </CardBody>
      </Card>

      {isEmployee && (
        <Card className="lg:col-span-2">
          <CardHeader
            icon={<Monitor aria-hidden="true" />}
            title="Office computer"
            description={
              lockOn ? `Office computer lock is on: ${DEVICE_MODE_LABELS[settings.device.mode].toLowerCase()}.` : "The office computer lock is switched off, so they can sign in on any computer."
            }
            action={<HeaderLink href="/settings/access">Office access</HeaderLink>}
          />
          <CardBody className="space-y-4">
            <OfficeComputerList devices={devices} empty="Not bound to an office computer." />
            {devices.length > 0 && (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-cloud px-4 py-3">
                <p className="min-w-0 flex-1 basis-72 text-sm text-charcoal">
                  {settings.device.mode === "first-sign-in"
                    ? "Unlocking frees them from this computer. Their next office sign-in binds them to whichever office computer they use, for example after a replacement."
                    : "Unlocking removes them from this computer. Approve a computer for them under Office access before their next sign-in."}
                </p>
                <ConfirmForm
                  action={unbindDevicesAction}
                  hidden={hidden}
                  confirm={`Unlock ${user.displayName} from ${plural(devices.length, "office computer")}?`}
                >
                  <SubmitButton variant="secondary" pendingLabel="Unlocking">
                    Unlock computer binding
                  </SubmitButton>
                </ConfirmForm>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {sessionsCard}

      <Card className="border-danger/30 lg:col-span-2">
        <CardHeader icon={<Trash2 aria-hidden="true" />} title="Delete account" className="border-danger/20" />
        <CardBody className="flex flex-wrap items-start justify-between gap-4">
          <p className="min-w-0 flex-1 basis-80 text-sm text-charcoal">
            Removes the login and the profile for good. Assignments, time logs and work reports stay, and keep {user.displayName}&apos;s name. If they
            might return, suspend the account instead.
          </p>
          <ConfirmForm
            action={deleteAccountAction}
            hidden={hidden}
            confirm={`Delete ${user.displayName}'s account permanently? This cannot be undone.`}
          >
            <SubmitButton variant="danger" pendingLabel="Deleting">
              <Trash2 aria-hidden="true" />
              Delete account
            </SubmitButton>
          </ConfirmForm>
        </CardBody>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ activity */

export async function ActivityTab({ user }: { user: UserProfile }) {
  const [own, about] = await Promise.all([listActivityByActor(user.uid, 50), listActivityForEntity(user.uid, 50)]);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader
          icon={<UserRound aria-hidden="true" />}
          title={`What ${user.displayName.split(" ")[0]} did`}
          description="Their recent actions across the system, newest first."
        />
        <ActivityList entries={own} empty="No activity recorded yet." />
      </Card>
      <Card>
        <CardHeader icon={<ShieldCheck aria-hidden="true" />} title="Changes to this account" description="Profile, password, status and computer changes, and who made them." />
        <ActivityList entries={about} showActor empty="No changes recorded yet." />
      </Card>
    </div>
  );
}
