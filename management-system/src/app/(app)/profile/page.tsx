import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Camera, ClipboardList, FileText, History, IdCard, KeyRound, Lock, Monitor, Pencil, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getUser } from "@/lib/data/users";
import { listSessionsForUser } from "@/lib/data/sessions";
import { approvedDevicesFor } from "@/lib/data/devices";
import { listActivityByActor } from "@/lib/data/activity";
import { peopleMap } from "@/lib/people";
import { formatDate } from "@/lib/format";
import { plural } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Callout } from "@/components/ui/callout";
import { DescriptionList, TabLinks } from "@/components/ui/misc";
import { AssignmentList } from "@/components/assignments/assignment-list";
import { ProfileHero } from "@/components/profile/profile-hero";
import { BackgroundCard, EmergencyContactCard, TargetsCard, WorkDetailsCard } from "@/components/profile/profile-details";
import { PerformanceSummary } from "@/components/profile/performance-summary";
import { DeliveryChart } from "@/components/profile/delivery-chart";
import { ReportList } from "@/components/profile/report-list";
import { ActivityList } from "@/components/profile/activity-list";
import { PhotoUploader } from "@/components/profile/photo-uploader";
import { SelfProfileForm } from "@/components/profile/self-profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { SessionsTable } from "@/components/profile/sessions-table";
import { OfficeComputerList } from "@/components/team/office-computers";
import { deviceLabelsFor, loadWorkProfile } from "./_lib/load-profile";
import { changePasswordAction, updateMyProfileAction } from "./actions";
import type { UserProfile, Viewer } from "@/lib/types";

export const metadata: Metadata = { title: "My profile" };

