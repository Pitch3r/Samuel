import type {
  AcademicLevel,
  AssignmentStatus,
  ClientType,
  DeviceMode,
  DeviceStatus,
  EmploymentType,
  FileKind,
  PaymentStatus,
  Priority,
  ReportPeriod,
  ReportStatus,
  Role,
  Track,
  UserStatus,
} from "@/lib/constants";

/*
 * Firestore document shapes. Date-times are stored as ISO 8601 strings (UTC),
 * calendar dates as "YYYY-MM-DD" in Lusaka time. Both sort correctly as text.
 */

export type ISODateTime = string;
export type ISODate = string;

export interface UserProfile {
  uid: string;
  email: string;
  role: Role;
  status: UserStatus;
  displayName: string;
  jobTitle: string;
  department: string;
  staffNumber: string;
  phone: string;
  location: string;
  bio: string;
  specialisations: string[];
  qualifications: string;
  employmentType: EmploymentType;
  startDate: ISODate | null;
  photoPath: string | null;
  photoUpdatedAt: ISODateTime | null;
  emergencyContact: { name: string; phone: string; relationship: string };
  targets: { monthlyAssignments: number; weeklyHours: number };
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  lastLoginAt: ISODateTime | null;
  lastSeenAt: ISODateTime | null;
}

export interface Category {
  id: string;
  name: string;
  track: Track;
  description: string;
  active: boolean;
  order: number;
  createdAt: ISODateTime;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  sector: string;
  contactName: string;
  email: string;
  phone: string;
  institution: string;
  address: string;
  notes: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  createdBy: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: ISODate | null;
  done: boolean;
  doneAt: ISODateTime | null;
  doneBy: string | null;
}

export interface Assignment {
  id: string;
  /** Human reference, e.g. PR-2026-0042. */
  ref: string;
  title: string;
  description: string;
  track: Track;
  categoryId: string;
  categoryName: string;
  academicLevel: AcademicLevel | null;
  clientId: string | null;
  clientName: string;
  assigneeIds: string[];
  priority: Priority;
  status: AssignmentStatus;
  /** 0 to 100. */
  progress: number;
  startDate: ISODate | null;
  dueDate: ISODate | null;
  submittedAt: ISODateTime | null;
  completedAt: ISODateTime | null;
  estimatedHours: number | null;
  loggedHours: number;
  fee: number | null;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  milestones: Milestone[];
  tags: string[];
  /** 1 to 5, set by the administrator on completion. */
  qualityRating: number | null;
  reviewNote: string;
  createdBy: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type UpdateKind = "comment" | "progress" | "status" | "file" | "milestone" | "system" | "review";

export interface AssignmentUpdate {
  id: string;
  assignmentId: string;
  authorId: string;
  authorName: string;
  kind: UpdateKind;
  text: string;
  progress: number | null;
  fromStatus: AssignmentStatus | null;
  toStatus: AssignmentStatus | null;
  createdAt: ISODateTime;
}

export interface AssignmentFile {
  id: string;
  assignmentId: string;
  name: string;
  size: number;
  contentType: string;
  kind: FileKind;
  storagePath: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: ISODateTime;
}

export interface TimeLog {
  id: string;
  uid: string;
  assignmentId: string | null;
  assignmentTitle: string;
  assignmentRef: string;
  date: ISODate;
  hours: number;
  note: string;
  createdAt: ISODateTime;
}

export interface WorkReport {
  id: string;
  uid: string;
  authorName: string;
  period: ReportPeriod;
  /** Start of the period the report covers. */
  periodStart: ISODate;
  periodEnd: ISODate;
  summary: string;
  accomplishments: string;
  challenges: string;
  nextSteps: string;
  hours: number | null;
  assignmentIds: string[];
  status: ReportStatus;
  feedback: string;
  /** 1 to 5, optional rating from the administrator. */
  rating: number | null;
  reviewedAt: ISODateTime | null;
  reviewedBy: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface AttendanceRecord {
  /** `${uid}_${date}` */
  id: string;
  uid: string;
  date: ISODate;
  firstSignInAt: ISODateTime;
  lastSeenAt: ISODateTime;
  lastSignOutAt: ISODateTime | null;
  signIns: number;
  deviceLabel: string;
  ip: string;
}

export interface DeviceDetails {
  userAgent: string;
  browser: string;
  os: string;
  platform: string;
  screen: string;
  timeZone: string;
  language: string;
  cores: number | null;
  memory: number | null;
}

export interface Device {
  id: string;
  label: string;
  status: DeviceStatus;
  /** Employees allowed to use this computer. Empty means any employee. */
  assignedUids: string[];
  details: DeviceDetails;
  firstSeenAt: ISODateTime;
  lastSeenAt: ISODateTime;
  lastIp: string;
  lastUid: string | null;
  lastUserName: string;
  requestedBy: string | null;
  requestedByName: string;
  approvedBy: string | null;
  approvedAt: ISODateTime | null;
  registeredVia: "admin" | "first-sign-in" | "request";
}

export interface SessionRecord {
  id: string;
  uid: string;
  role: Role;
  deviceId: string | null;
  ip: string;
  userAgent: string;
  createdAt: ISODateTime;
  lastSeenAt: ISODateTime;
  expiresAt: ISODateTime;
  endedAt: ISODateTime | null;
  endReason: string | null;
}

export interface LoginEvent {
  id: string;
  email: string;
  uid: string | null;
  name: string;
  success: boolean;
  reason: string;
  ip: string;
  deviceId: string | null;
  userAgent: string;
  at: ISODateTime;
}

export interface AccessSettings {
  /** Master switch. Office restrictions apply to employees only, never to the administrator. */
  enforce: boolean;
  device: { enabled: boolean; mode: DeviceMode; maxPerEmployee: number };
  network: { enabled: boolean; allowed: string[] };
  location: { enabled: boolean; latitude: number | null; longitude: number | null; radiusMeters: number };
  hours: { enabled: boolean; days: number[]; start: string; end: string };
  sessionHours: number;
  updatedAt: ISODateTime | null;
  updatedBy: string | null;
}

export interface Notification {
  id: string;
  uid: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: ISODateTime;
}

export interface ActivityEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: "assignment" | "client" | "user" | "report" | "device" | "settings" | "session" | "category" | "announcement" | "time";
  entityId: string;
  summary: string;
  at: ISODateTime;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: ISODateTime;
  expiresAt: ISODate | null;
}

/** The signed-in person, resolved once per request. */
export interface Viewer {
  uid: string;
  role: Role;
  isAdmin: boolean;
  name: string;
  email: string;
  sessionId: string;
  deviceId: string | null;
  profile: UserProfile;
}

/** Standard result returned by server actions to forms. */
export type ActionResult<T = undefined> =
  | { ok: true; message?: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
