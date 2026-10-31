import type { ReactNode } from "react";
import { BadgeCheck, CalendarDays, Hash, Mail, MapPin, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Meta } from "@/components/ui/misc";
import { AdminBadge, UserStatusBadge } from "@/components/profile/badges";
import { formatDate } from "@/lib/format";
import type { UserProfile } from "@/lib/types";

/**
 * The top of a staff profile: photo, name, role and the key facts, on a
 * navy band. Shared by the team profile and My profile so both look alike.
 */
export function ProfileHero({ user, actions, eyebrow }: { user: UserProfile; actions?: ReactNode; eyebrow?: ReactNode }) {
  const isAdmin = user.role === "admin";
  return (
    <section className="mb-6 overflow-hidden rounded-panel border border-mist bg-white shadow-card">
      <div className="on-dark relative h-24 overflow-hidden bg-navy sm:h-28" aria-hidden="true">
        {/* Quiet arcs echo the Primeresearch mark without competing with the content. */}
        <svg className="absolute -top-40 -right-24 size-[26rem] text-white/[0.06]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
      </div>
      <div className="px-5 pb-5 sm:px-7">
        <div className="relative -mt-12 flex flex-wrap items-end justify-between gap-4">
          <Avatar name={user.displayName} uid={user.uid} photoVersion={user.photoUpdatedAt} size="xl" className="ring-4 shadow-card" />
          {actions && <div className="no-print flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <div className="mt-4 min-w-0">
          {eyebrow && <p className="mb-1 text-xs font-semibold tracking-wide text-slate uppercase">{eyebrow}</p>}
          <h1 className="text-2xl font-bold tracking-tight break-words sm:text-[1.75rem]">{user.displayName}</h1>
          <p className="mt-1 text-[0.9375rem] text-slate">
            {[user.jobTitle || (isAdmin ? "Administrator" : "Employee"), user.department].filter(Boolean).join(", ")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {isAdmin && <AdminBadge />}
            <UserStatusBadge status={user.status} />
            <Badge tone="blue" icon={<BadgeCheck aria-hidden="true" />}>
              {user.employmentType}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {user.staffNumber && <Meta icon={<Hash aria-hidden="true" />}>Staff no. {user.staffNumber}</Meta>}
            <Meta icon={<Mail aria-hidden="true" />}>
              <a href={`mailto:${user.email}`} className="break-all hover:text-navy">
                {user.email}
              </a>
            </Meta>
            {user.phone && (
              <Meta icon={<Phone aria-hidden="true" />}>
                <a href={`tel:${user.phone.replace(/\s+/g, "")}`} className="hover:text-navy">
                  {user.phone}
                </a>
              </Meta>
            )}
            {user.location && <Meta icon={<MapPin aria-hidden="true" />}>{user.location}</Meta>}
            {user.startDate && <Meta icon={<CalendarDays aria-hidden="true" />}>Joined {formatDate(user.startDate)}</Meta>}
          </div>
        </div>
      </div>
    </section>
  );
}