const TABS = ["overview", "edit", "security"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = { overview: "Overview", edit: "Edit profile", security: "Password and sign-ins" };

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

export default async function MyProfilePage(props: PageProps<"/profile">) {
  const viewer = await requireUser();
  const params = await props.searchParams;
  const tab: Tab = TABS.find((item) => item === params.tab) ?? "overview";
  // Read afresh so a just-saved change or new photo shows straight away.
  const user = (await getUser(viewer.uid)) ?? viewer.profile;

  return (
    <div className="mx-auto max-w-7xl">
      <ProfileHero
        user={user}
        eyebrow="My profile"
        actions={
          tab !== "edit" && (
            <ButtonLink href="/profile?tab=edit">
              <Pencil aria-hidden="true" />
              Edit my profile
            </ButtonLink>
          )
        }
      />
      <TabLinks
        items={TABS.map((item) => ({ href: item === "overview" ? "/profile" : `/profile?tab=${item}`, label: TAB_LABELS[item], active: item === tab }))}
      />
      {tab === "overview" && <Overview viewer={viewer} user={user} />}
      {tab === "edit" && <Edit viewer={viewer} user={user} />}
      {tab === "security" && <Security viewer={viewer} />}
    </div>
  );
}

/* ------------------------------------------------------------------ overview */

async function Overview({ viewer, user }: { viewer: Viewer; user: UserProfile }) {
  if (viewer.isAdmin) {
    const activity = await listActivityByActor(viewer.uid, 8);
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <WorkDetailsCard user={user} />
          <Card>
            <CardHeader icon={<History aria-hidden="true" />} title="My recent activity" action={<HeaderLink href="/settings/activity">Activity log</HeaderLink>} />
            <ActivityList entries={activity} />
          </Card>
        </div>
        <div className="min-w-0 space-y-6">
          <Callout tone="info" title="Administrator">
            You manage assignments, staff, clients and office access. Office sign-in restrictions never apply to your account.
          </Callout>
          <BackgroundCard user={user} />
          <EmergencyContactCard user={user} />
        </div>
      </div>
    );
  }

  const [work, people, devices] = await Promise.all([loadWorkProfile(viewer, user), peopleMap(), approvedDevicesFor(viewer.uid)]);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-span-2">
        <PerformanceSummary
          name={user.displayName}
          month={work.month}
          quarter={work.quarter}
          monthLabel="This month"
          quarterLabel="This quarter"
          action={<HeaderLink href="/performance">My performance</HeaderLink>}
        />
        <DeliveryChart assignments={work.assignments} title="My completed work" />
        <Card>
          <CardHeader
            icon={<ClipboardList aria-hidden="true" />}
            title="My open assignments"
            description={`${plural(work.open.length, "assignment")}, soonest due first.`}
            action={<HeaderLink href="/assignments">All my assignments</HeaderLink>}
          />
          <AssignmentList assignments={work.open.slice(0, 10)} people={people} empty="You have no open assignments." />
        </Card>
        <Card>
          <CardHeader icon={<FileText aria-hidden="true" />} title="My recent work reports" action={<HeaderLink href="/work-reports">All my reports</HeaderLink>} />
          <ReportList reports={work.reports.slice(0, 5)} empty="You have not submitted a work report yet." />
        </Card>
      </div>
      <div className="min-w-0 space-y-6">
        <TargetsCard user={user} />
        <WorkDetailsCard user={user} description="Kept up to date by the administrator." />
        <BackgroundCard user={user} />
        <EmergencyContactCard user={user} />
        <Card>
          <CardHeader icon={<Monitor aria-hidden="true" />} title="My office computer" description="The computer you are registered to sign in on." />
          <CardBody>
            <OfficeComputerList devices={devices} empty="You are not tied to an office computer." />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ edit */

function Edit({ viewer, user }: { viewer: Viewer; user: UserProfile }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="min-w-0 space-y-6 lg:col-start-3 lg:row-start-1">
        <Card>
          <CardHeader icon={<Camera aria-hidden="true" />} title="Profile photo" />
          <CardBody>
            <PhotoUploader uid={user.uid} name={user.displayName} photoVersion={user.photoUpdatedAt} self />
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            icon={<IdCard aria-hidden="true" />}
            title="Managed by the administrator"
            description={viewer.isAdmin ? "Your role, employment details, sign-in email and targets." : "Ask the administrator if any of these need to change."}
            action={viewer.isAdmin ? <HeaderLink href={`/team/${user.uid}?tab=edit`}>Edit</HeaderLink> : undefined}
          />
          <CardBody>
            <DescriptionList
              className="sm:grid-cols-1"
              items={[
                { label: "Full name", value: user.displayName },
                { label: "Sign-in email", value: user.email },
                { label: "Job title", value: user.jobTitle },
                { label: "Department", value: user.department },
                { label: "Staff number", value: user.staffNumber },
                { label: "Employment", value: [user.employmentType, user.startDate ? `since ${formatDate(user.startDate)}` : ""].filter(Boolean).join(", ") },
                { label: "Targets", value: `${user.targets.monthlyAssignments} assignments a month, ${user.targets.weeklyHours} hours a week` },
              ]}
            />
          </CardBody>
        </Card>
      </div>
      <div className="min-w-0 lg:col-span-2 lg:col-start-1 lg:row-start-1">
        <SelfProfileForm
          action={updateMyProfileAction}
          values={{
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            specialisations: user.specialisations,
            qualifications: user.qualifications,
            emergencyContact: user.emergencyContact,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ security */

async function Security({ viewer }: { viewer: Viewer }) {
  const [sessions, devices] = await Promise.all([
    listSessionsForUser(viewer.uid, 12),
    viewer.isAdmin ? Promise.resolve([]) : approvedDevicesFor(viewer.uid),
  ]);
  const deviceLabels = await deviceLabelsFor(sessions);
  const now = new Date().toISOString();
  const open = sessions.filter((session) => !session.endedAt && session.expiresAt > now).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader icon={<KeyRound aria-hidden="true" />} title="Change password" description="Use at least 10 characters with letters and numbers. Avoid one you use elsewhere." />
        <CardBody>
          <ChangePasswordForm action={changePasswordAction} />
        </CardBody>
      </Card>
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader icon={<ShieldCheck aria-hidden="true" />} title="Keeping your account safe" />
          <CardBody className="space-y-3 text-sm text-charcoal">
            <p className="flex gap-2.5">
              <Lock className="mt-0.5 size-4 shrink-0 text-slate" aria-hidden="true" />
              Never share your password. The administrator will never ask for it.
            </p>
            <p className="flex gap-2.5">
              <History className="mt-0.5 size-4 shrink-0 text-slate" aria-hidden="true" />
              If a sign-in below is not yours, change your password: every computer signed in as you is signed out.
            </p>
            {!viewer.isAdmin && (
              <p className="flex gap-2.5">
                <Monitor className="mt-0.5 size-4 shrink-0 text-slate" aria-hidden="true" />
                You can only sign in from the office. Speak to the administrator if your office computer changes.
              </p>
            )}
          </CardBody>
        </Card>
        {!viewer.isAdmin && (
          <Card>
            <CardHeader icon={<Monitor aria-hidden="true" />} title="My office computer" />
            <CardBody>
              <OfficeComputerList devices={devices} empty="You are not tied to an office computer." />
            </CardBody>
          </Card>
        )}
      </div>
      <Card className="lg:col-span-3">
        <CardHeader
          icon={<History aria-hidden="true" />}
          title="My sign-ins"
          description={`Your last ${plural(sessions.length, "session")}, newest first. ${plural(open, "session")} open now.`}
        />
        <SessionsTable sessions={sessions} deviceLabels={deviceLabels} currentSessionId={viewer.sessionId} />
      </Card>
    </div>
  );
}
