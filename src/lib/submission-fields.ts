import { services } from "@/content/services";
import { courses } from "@/content/training";
import type { SubmissionKind } from "@/lib/validation";

export const kindLabels: Record<SubmissionKind, string> = {
  contact: "Enquiry",
  proposal: "Proposal request",
  training: "Training enquiry",
  careers: "Field network application",
};

const fieldLabels: Record<string, string> = {
  enquiryType: "Enquiry type",
  message: "Message",
  goal: "What they need to know",
  services: "Areas of interest",
  decision: "Decision to inform",
  audience: "Who to hear from",
  geography: "Where",
  timeline: "Timeline",
  budget: "Budget band",
  clientType: "Organisation type",
  role: "Role",
  details: "Additional details",
  course: "Course",
  format: "Preferred format",
  participants: "Participants",
  preferredDates: "Preferred dates",
  provinces: "Provinces available",
  languages: "Languages",
  education: "Highest qualification",
  experience: "Field experience",
  capiExperience: "Used CAPI tools",
  cvUrl: "CV or profile link",
  statement: "About their experience",
  location: "Based in",
};

const HIDDEN = new Set(["name", "email", "phone", "organisation", "consent", "company_website", "startedAt"]);

function formatValue(key: string, value: unknown): string {
  if (Array.isArray(value)) {
    if (key === "services") {
      return value.map((slug) => services.find((service) => service.slug === slug)?.shortTitle ?? String(slug)).join(", ");
    }
    return value.join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key === "course") return courses.find((course) => course.slug === value)?.title ?? String(value);
  return String(value ?? "");
}

/** Label/value pairs for emails and the admin detail view. */
export function describePayload(payload: Record<string, unknown>): { label: string; value: string }[] {
  return Object.entries(payload)
    .filter(([key, value]) => !HIDDEN.has(key) && value !== "" && value !== undefined && value !== null)
    .filter(([, value]) => !(Array.isArray(value) && value.length === 0))
    .map(([key, value]) => ({ label: fieldLabels[key] ?? key, value: formatValue(key, value) }));
}

export function subjectFor(kind: SubmissionKind, payload: Record<string, unknown>) {
  switch (kind) {
    case "contact":
      return String(payload.enquiryType ?? "General enquiry");
    case "proposal":
      return `Proposal: ${String(payload.goal ?? "New study")}`;
    case "training":
      return `Training: ${formatValue("course", payload.course)}`;
    case "careers":
      return `Application: ${String(payload.role ?? "Field network")}`;
  }
}

export function messageFor(kind: SubmissionKind, payload: Record<string, unknown>) {
  switch (kind) {
    case "contact":
      return String(payload.message ?? "");
    case "proposal":
      return String(payload.decision ?? "");
    case "training":
      return String(payload.message ?? "");
    case "careers":
      return String(payload.statement ?? "");
  }
}
