import { z } from "zod";
import { careerRoleOptions, educationLevels } from "@/content/careers";
import { fieldLanguages, provinces } from "@/content/company";

/* Shared by the browser (instant feedback) and the API routes (authoritative). */

const name = z
  .string({ error: "Please enter your name." })
  .trim()
  .min(2, { error: "Please enter your name." })
  .max(120, { error: "Please keep your name under 120 characters." });

const email = z
  .string({ error: "Please enter your email address." })
  .trim()
  .toLowerCase()
  .max(200, { error: "That email address is too long." })
  .pipe(z.email({ error: "Please enter a valid email address." }));

const phone = z
  .string()
  .trim()
  .max(40, { error: "Please enter a shorter phone number." })
  .regex(/^[0-9+()\-.\s]*$/, { error: "Please use digits, spaces and + only." });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Please keep this under ${max.toLocaleString("en-GB")} characters.` })
    .optional()
    .default("");

const consent = z.literal(true, { error: "Please agree to the privacy notice so that we can reply." });

/** Spam signals sent with every public form. */
const antiSpam = {
  company_website: z.string().max(500).optional().default(""),
  startedAt: z.number().int().nonnegative().optional(),
};

export const enquiryTypes = [
  "General enquiry",
  "Request a proposal",
  "Academic support",
  "Training",
  "Media",
  "Careers",
  "Other",
] as const;

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().default(""),
  organisation: optionalText(160),
  enquiryType: z.enum(enquiryTypes, { error: "Please choose an enquiry type." }),
  message: z
    .string({ error: "Please tell us a little about your enquiry." })
    .trim()
    .min(10, { error: "Please tell us a little more (at least 10 characters)." })
    .max(5000, { error: "Please keep your message under 5,000 characters." }),
  consent,
  ...antiSpam,
});

export const clientTypes = [
  "Business or brand",
  "Government ministry or agency",
  "NGO or development partner",
  "University or research institute",
  "Small or medium enterprise",
  "Student or individual researcher",
  "Other",
] as const;

export const geographyOptions = [
  ...provinces,
  "National (all provinces)",
  "Outside Zambia",
  "Online or not location specific",
] as const;

export const timelineOptions = [
  "Within 1 month",
  "1 to 3 months",
  "3 to 6 months",
  "More than 6 months",
  "Not sure yet",
] as const;

export const budgetOptions = [
  "Under ZMW 25,000",
  "ZMW 25,000 to 100,000",
  "ZMW 100,000 to 500,000",
  "Over ZMW 500,000",
  "Prefer to discuss",
] as const;

export const proposalSchema = z.object({
  goal: z.string().trim().min(1, { error: "Please choose what you need to know." }).max(120),
  services: z
    .array(z.string().trim().max(80))
    .min(1, { error: "Please choose at least one area." })
    .max(8),
  decision: z
    .string({ error: "Please describe the decision this research will inform." })
    .trim()
    .min(15, { error: "Please describe the decision in a sentence or two." })
    .max(2000, { error: "Please keep this under 2,000 characters." }),
  audience: optionalText(600),
  geography: z.array(z.enum(geographyOptions)).min(1, { error: "Please choose where the research will take place." }),
  timeline: z.enum(timelineOptions, { error: "Please choose a timeline." }),
  budget: z.enum(budgetOptions).optional(),
  clientType: z.enum(clientTypes, { error: "Please tell us what type of organisation you are." }),
  name,
  email,
  phone: phone.optional().default(""),
  organisation: optionalText(160),
  role: optionalText(120),
  details: optionalText(5000),
  consent,
  ...antiSpam,
});

export const trainingFormatOptions = [
  "Public course in Lusaka",
  "In-house at our premises",
  "Live online",
  "Not sure yet",
] as const;

export const trainingSchema = z.object({
  course: z.string().trim().min(1, { error: "Please choose a course." }).max(120),
  format: z.enum(trainingFormatOptions, { error: "Please choose a format." }),
  participants: z.coerce
    .number({ error: "Please enter the number of participants." })
    .int({ error: "Please enter a whole number." })
    .min(1, { error: "At least one participant, please." })
    .max(500, { error: "For groups over 500, please contact us directly." }),
  preferredDates: optionalText(200),
  name,
  email,
  phone: phone.optional().default(""),
  organisation: optionalText(160),
  message: optionalText(3000),
  consent,
  ...antiSpam,
});

export const experienceOptions = [
  "None yet",
  "Less than 1 year",
  "1 to 3 years",
  "3 to 5 years",
  "More than 5 years",
] as const;

export const careersSchema = z.object({
  role: z.enum(careerRoleOptions, { error: "Please choose a role." }),
  provinces: z.array(z.enum(provinces)).min(1, { error: "Please choose at least one province." }),
  languages: z.array(z.enum(fieldLanguages)).min(1, { error: "Please choose at least one language." }),
  education: z.enum(educationLevels, { error: "Please choose your highest qualification." }),
  experience: z.enum(experienceOptions, { error: "Please choose your level of experience." }),
  capiExperience: z.boolean().optional().default(false),
  cvUrl: z
    .string()
    .trim()
    .max(500)
    .refine((value) => value === "" || /^https?:\/\/\S+$/i.test(value), {
      error: "Please enter a full link starting with https://",
    })
    .optional()
    .default(""),
  statement: z
    .string({ error: "Please tell us about your experience." })
    .trim()
    .min(30, { error: "Please write at least a few sentences (30 characters or more)." })
    .max(2000, { error: "Please keep this under 2,000 characters." }),
  name,
  email,
  phone: phone.min(7, { error: "Please enter a phone number we can reach you on." }),
  location: optionalText(120),
  consent,
  ...antiSpam,
});

export const newsletterSchema = z.object({
  email,
  name: optionalText(120),
  source: optionalText(60),
  ...antiSpam,
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type TrainingInput = z.infer<typeof trainingSchema>;
export type CareersInput = z.infer<typeof careersSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export type SubmissionKind = "contact" | "proposal" | "training" | "careers";

/** Flatten zod issues into { field: firstMessage } for display next to inputs. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export type ApiResult =
  | { ok: true; reference?: string; message?: string }
  | { ok: false; error: "validation" | "rate_limited" | "server" | "bad_request"; message: string; fieldErrors?: Record<string, string> };
