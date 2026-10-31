/**
 * Fills the Firebase EMULATORS with realistic demo data: an administrator, two
 * employees, clients, assignments across both research tracks, time logs,
 * work reports and attendance. It refuses to run against a real project.
 *
 *   npm run emulators        (in one terminal)
 *   npm run seed:demo        (in another)
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { DEFAULT_CATEGORIES, DEFAULT_TARGETS, type AssignmentStatus, type PaymentStatus, type Priority } from "../src/lib/constants";
import type { Assignment, AttendanceRecord, Client, TimeLog, UserProfile, WorkReport } from "../src/lib/types";

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error("Refusing to seed: FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST must point at the emulators.");
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID || "demo-primeresearch";
initializeApp({ projectId });
const db = getFirestore();
const auth = getAuth();

const PASSWORD = "Prime2026!demo";
const today = new Date();
const iso = (date: Date) => date.toISOString();
const day = (offset: number) => {
  const d = new Date(today.getTime() + offset * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lusaka", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
};
const at = (offset: number, hour = 9, minute = 0) => {
  const d = new Date(`${day(offset)}T00:00:00+02:00`);
  d.setUTCHours(hour - 2, minute);
  return iso(d);
};
let seed = 7;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = <T,>(items: readonly T[]) => items[Math.floor(rand() * items.length)]!;

async function wipe() {
  const collections = ["users", "categories", "clients", "assignments", "timeLogs", "workReports", "attendance", "devices", "sessions", "loginEvents", "settings", "notifications", "activity", "announcements", "counters", "rateLimits"];
  for (const name of collections) {
    const snap = await db.collection(name).get();
    for (const doc of snap.docs) await db.recursiveDelete(doc.ref);
  }
  const users = await auth.listUsers();
  if (users.users.length) await auth.deleteUsers(users.users.map((user) => user.uid));
}

async function account(input: Partial<UserProfile> & { email: string; displayName: string; role: "admin" | "employee" }) {
  const record = await auth.createUser({ email: input.email, password: PASSWORD, displayName: input.displayName, emailVerified: true });
  await auth.setCustomUserClaims(record.uid, { role: input.role });
  const now = iso(today);
  const profile: Omit<UserProfile, "uid"> = {
    email: input.email,
    role: input.role,
    status: "active",
    displayName: input.displayName,
    jobTitle: input.jobTitle ?? "",
    department: input.department ?? "Research",
    staffNumber: input.staffNumber ?? "",
    phone: input.phone ?? "",
    location: "Lusaka",
    bio: input.bio ?? "",
    specialisations: input.specialisations ?? [],
    qualifications: input.qualifications ?? "",
    employmentType: input.employmentType ?? "Full time",
    startDate: input.startDate ?? null,
    photoPath: null,
    photoUpdatedAt: null,
    emergencyContact: { name: "", phone: "", relationship: "" },
    targets: { ...DEFAULT_TARGETS },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    lastSeenAt: null,
  };
  await db.collection("users").doc(record.uid).set(profile);
  return record.uid;
}

async function main() {
  console.log("Clearing emulator data");
  await wipe();

  const admin = await account({
    email: "admin@primeresearch.test",
    displayName: "Primeresearch Admin",
    role: "admin",
    jobTitle: "Managing Consultant",
    department: "Management",
    staffNumber: "PRC-001",
  });
  const chanda = await account({
    email: "chanda@primeresearch.test",
    displayName: "Chanda Mwila",
    role: "employee",
    jobTitle: "Research Analyst",
    staffNumber: "PRC-002",
    phone: "+260 97 111 2222",
    specialisations: ["Market research", "Survey design", "SPSS"],
    qualifications: "BA Economics, University of Zambia",
    bio: "Leads quantitative fieldwork and analysis for corporate studies.",
    startDate: day(-420),
  });
  const mutale = await account({
    email: "mutale@primeresearch.test",
    displayName: "Mutale Banda",
    role: "employee",
    jobTitle: "Academic Research Associate",
    staffNumber: "PRC-003",
    phone: "+260 96 333 4444",
    specialisations: ["Statistical analysis", "NVivo", "APA referencing"],
    qualifications: "MSc Public Health, University of Zambia",
    bio: "Supports students and research units with methods, analysis and editing.",
    startDate: day(-300),
  });

  const batch = db.batch();
  DEFAULT_CATEGORIES.forEach(({ id, ...category }, index) =>
    batch.set(db.collection("categories").doc(id), { ...category, active: true, order: index, createdAt: iso(today) }),
  );
  await batch.commit();

  const clients: Omit<Client, "id">[] = [
    { name: "Zambezi Beverages Ltd", type: "Business or brand", sector: "Consumer goods and retail", contactName: "Natasha Phiri", email: "insights@zambezibev.test", phone: "+260 211 000 111", institution: "", address: "Lusaka", notes: "Quarterly brand tracker client.", createdAt: at(-170), updatedAt: at(-170), createdBy: admin },
    { name: "Ministry of Health, Planning Unit", type: "Government or public agency", sector: "Health and public health", contactName: "Dr K. Mulenga", email: "planning@moh.test", phone: "", institution: "", address: "Ndeke House, Lusaka", notes: "", createdAt: at(-160), updatedAt: at(-160), createdBy: admin },
    { name: "Copperbelt Livelihoods Trust", type: "NGO or development partner", sector: "Development organisations and NGOs", contactName: "James Tembo", email: "me@clt.test", phone: "", institution: "", address: "Kitwe", notes: "Donor reporting to USAID standards.", createdAt: at(-150), updatedAt: at(-150), createdBy: admin },
    { name: "Kalinda Mobile Money", type: "Business or brand", sector: "Financial services, banking, insurance and mobile money", contactName: "Ruth Zulu", email: "cx@kalinda.test", phone: "", institution: "", address: "Lusaka", notes: "", createdAt: at(-120), updatedAt: at(-120), createdBy: admin },
    { name: "Grace Lungu", type: "Student or researcher", sector: "Education", contactName: "Grace Lungu", email: "grace@student.test", phone: "+260 95 000 1234", institution: "University of Zambia, School of Education", address: "", notes: "Master's candidate, mixed methods.", createdAt: at(-90), updatedAt: at(-90), createdBy: admin },
    { name: "Department of Public Health, CBU", type: "University or institute", sector: "Education", contactName: "Prof. M. Siame", email: "ph@cbu.test", phone: "", institution: "Copperbelt University", address: "Kitwe", notes: "Methods advice retainer.", createdAt: at(-80), updatedAt: at(-80), createdBy: admin },
    { name: "Peter Mwansa", type: "Student or researcher", sector: "Health and public health", contactName: "Peter Mwansa", email: "peter@student.test", phone: "", institution: "Levy Mwanawasa Medical University", address: "", notes: "Doctoral candidate.", createdAt: at(-60), updatedAt: at(-60), createdBy: admin },
  ];
  const clientIds: string[] = [];
  for (const client of clients) clientIds.push((await db.collection("clients").add(client)).id);

  type Spec = {
    title: string;
    client: number;
    category: string;
    assignees: string[];
    status: AssignmentStatus;
    createdAgo: number;
    dueIn: number;
    priority: Priority;
    fee: number;
    payment: PaymentStatus;
    rating?: number;
    completedLate?: number;
    level?: Assignment["academicLevel"];
    milestones: string[];
    progress?: number;
  };
  const specs: Spec[] = [
    { title: "Brand health tracker, wave 3", client: 0, category: "market-research", assignees: [chanda], status: "completed", createdAgo: 165, dueIn: -130, priority: "high", fee: 48000, payment: "paid", rating: 5, milestones: ["Questionnaire signed off", "Fieldwork", "Analysis", "Report and presentation"] },
    { title: "Baseline survey: livelihoods programme", client: 2, category: "monitoring-evaluation", assignees: [chanda, mutale], status: "completed", createdAgo: 150, dueIn: -100, priority: "high", fee: 120000, payment: "paid", rating: 4, completedLate: 3, milestones: ["Inception report", "Tools and sampling", "Data collection", "Baseline report"] },
    { title: "Thesis methodology review", client: 4, category: "research-design", assignees: [mutale], status: "completed", createdAgo: 88, dueIn: -75, priority: "normal", fee: 3500, payment: "paid", rating: 5, level: "Master's", milestones: ["Read draft chapter", "Written feedback", "Coaching session"] },
    { title: "Customer satisfaction study", client: 3, category: "market-research", assignees: [chanda], status: "completed", createdAgo: 110, dueIn: -60, priority: "normal", fee: 36000, payment: "invoiced", rating: 4, milestones: ["Sample design", "CATI fieldwork", "Analysis", "Report"] },
    { title: "Statistical analysis for doctoral study", client: 6, category: "statistical-analysis", assignees: [mutale], status: "completed", createdAgo: 58, dueIn: -30, priority: "high", fee: 9000, payment: "part_paid", rating: 4, completedLate: 2, level: "Doctoral", milestones: ["Data cleaning", "Analysis plan", "Regression models", "Interpretation notes"] },
    { title: "Health facility exit interviews", client: 1, category: "data-collection", assignees: [chanda], status: "completed", createdAgo: 70, dueIn: -25, priority: "normal", fee: 54000, payment: "invoiced", rating: 3, completedLate: 4, milestones: ["Enumerator training", "Fieldwork", "Data quality checks"] },
    { title: "Methods advice: faculty research grant", client: 5, category: "methods-advice", assignees: [mutale], status: "completed", createdAgo: 40, dueIn: -18, priority: "normal", fee: 6000, payment: "paid", rating: 5, level: "Research unit or institute", milestones: ["Proposal review", "Sampling advice"] },
    { title: "Proposal and ethics application support", client: 4, category: "proposal-ethics", assignees: [mutale], status: "completed", createdAgo: 30, dueIn: -10, priority: "normal", fee: 2800, payment: "not_invoiced", rating: 4, level: "Master's", milestones: ["Proposal structure", "Ethics forms"] },
    { title: "Mobile money usage and attitude study", client: 3, category: "market-research", assignees: [chanda], status: "in_progress", createdAgo: 21, dueIn: 12, priority: "high", fee: 65000, payment: "invoiced", progress: 55, milestones: ["Inception", "Questionnaire", "Fieldwork", "Analysis", "Report"] },
    { title: "Midline evaluation: livelihoods programme", client: 2, category: "monitoring-evaluation", assignees: [chanda, mutale], status: "in_progress", createdAgo: 18, dueIn: 25, priority: "urgent", fee: 140000, payment: "invoiced", progress: 30, milestones: ["Inception report", "Tools", "Data collection", "Analysis", "Midline report"] },
    { title: "Journal manuscript preparation", client: 6, category: "manuscript-preparation", assignees: [mutale], status: "under_review", createdAgo: 16, dueIn: 2, priority: "high", fee: 4500, payment: "not_invoiced", progress: 90, level: "Doctoral", milestones: ["Structure", "Results section", "Reference check"] },
    { title: "Citizen perception poll: service delivery", client: 1, category: "opinion-polling", assignees: [chanda], status: "revision", createdAgo: 14, dueIn: 4, priority: "high", fee: 72000, payment: "not_invoiced", progress: 80, milestones: ["Sample", "Fieldwork", "Weighting", "Topline report"] },
    { title: "Dissertation editing and APA referencing", client: 4, category: "editing-formatting", assignees: [mutale], status: "in_progress", createdAgo: 9, dueIn: -2, priority: "normal", fee: 2200, payment: "not_invoiced", progress: 60, level: "Master's", milestones: ["Chapters 1 to 3", "Chapters 4 and 5", "References"] },
    { title: "Retail audit dashboard", client: 0, category: "data-analysis", assignees: [chanda], status: "not_started", createdAgo: 3, dueIn: 20, priority: "normal", fee: 18000, payment: "not_invoiced", milestones: ["Data model", "Dashboard build", "Handover"] },
    { title: "SPSS training for research unit", client: 5, category: "research-training", assignees: [chanda, mutale], status: "on_hold", createdAgo: 12, dueIn: 30, priority: "low", fee: 15000, payment: "not_invoiced", progress: 20, milestones: ["Course outline", "Datasets", "Two-day workshop"] },
    { title: "Feasibility study: agro-processing hub", client: 2, category: "policy-economic", assignees: [chanda], status: "not_started", createdAgo: 1, dueIn: 40, priority: "normal", fee: 85000, payment: "not_invoiced", milestones: ["Desk review", "Stakeholder interviews", "Financial model", "Report"] },
    { title: "Questionnaire validation for PhD study", client: 6, category: "statistical-analysis", assignees: [mutale], status: "in_progress", createdAgo: 6, dueIn: 6, priority: "high", fee: 3800, payment: "not_invoiced", progress: 35, level: "Doctoral", milestones: ["Pilot data review", "Reliability analysis", "Factor analysis"] },
  ];

  let seq = 0;
  const assignmentIds: { id: string; spec: Spec; ref: string; title: string }[] = [];
  for (const spec of specs) {
    seq += 1;
    const category = DEFAULT_CATEGORIES.find((c) => c.id === spec.category)!;
    const createdAt = at(-spec.createdAgo, 9, 30);
    const dueDate = day(spec.dueIn);
    const completed = spec.status === "completed";
    const completedAt = completed ? at(spec.dueIn + (spec.completedLate ?? -Math.ceil(rand() * 4)), 16) : null;
    const doneCount = completed ? spec.milestones.length : Math.round(((spec.progress ?? 0) / 100) * spec.milestones.length);
    const ref = `PR-${today.getUTCFullYear()}-${String(seq).padStart(4, "0")}`;
    const doc: Omit<Assignment, "id"> = {
      ref,
      title: spec.title,
      description: `${category.description} Prepared for ${clients[spec.client]!.name}.`,
      track: category.track,
      categoryId: category.id,
      categoryName: category.name,
      academicLevel: spec.level ?? null,
      clientId: clientIds[spec.client]!,
      clientName: clients[spec.client]!.name,
      assigneeIds: spec.assignees,
      priority: spec.priority,
      status: spec.status,
      progress: completed ? 100 : (spec.progress ?? 0),
      startDate: day(-spec.createdAgo),
      dueDate,
      submittedAt: spec.status === "under_review" ? at(-1, 15) : completedAt,
      completedAt,
      estimatedHours: Math.round(20 + rand() * 80),
      loggedHours: 0,
      fee: spec.fee,
      paymentStatus: spec.payment,
      amountPaid: spec.payment === "paid" ? spec.fee : spec.payment === "part_paid" ? Math.round(spec.fee / 2) : 0,
      milestones: spec.milestones.map((title, i) => ({
        id: `m${seq}-${i}`,
        title,
        dueDate: null,
        done: i < doneCount,
        doneAt: i < doneCount ? at(-Math.max(spec.createdAgo - (i + 1) * 3, 0), 14) : null,
        doneBy: i < doneCount ? spec.assignees[0]! : null,
      })),
      tags: [],
      qualityRating: spec.rating ?? null,
      reviewNote: spec.status === "revision" ? "Please add the regional breakdown tables and tighten the executive summary." : "",
      createdBy: admin,
      createdAt,
      updatedAt: at(-1),
    };
    const ref2 = await db.collection("assignments").add(doc);
    await ref2.collection("updates").add({ assignmentId: ref2.id, authorId: admin, authorName: "Primeresearch Admin", kind: "system", text: `Created ${ref} and assigned it.`, progress: null, fromStatus: null, toStatus: null, createdAt });
    if (spec.status === "revision") {
      await ref2.collection("updates").add({ assignmentId: ref2.id, authorId: admin, authorName: "Primeresearch Admin", kind: "review", text: "Returned for revision. Please add the regional breakdown tables and tighten the executive summary.", progress: null, fromStatus: "under_review", toStatus: "revision", createdAt: at(-1, 11) });
    }
    assignmentIds.push({ id: ref2.id, spec, ref, title: spec.title });
  }
  await db.collection("counters").doc("assignments").set({ year: today.getUTCFullYear(), seq });

  // Time logs, attendance and weekly reports for the last 60 days.
  const employees = [
    { uid: chanda, name: "Chanda Mwila" },
    { uid: mutale, name: "Mutale Banda" },
  ];
  const hoursByAssignment = new Map<string, number>();
  for (let offset = -60; offset <= 0; offset++) {
    const date = day(offset);
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (weekday === 0 || weekday === 6) continue;
    for (const employee of employees) {
      if (rand() < 0.06) continue; // occasional leave day
      const open = assignmentIds.filter(
        (a) => a.spec.assignees.includes(employee.uid) && -a.spec.createdAgo <= offset && (a.spec.status !== "completed" || offset <= a.spec.dueIn),
      );
      const firstIn = at(offset, 7 + (rand() < 0.5 ? 1 : 0), Math.floor(rand() * 50));
      const record: Omit<AttendanceRecord, "id"> = {
        uid: employee.uid,
        date,
        firstSignInAt: firstIn,
        lastSeenAt: at(offset, 16 + Math.floor(rand() * 2), Math.floor(rand() * 59)),
        lastSignOutAt: offset === 0 ? null : at(offset, 17, Math.floor(rand() * 30)),
        signIns: 1 + Math.floor(rand() * 2),
        deviceLabel: employee.uid === chanda ? "Office PC 1" : "Office PC 2",
        ip: "41.72.100.10",
      };
      await db.collection("attendance").doc(`${employee.uid}_${date}`).set(record);
      let remaining = 6 + Math.round(rand() * 2 * 4) / 4;
      for (const a of open.slice(0, 2)) {
        const hours = Math.min(remaining, Math.round((2 + rand() * 4) * 4) / 4);
        if (hours <= 0) break;
        remaining -= hours;
        const log: Omit<TimeLog, "id"> = { uid: employee.uid, assignmentId: a.id, assignmentTitle: a.title, assignmentRef: a.ref, date, hours, note: pick(["Analysis", "Drafting", "Data cleaning", "Client call", "Fieldwork supervision", "Literature review"]), createdAt: at(offset, 17) };
        await db.collection("timeLogs").add(log);
        hoursByAssignment.set(a.id, (hoursByAssignment.get(a.id) ?? 0) + hours);
      }
      if (remaining > 0.5) {
        await db.collection("timeLogs").add({ uid: employee.uid, assignmentId: null, assignmentTitle: "General office work", assignmentRef: "", date, hours: Math.round(remaining * 4) / 4, note: "Team meeting and admin", createdAt: at(offset, 17) });
      }
    }
  }
  for (const [id, hours] of hoursByAssignment) await db.collection("assignments").doc(id).update({ loggedHours: Math.round(hours * 100) / 100 });

  for (const employee of employees) {
    for (let week = 8; week >= 1; week--) {
      if (rand() < 0.12) continue;
      const end = day(-week * 7 + 4);
      const start = day(-week * 7);
      const reviewed = week > 1;
      const report: Omit<WorkReport, "id"> = {
        uid: employee.uid,
        authorName: employee.name,
        period: "weekly",
        periodStart: start,
        periodEnd: end,
        summary: `Week of ${start}: progressed active assignments and kept clients updated.`,
        accomplishments: "Completed planned analysis tasks.\nShared progress notes with the client.",
        challenges: rand() < 0.4 ? "Waiting on client data for one study." : "",
        nextSteps: "Finish drafting and send for internal review.",
        hours: 38 + Math.round(rand() * 6),
        assignmentIds: [],
        status: reviewed ? "reviewed" : "submitted",
        feedback: reviewed ? pick(["Good progress, thank you.", "Clear report. Keep the client informed on timelines.", "Well done on the fieldwork quality."]) : "",
        rating: reviewed ? 3 + Math.round(rand() * 2) : null,
        reviewedAt: reviewed ? at(-week * 7 + 6) : null,
        reviewedBy: reviewed ? admin : null,
        createdAt: at(-week * 7 + 4, 16),
        updatedAt: at(-week * 7 + 4, 16),
      };
      await db.collection("workReports").add(report);
    }
  }

  await db.collection("announcements").add({
    title: "Welcome to the Primeresearch Management System",
    body: "Log your hours every day, keep assignment progress current and submit your weekly report each Friday.",
    pinned: true,
    authorId: admin,
    authorName: "Primeresearch Admin",
    createdAt: at(-2),
    expiresAt: null,
  });

  console.log("\nDemo data ready. Sign in with any of these (password %s):", PASSWORD);
  console.log("  admin@primeresearch.test   (administrator)");
  console.log("  chanda@primeresearch.test  (employee)");
  console.log("  mutale@primeresearch.test  (employee)");
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
