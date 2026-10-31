import { z } from "zod";
import {
  ACADEMIC_LEVELS,
  ASSIGNMENT_STATUSES,
  CLIENT_TYPES,
  DEVICE_MODES,
  EMPLOYMENT_TYPES,
  FILE_KINDS,
  PAYMENT_STATUSES,
  PRIORITIES,
  REPORT_PERIODS,
  TRACKS,
} from "@/lib/constants";
import { isValidIpRule, parseClock } from "@/lib/access/policy";
import { splitList } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

/*
 * Form schemas. Server actions read FormData through `parseForm`, so the same
 * rules apply whether or not the browser ran its own checks.
 */

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const required = (max: number, message = "This field is required.") => text(max).min(1, message);
const optionalDate = z
  .string()
  .trim()
  .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use a valid date.")
  .transform((value) => value || null);
const isoDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.");
const optionalNumber = (min: number, max: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value.replace(/,/g, ""))))
    .refine((value) => value === null || (Number.isFinite(value) && value >= min && value <= max), `Enter a number between ${min} and ${max}.`);
const listField = z
  .string()
  .default("")
  .transform((value) => splitList(value));
const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on" || value === "true" || value === "1");

export const emailField = z.email("Enter a valid email address.").trim().toLowerCase().max(200);
export const passwordField = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128, "Use 128 characters or fewer.")
  .refine((value) => /[a-zA-Z]/.test(value) && /\d/.test(value), "Use a mix of letters and numbers.");

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email address.").max(200),
  password: z.string().min(1, "Enter your password.").max(200),
  next: z.string().optional(),
  latitude: optionalNumber(-90, 90).optional(),
  longitude: optionalNumber(-180, 180).optional(),
  accuracy: optionalNumber(0, 1_000_000).optional(),
  client: z.string().max(2000).optional(),
});

export const setupSchema = z.object({
  setupKey: z.string().min(1, "Enter the setup key."),
  displayName: required(80, "Enter your name."),
  email: emailField,
  password: passwordField,
});

export const assignmentSchema = z
  .object({
    title: required(160, "Give the assignment a title."),
    description: text(5000).default(""),
    track: z.enum(TRACKS),
    categoryId: required(80, "Choose a category."),
    academicLevel: z
      .union([z.enum(ACADEMIC_LEVELS), z.literal("")])
      .optional()
      .transform((value) => value || null),
    clientId: text(80)
      .optional()
      .transform((value) => value || null),
    clientName: text(160).default(""),
    assigneeIds: z.array(z.string().min(1).max(128)).min(1, "Assign at least one member of staff."),
    priority: z.enum(PRIORITIES),
    startDate: optionalDate,
    dueDate: optionalDate,
    estimatedHours: optionalNumber(0, 10_000),
    fee: optionalNumber(0, 100_000_000),
    paymentStatus: z.enum(PAYMENT_STATUSES).default("not_invoiced"),
    amountPaid: optionalNumber(0, 100_000_000).transform((value) => value ?? 0),
    tags: listField,
    milestones: text(4000).default(""),
  })
  .refine((value) => !value.startDate || !value.dueDate || value.dueDate >= value.startDate, {
    message: "The due date must be on or after the start date.",
    path: ["dueDate"],
  });

export const statusChangeSchema = z.object({
  status: z.enum(ASSIGNMENT_STATUSES),
  note: text(2000).default(""),
});

export const progressSchema = z.object({
  progress: z.coerce.number().int().min(0).max(100),
  note: text(2000).default(""),
});

export const commentSchema = z.object({ text: required(4000, "Write a comment first.") });

export const milestoneSchema = z.object({ title: required(160, "Name the milestone."), dueDate: optionalDate });

export const reviewSchema = z.object({
  decision: z.enum(["approve", "revise"]),
  rating: optionalNumber(1, 5),
  note: text(2000).default(""),
});

export const paymentSchema = z.object({
  fee: optionalNumber(0, 100_000_000),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  amountPaid: optionalNumber(0, 100_000_000).transform((value) => value ?? 0),
});

export const fileKindSchema = z.enum(FILE_KINDS);

export const clientSchema = z.object({
  name: required(160, "Enter the client's name."),
  type: z.enum(CLIENT_TYPES),
  sector: text(120).default(""),
  contactName: text(120).default(""),
  email: z.union([z.literal(""), emailField]).default(""),
  phone: text(40).default(""),
  institution: text(160).default(""),
  address: text(300).default(""),
  notes: text(4000).default(""),
});

export const timeLogSchema = z.object({
  assignmentId: text(80)
    .optional()
    .transform((value) => value || null),
  date: isoDate,
  hours: z.coerce.number().min(0.25, "Log at least 15 minutes.").max(16, "A single entry cannot exceed 16 hours."),
  note: text(500).default(""),
  uid: text(128).optional(),
});

