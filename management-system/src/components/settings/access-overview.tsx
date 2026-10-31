import { CircleCheck, CircleMinus, Clock, KeyRound, ListChecks, MapPin, Monitor, RefreshCw, ShieldX, UserCog, Wifi } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RuleKey, RuleSummary } from "@/components/settings/policy-text";

const STEPS = [
  {
    icon: KeyRound,
    title: "An employee signs in",
    text: "On an office computer, with the email address and password you gave them.",
  },
  {
    icon: ListChecks,
    title: "The rules are checked",
    text: "The computer, the office network, the location and the time: whichever rules are switched on.",
  },
  {
    icon: ShieldX,
    title: "Refused if any rule fails",
    text: "The person is told why, and the attempt is recorded. A new computer waits for your approval.",
  },
  {
    icon: RefreshCw,
    title: "Checked again on every click",
    text: "If a rule stops being met, for example a computer is blocked, the employee is signed out.",
  },
] as const;

/** Plain explanation of how office access works, shown at the top of the page. */
export function HowAccessWorks() {
  return (
    <Card>
      <CardHeader
        title="How office access works"
        description="The system runs on the office computers. Once it knows an employee's computer, their account only works there, and only when they are in the office."
      />
      <CardBody className="space-y-4">
        <ol className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-blue-tint text-blue">
                <step.icon className="size-4" aria-hidden="true" />
                <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-navy text-[0.625rem] font-bold text-white">
                  {index + 1}
                </span>
              </span>
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-navy">{step.title}</p>
                <p className="mt-0.5 text-slate">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex gap-3 rounded-xl border border-mist bg-cloud/60 px-4 py-3 text-sm">
          <UserCog className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden="true" />
          <p className="text-charcoal">
            <span className="font-semibold text-navy">The rules apply to employees only.</span> As the administrator you can sign in from anywhere, on
            any computer, so you can manage the system and unlock things remotely.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

const RULE_ICONS: Record<RuleKey, typeof Monitor> = { device: Monitor, network: Wifi, location: MapPin, hours: Clock };

/** Which rules are in force right now, one line each. */
export function RulesInForce({ rules, enforce }: { rules: RuleSummary[]; enforce: boolean }) {
  return (
    <Card>
      <CardHeader
        title="Rules in force"
        description={
          enforce ? "Applied to every employee sign-in and every click after it." : "Office restrictions are off, so none of these are applied."
        }
      />
      <ul className="divide-y divide-mist">
        {rules.map((rule) => {
          const Icon = RULE_ICONS[rule.key];
          const active = enforce && rule.on;
          return (
            <li key={rule.key} className="flex items-start gap-3 px-5 py-3.5">
              <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", active ? "bg-blue-tint text-blue" : "bg-cloud text-slate")}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="font-semibold text-navy">{rule.label}</span>
                  <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", active ? "text-good" : "text-slate")}>
                    {active ? <CircleCheck className="size-3.5" aria-hidden="true" /> : <CircleMinus className="size-3.5" aria-hidden="true" />}
                    {active ? "On" : rule.on ? "On, not enforced" : "Off"}
                  </span>
                </p>
                <p className="mt-0.5 text-slate">{rule.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
