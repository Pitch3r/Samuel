/**
 * Fixed vocabularies for the Primeresearch Management System. Everything that
 * appears in a select, a badge or a chart legend is defined here once.
 */

export const organisation = {
  name: "Primeresearch Consultants",
  shortName: "Primeresearch",
  system: "Primeresearch Management System",
  systemShort: "PRMS",
  tagline: "Every decision deserves evidence.",
  promise: "Clear questions. Sound methods. Findings you can act on.",
  city: "Lusaka, Zambia",
  timeZone: "Africa/Lusaka",
  currency: "ZMW",
  website: "https://www.primeresearch.co.zm",
  integrityNote:
    "We teach, advise and review so that the work, and the understanding behind it, remain the researcher's. We do not write assessed work for submission on a student's behalf.",
} as const;

/* ------------------------------------------------------------------ roles */

export const ROLES = ["admin", "employee"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["active", "suspended"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const EMPLOYMENT_TYPES = ["Full time", "Part time", "Contract", "Intern", "Associate"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

/* ------------------------------------------------------------------ tracks */

export const TRACKS = ["corporate", "academic"] as const;
export type Track = (typeof TRACKS)[number];

export const TRACK_LABELS: Record<Track, string> = {
  corporate: "Corporate research",
  academic: "Academic research",
};

export const TRACK_DESCRIPTIONS: Record<Track, string> = {
  corporate: "Studies for businesses, government, NGOs and development partners.",
  academic: "Support for students, academics, universities and research units.",
};

/** Chart series slot per track. Colour follows the entity, never its rank. */
export const TRACK_SERIES: Record<Track, 1 | 2> = { corporate: 2, academic: 1 };

export const ACADEMIC_LEVELS = [
  "Undergraduate",
  "Postgraduate diploma",
  "Master's",
  "Doctoral",
  "Academic staff",
  "Research unit or institute",
] as const;
export type AcademicLevel = (typeof ACADEMIC_LEVELS)[number];

/* ------------------------------------------------------------------ categories */

export type DefaultCategory = { id: string; name: string; track: Track; description: string };

/** Seeded from the Primeresearch service lines. Admins can add, rename or retire categories. */
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    id: "market-research",
    name: "Market research",
    track: "corporate",
    description: "Market sizing, customer satisfaction, brand health, product and pricing research, U&A studies.",
  },
  {
    id: "opinion-polling",
    name: "Opinion polling and social surveys",
    track: "corporate",
    description: "Opinion polls, citizen perception, household and KAP surveys, media audience research.",
  },
  {
    id: "monitoring-evaluation",
    name: "Monitoring and evaluation",
    track: "corporate",
    description: "Baseline, midline and endline surveys, needs assessments, process and impact evaluations.",
  },
  {
    id: "policy-economic",
    name: "Policy, economic and sector research",
    track: "corporate",
    description: "Policy briefs, feasibility studies, value-chain and labour-market studies, business plans.",
  },
  {
    id: "data-collection",
    name: "Data collection and field services",
    track: "corporate",
    description: "Questionnaire design, sampling, CAPI and CATI surveys, focus groups and interviews.",
  },
  {
    id: "data-analysis",
    name: "Data analysis and reporting",
    track: "corporate",
    description: "Data cleaning, statistics, qualitative analysis, dashboards, reports and presentations.",
  },
  {
    id: "research-training",
    name: "Research training",
    track: "corporate",
    description: "Courses in research methods, SPSS, Stata, R, NVivo, M&E and Power BI.",
  },
  {
    id: "research-design",
    name: "Research design and methodology",
    track: "academic",
    description: "Sharpening the research question, choosing a design, sample and instruments.",
  },
  {
    id: "proposal-ethics",
    name: "Proposal development and ethics applications",
    track: "academic",
    description: "Structuring proposals and preparing ethics committee documents.",
  },
  {
    id: "statistical-analysis",
    name: "Statistical analysis and interpretation",
    track: "academic",
    description: "Choosing and running the right tests for theses, dissertations and faculty projects.",
  },
  {
    id: "manuscript-preparation",
    name: "Manuscript preparation and journal submission",
    track: "academic",
    description: "Shaping findings into a publishable paper and responding to reviewers.",
  },
  {
    id: "editing-formatting",
    name: "Editing, formatting and referencing",
    track: "academic",
    description: "Language editing and formatting to the institution's guide, APA and Harvard referencing.",
  },
  {
    id: "methods-advice",
    name: "Methods advice for research units",
    track: "academic",
    description: "On-call methods support and peer review for departments and policy institutes.",
  },
];

/* ------------------------------------------------------------------ assignments */

export const ASSIGNMENT_STATUSES = [
  "not_started",
  "in_progress",
  "under_review",
  "revision",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const STATUS_LABELS: Record<AssignmentStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  under_review: "Under review",
  revision: "Needs revision",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_DESCRIPTIONS: Record<AssignmentStatus, string> = {
  not_started: "Assigned, work has not begun.",
  in_progress: "Work is under way.",
  under_review: "Submitted to the administrator for review.",
  revision: "Returned with changes requested.",
  on_hold: "Paused, waiting on the client or a decision.",
  completed: "Approved and delivered.",
  cancelled: "Stopped and will not be delivered.",
};

/** Statuses that count as open work. */
export const OPEN_STATUSES: AssignmentStatus[] = ["not_started", "in_progress", "under_review", "revision", "on_hold"];

export function isOpenStatus(status: AssignmentStatus) {
  return OPEN_STATUSES.includes(status);
}

/**
 * Status changes an employee may make on their own assignments. Completing,
 * cancelling and requesting revisions are for the administrator.
 */
export const EMPLOYEE_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  not_started: ["in_progress"],
  in_progress: ["under_review", "on_hold"],
  under_review: ["in_progress"],
  revision: ["in_progress", "under_review"],
  on_hold: ["in_progress"],
  completed: [],
  cancelled: [],
};

export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

export const PAYMENT_STATUSES = ["not_invoiced", "invoiced", "part_paid", "paid", "waived"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  not_invoiced: "Not invoiced",
  invoiced: "Invoiced",
  part_paid: "Part paid",
  paid: "Paid",
  waived: "Waived",
};

export const FILE_KINDS = ["brief", "data", "draft", "deliverable", "other"] as const;
export type FileKind = (typeof FILE_KINDS)[number];

export const FILE_KIND_LABELS: Record<FileKind, string> = {
  brief: "Brief or terms of reference",
  data: "Data",
  draft: "Draft",
  deliverable: "Final deliverable",
  other: "Other",
};

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/* ------------------------------------------------------------------ clients */

export const CLIENT_TYPES = [
  "Business or brand",
  "Government or public agency",
  "NGO or development partner",
  "University or institute",
  "Small or medium enterprise",
  "Student or researcher",
] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const SECTORS = [
  "Consumer goods and retail",
  "Financial services, banking, insurance and mobile money",
  "Telecommunications and technology",
  "Agriculture and agribusiness",
  "Health and public health",
  "Education",
  "Energy, mining and infrastructure",
  "Development organisations and NGOs",
  "Government and the public sector",
  "Media and communications",
  "Other",
] as const;

/* ------------------------------------------------------------------ reports */

export const REPORT_PERIODS = ["daily", "weekly", "monthly"] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  daily: "Daily report",
  weekly: "Weekly report",
  monthly: "Monthly report",
};

