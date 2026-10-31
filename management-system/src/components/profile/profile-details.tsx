import { BookOpen, HeartPulse, IdCard, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DescriptionList } from "@/components/ui/misc";
import { formatDate, formatDateTime } from "@/lib/format";
import { plural } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

/** Specialisations as chips, or nothing. */
export function SpecialisationChips({ items, max }: { items: string[]; max?: number }) {
  if (!items.length) return null;
  const shown = max ? items.slice(0, max) : items;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Specialisations">
      {shown.map((item) => (
        <li key={item}>
          <Badge tone="neutral">{item}</Badge>
        </li>
      ))}
      {max && items.length > max && (
        <li>
          <Badge tone="neutral">+{items.length - max} more</Badge>
        </li>
      )}
    </ul>
  );
}

/** Employment facts: what the administrator manages. */
export function WorkDetailsCard({ user, description }: { user: UserProfile; description?: string }) {
  return (
    <Card>
      <CardHeader icon={<IdCard aria-hidden="true" />} title="Work details" description={description ?? "Role, employment and contact details."} />
      <CardBody>
        <DescriptionList
          items={[
            { label: "Full name", value: user.displayName },
            { label: "Job title", value: user.jobTitle },
            { label: "Department", value: user.department },
            { label: "Staff number", value: user.staffNumber },
            { label: "Employment type", value: user.employmentType },
            { label: "Start date", value: user.startDate ? formatDate(user.startDate) : "" },
            { label: "Email address", value: user.email },
            { label: "Phone", value: user.phone },
            { label: "Location", value: user.location },
            { label: "Account created", value: formatDate(user.createdAt) },
            { label: "Last sign-in", value: formatDateTime(user.lastLoginAt) },
            { label: "Profile updated", value: formatDateTime(user.updatedAt) },
          ]}
        />
      </CardBody>
    </Card>
  );
}

/** Qualifications, specialisations and the short biography. */
export function BackgroundCard({ user }: { user: UserProfile }) {
  return (
    <Card>
      <CardHeader icon={<BookOpen aria-hidden="true" />} title="Expertise and background" />
      <CardBody className="space-y-5">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-slate uppercase">Specialisations</h3>
          <div className="mt-2">
            {user.specialisations.length ? <SpecialisationChips items={user.specialisations} /> : <p className="text-sm text-slate">Not set</p>}
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-slate uppercase">Qualifications</h3>
          <p className="prose-plain mt-1 text-sm text-charcoal">{user.qualifications || <span className="text-slate">Not set</span>}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-slate uppercase">About</h3>
          <p className="prose-plain mt-1 text-sm text-charcoal">{user.bio || <span className="text-slate">No biography yet.</span>}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export function EmergencyContactCard({ user }: { user: UserProfile }) {
  const contact = user.emergencyContact;
  const empty = !contact.name && !contact.phone && !contact.relationship;
  return (
    <Card>
      <CardHeader icon={<HeartPulse aria-hidden="true" />} title="Emergency contact" description="Who to call if something happens at work." />
      <CardBody>
        {empty ? (
          <p className="text-sm text-slate">No emergency contact recorded.</p>
        ) : (
          <DescriptionList
            className="sm:grid-cols-1"
            items={[
              { label: "Name", value: contact.name },
              { label: "Relationship", value: contact.relationship },
              {
                label: "Phone",
                value: contact.phone ? (
                  <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="font-semibold text-blue-dark hover:underline">
                    {contact.phone}
                  </a>
                ) : (
                  ""
                ),
              },
            ]}
          />
        )}
      </CardBody>
    </Card>
  );
}

/** The person's monthly and weekly targets, which feed the performance score. */
export function TargetsCard({ user, footnote }: { user: UserProfile; footnote?: string }) {
  return (
    <Card>
      <CardHeader icon={<Target aria-hidden="true" />} title="Targets" description="Used to measure throughput and hours." />
      <CardBody>
        <dl className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-cloud px-4 py-3">
            <dt className="text-xs font-semibold text-slate">Assignments a month</dt>
            <dd className="tabular mt-1 font-display text-2xl font-bold text-navy">{user.targets.monthlyAssignments}</dd>
          </div>
          <div className="rounded-xl bg-cloud px-4 py-3">
            <dt className="text-xs font-semibold text-slate">Hours a week</dt>
            <dd className="tabular mt-1 font-display text-2xl font-bold text-navy">{user.targets.weeklyHours}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-slate">
          {footnote ??
            `About ${plural(Math.round((user.targets.weeklyHours / 5) * 10) / 10, "hour")} a working day. Targets are set by the administrator.`}
        </p>
      </CardBody>
    </Card>
  );
}