export const workReportSchema = z
  .object({
    period: z.enum(REPORT_PERIODS),
    periodStart: isoDate,
    periodEnd: isoDate,
    summary: required(4000, "Summarise the work done."),
    accomplishments: text(6000).default(""),
    challenges: text(4000).default(""),
    nextSteps: text(4000).default(""),
    hours: optionalNumber(0, 400),
    assignmentIds: z.array(z.string().max(128)).default([]),
  })
  .refine((value) => value.periodEnd >= value.periodStart, { message: "The end date must be on or after the start date.", path: ["periodEnd"] });

export const reportReviewSchema = z.object({ feedback: text(4000).default(""), rating: optionalNumber(1, 5) });

/** Fields an employee can change on their own profile. */
export const selfProfileSchema = z.object({
  phone: text(40).default(""),
  location: text(120).default(""),
  bio: text(1500).default(""),
  specialisations: listField,
  qualifications: text(2000).default(""),
  emergencyName: text(120).default(""),
  emergencyPhone: text(40).default(""),
  emergencyRelationship: text(60).default(""),
});

/** Everything the administrator manages on a staff profile. */
export const staffProfileSchema = selfProfileSchema.extend({
  displayName: required(80, "Enter the person's name."),
  jobTitle: text(80).default(""),
  department: text(80).default(""),
  staffNumber: text(40).default(""),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  startDate: optionalDate,
  monthlyAssignments: z.coerce.number().int().min(0).max(100),
  weeklyHours: z.coerce.number().min(0).max(80),
});

export const newEmployeeSchema = staffProfileSchema.extend({
  email: emailField,
  password: passwordField,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, { message: "The passwords do not match.", path: ["confirmPassword"] });

export const adminSetPasswordSchema = z.object({ password: passwordField });

export const categorySchema = z.object({
  name: required(120, "Name the category."),
  track: z.enum(TRACKS),
  description: text(400).default(""),
});

export const announcementSchema = z.object({
  title: required(140, "Give the announcement a title."),
  body: text(4000).default(""),
  pinned: checkbox,
  expiresAt: optionalDate,
});

const clock = z.string().refine((value) => parseClock(value) !== null, "Use the format HH:MM.");

export const accessSettingsSchema = z
  .object({
    enforce: checkbox,
    deviceEnabled: checkbox,
    deviceMode: z.enum(DEVICE_MODES),
    maxPerEmployee: z.coerce.number().int().min(1).max(5),
    networkEnabled: checkbox,
    allowed: z
      .string()
      .default("")
      .transform((value) => splitList(value))
      .refine((rules) => rules.every(isValidIpRule), "Each entry must be an IP address such as 41.72.100.10 or a range such as 41.72.100.0/24."),
    locationEnabled: checkbox,
    latitude: optionalNumber(-90, 90),
    longitude: optionalNumber(-180, 180),
    radiusMeters: z.coerce.number().int().min(25, "Use at least 25 metres.").max(5000),
    hoursEnabled: checkbox,
    days: z.array(z.coerce.number().int().min(0).max(6)).default([]),
    start: clock,
    end: clock,
    sessionHours: z.coerce.number().int().min(1).max(24),
  })
  .refine((value) => !value.networkEnabled || value.allowed.length > 0, {
    message: "Add at least one office network address, or switch the network check off.",
    path: ["allowed"],
  })
  .refine((value) => !value.locationEnabled || (value.latitude !== null && value.longitude !== null), {
    message: "Set the office location, or switch the location check off.",
    path: ["latitude"],
  })
  .refine((value) => !value.hoursEnabled || ((parseClock(value.end) ?? 0) > (parseClock(value.start) ?? 0) && value.days.length > 0), {
    message: "Choose at least one day and an end time after the start time.",
    path: ["end"],
  });

/* ------------------------------------------------------------------ helpers */

/** Turns FormData into an object, collecting repeated keys (checkbox groups, multi-selects) into arrays. */
export function formToObject(formData: FormData, arrayKeys: string[] = []) {
  const object: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue;
    const values = formData.getAll(key).filter((value): value is string => typeof value === "string");
    object[key] = arrayKeys.includes(key) ? values : values[0];
  }
  for (const key of arrayKeys) object[key] ??= [];
  return object;
}

export type Parsed<T> = { ok: true; data: T } | { ok: false; result: ActionResult<never> };

export function parseForm<T extends z.ZodType>(schema: T, formData: FormData, arrayKeys: string[] = []): Parsed<z.output<T>> {
  const parsed = schema.safeParse(formToObject(formData, arrayKeys));
  if (parsed.success) return { ok: true, data: parsed.data };
  const fieldErrors = z.flattenError(parsed.error).fieldErrors as Record<string, string[] | undefined>;
  return {
    ok: false,
    result: { ok: false, message: "Please check the highlighted fields.", fieldErrors },
  };
}

/** Parses milestone lines: "Title" or "Title | 2026-11-30". */
export function parseMilestoneLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30)
    .map((line) => {
      const [title, date] = line.split("|").map((part) => part.trim());
      return { title: (title ?? "").slice(0, 160), dueDate: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null };
    })
    .filter((milestone) => milestone.title);
}