export const REPORT_STATUSES = ["submitted", "reviewed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/* ------------------------------------------------------------------ office access */

export const DEVICE_MODES = ["first-sign-in", "registered"] as const;
export type DeviceMode = (typeof DEVICE_MODES)[number];

export const DEVICE_MODE_LABELS: Record<DeviceMode, string> = {
  "first-sign-in": "Lock each employee to the computer they first sign in on",
  registered: "Only computers the administrator has approved",
};

export const DEVICE_STATUSES = ["approved", "pending", "blocked"] as const;
export type DeviceStatus = (typeof DEVICE_STATUSES)[number];

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

/** Reasons a sign-in or a request can be refused, with the message the person sees. */
export const ACCESS_DENIALS = {
  "bad-credentials": "The email address or password is not correct.",
  "rate-limited": "Too many attempts. Wait a few minutes, then try again.",
  suspended: "This account has been suspended. Please speak to the administrator.",
  "no-profile": "This account has not been set up in the management system yet. Please speak to the administrator.",
  network: "You can only sign in from the Primeresearch office network.",
  location: "You can only sign in from inside the Primeresearch office.",
  "location-missing": "Allow this page to use your location so we can confirm you are in the office, then try again.",
  hours: "Sign-in is only available during office hours.",
  "device-pending": "This computer is not registered for your account. The administrator has been asked to approve it.",
  "device-blocked": "This computer has been blocked from the management system.",
  "device-other-user": "This office computer is registered to another member of staff.",
  "device-limit": "Your account is already registered to another office computer. Please speak to the administrator.",
  "device-mismatch": "Your session does not match this computer. Please sign in again.",
  expired: "Your session has ended. Please sign in again.",
  "signed-out": "You have signed out.",
  "password-changed": "Your password has been changed. Sign in with your new password.",
  "not-configured": "The management system is not connected to Firebase yet. See the setup guide.",
  "auth-error": "Sign-in is unavailable right now. Please try again shortly.",
} as const;
export type AccessDenial = keyof typeof ACCESS_DENIALS;

/* ------------------------------------------------------------------ performance */

/** Weights of the composite performance score. They add up to 100. */
export const SCORE_WEIGHTS = {
  onTime: 35,
  quality: 30,
  throughput: 20,
  reporting: 15,
} as const;

export const DEFAULT_TARGETS = { monthlyAssignments: 6, weeklyHours: 40 } as const;
