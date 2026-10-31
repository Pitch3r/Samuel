import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowLeft, ClipboardList, Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { getUser } from "@/lib/data/users";
import { ButtonLink } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { TabLinks } from "@/components/ui/misc";
import { ProfileHero } from "@/components/profile/profile-hero";
import { ActivityTab, EditTab, OverviewTab, SecurityTab } from "./sections";

const TABS = ["overview", "edit", "security", "activity"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  edit: "Edit profile",
  security: "Security",
  activity: "Activity",
};

/** One read per request, shared by the page and its metadata. */
const loadMember = cache(async (uid: string) => {
  const viewer = await requireAdmin();
  const valid = uid.length > 0 && uid.length <= 128 && !uid.includes("/");
  return { viewer, user: valid ? await getUser(uid) : null };
});

export async function generateMetadata(props: PageProps<"/team/[uid]">): Promise<Metadata> {
  const { uid } = await props.params;
  const { user } = await loadMember(uid);
  return { title: user ? user.displayName : "Team member" };
}

export default async function TeamMemberPage(props: PageProps<"/team/[uid]">) {
  const viewer = await requireAdmin();
  const [{ uid }, params] = await Promise.all([props.params, props.searchParams]);
  const { user } = await loadMember(uid);
  if (!user) notFound();

  const tab: Tab = TABS.find((item) => item === params.tab) ?? "overview";
  const base = `/team/${encodeURIComponent(user.uid)}`;
  const isSelf = user.uid === viewer.uid;
  const isEmployee = user.role === "employee";

  return (
    <div className="mx-auto max-w-7xl">
      <Link href="/team" className="no-print mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-navy">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Team
      </Link>

      <ProfileHero
        user={user}
        eyebrow={isSelf ? "Your staff profile" : isEmployee ? "Employee profile" : "Administrator profile"}
        actions={
          <>
            {isEmployee && (
              <ButtonLink href={`/assignments?assignee=${encodeURIComponent(user.uid)}&status=open`} variant="secondary">
                <ClipboardList aria-hidden="true" />
                Their assignments
              </ButtonLink>
            )}
            {tab !== "edit" && (
              <ButtonLink href={`${base}?tab=edit`}>
                <Pencil aria-hidden="true" />
                Edit profile
              </ButtonLink>
            )}
          </>
        }
      />

      {params.created === "1" && (
        <Callout tone="success" title={`The account for ${user.displayName} is ready`} className="mb-5">
          Give them their sign-in email ({user.email}) and the password you set, in person. They can change the password from My profile once
          they have signed in.
        </Callout>
      )}
      {params.partial === "1" && (
        <Callout tone="warning" title="The login was created, but some profile details were not saved" className="mb-5">
          Check the details below and save them again.
        </Callout>
      )}
      {user.status === "suspended" && (
        <Callout tone="warning" title="This account is suspended" className="mb-5">
          {user.displayName} cannot sign in. Their work records are kept. You can reactivate the account under Security.
        </Callout>
      )}

      <TabLinks
        items={TABS.map((item) => ({
          href: item === "overview" ? base : `${base}?tab=${item}`,
          label: TAB_LABELS[item],
          active: item === tab,
        }))}
      />

      {tab === "overview" && <OverviewTab viewer={viewer} user={user} />}
      {tab === "edit" && <EditTab viewer={viewer} user={user} />}
      {tab === "security" && <SecurityTab viewer={viewer} user={user} />}
      {tab === "activity" && <ActivityTab user={user} />}
    </div>
  );
}
