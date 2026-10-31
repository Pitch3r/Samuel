import { describe, expect, it } from "vitest";
import {
  countByStatus,
  employeeMetrics,
  isOverdue,
  monthlySeries,
  outstandingFees,
  overallOnTimeRate,
  scoreFrom,
  scoreGrade,
  wasOnTime,
} from "@/lib/metrics";
import type { Assignment, TimeLog, WorkReport } from "@/lib/types";

function assignment(overrides: Partial<Assignment>): Assignment {
  return {
    id: "a",
    ref: "PR-2026-0001",
    title: "Study",
    description: "",
    track: "corporate",
    categoryId: "market-research",
    categoryName: "Market research",
    academicLevel: null,
    clientId: null,
    clientName: "",
    assigneeIds: ["u1"],
    priority: "normal",
    status: "in_progress",
    progress: 0,
    startDate: "2026-10-01",
    dueDate: "2026-10-20",
    submittedAt: null,
    completedAt: null,
    estimatedHours: null,
    loggedHours: 0,
    fee: null,
    paymentStatus: "not_invoiced",
    amountPaid: 0,
    milestones: [],
    tags: [],
    qualityRating: null,
    reviewNote: "",
    createdBy: "admin",
    createdAt: "2026-10-01T08:00:00.000Z",
    updatedAt: "2026-10-01T08:00:00.000Z",
    ...overrides,
  };
}

const user = { uid: "u1", displayName: "Chanda", targets: { monthlyAssignments: 4, weeklyHours: 40 } };
const october = { from: "2026-10-01", to: "2026-10-31" };

describe("score", () => {
  it("re-weights when parts are missing", () => {
    expect(scoreFrom({ onTime: 1, quality: null, throughput: null, reporting: null })).toBe(100);
    expect(scoreFrom({ onTime: 0, quality: 1, throughput: null, reporting: null })).toBe(46); // 30 / 65
    expect(scoreFrom({ onTime: null, quality: null, throughput: null, reporting: null })).toBeNull();
  });

  it("clamps parts to the 0 to 1 range", () => {
    expect(scoreFrom({ onTime: 2, quality: 1, throughput: 1, reporting: 1 })).toBe(100);
  });

  it("grades scores", () => {
    expect(scoreGrade(90).label).toBe("Excellent");
    expect(scoreGrade(72).label).toBe("Good");
    expect(scoreGrade(60).label).toBe("Fair");
    expect(scoreGrade(20).label).toBe("Needs attention");
    expect(scoreGrade(null).label).toBe("Not enough data");
  });
});

describe("delivery", () => {
  it("judges on-time delivery on Lusaka calendar dates", () => {
    // 21:30 UTC on the 20th is 23:30 on the 20th in Lusaka: on time.
    expect(wasOnTime(assignment({ status: "completed", completedAt: "2026-10-20T21:30:00.000Z" }))).toBe(true);
    // 22:30 UTC on the 20th is 00:30 on the 21st in Lusaka: late.
    expect(wasOnTime(assignment({ status: "completed", completedAt: "2026-10-20T22:30:00.000Z" }))).toBe(false);
    expect(wasOnTime(assignment({ status: "completed", completedAt: "2026-10-20T10:00:00.000Z", dueDate: null }))).toBeNull();
  });

  it("flags overdue open work only", () => {
    expect(isOverdue(assignment({ dueDate: "2026-10-20" }), "2026-10-21")).toBe(true);
    expect(isOverdue(assignment({ dueDate: "2026-10-20" }), "2026-10-20")).toBe(false);
    expect(isOverdue(assignment({ dueDate: "2026-10-20", status: "completed" }), "2026-10-25")).toBe(false);
  });

  it("computes the on-time rate for a period", () => {
    const items = [
      assignment({ id: "1", status: "completed", completedAt: "2026-10-10T10:00:00.000Z" }),
      assignment({ id: "2", status: "completed", completedAt: "2026-10-25T10:00:00.000Z" }),
      assignment({ id: "3", status: "completed", completedAt: "2026-09-10T10:00:00.000Z" }),
    ];
    expect(overallOnTimeRate(items, october)).toBe(0.5);
  });

  it("counts statuses and outstanding fees", () => {
    const items = [
      assignment({ status: "completed", fee: 1000, amountPaid: 400, paymentStatus: "part_paid" }),
      assignment({ status: "completed", fee: 500, paymentStatus: "paid", amountPaid: 500 }),
      assignment({ status: "completed", fee: 800, paymentStatus: "waived" }),
      assignment({ status: "in_progress", fee: 9000 }),
    ];
    expect(countByStatus(items).completed).toBe(3);
    expect(outstandingFees(items)).toBe(600);
  });

  it("builds a monthly series ending this month", () => {
    const rows = monthlySeries(
      [
        assignment({ createdAt: "2026-09-03T08:00:00.000Z", status: "completed", completedAt: "2026-10-05T08:00:00.000Z", track: "academic", fee: 100 }),
        assignment({ createdAt: "2026-10-03T08:00:00.000Z" }),
      ],
      3,
      "2026-10-31",
    );
    expect(rows.map((row) => row.month)).toEqual(["2026-08", "2026-09", "2026-10"]);
    expect(rows[1]!.created).toBe(1);
    expect(rows[2]).toMatchObject({ created: 1, completed: 1, academic: 1, revenue: 100 });
  });
});

describe("employee metrics", () => {
  it("leaves output and reporting out before someone had work or had started", () => {
    const metrics = employeeMetrics(
      { ...user, startDate: "2026-12-01" },
      { assignments: [assignment({ createdAt: "2026-11-15T08:00:00.000Z" })], timeLogs: [], reports: [], attendance: [] },
      october,
      "2026-10-31",
    );
    expect(metrics.parts.throughput).toBeNull();
    expect(metrics.parts.reporting).toBeNull();
    expect(metrics.score).toBeNull();
  });

  const logs: TimeLog[] = [
    { id: "t1", uid: "u1", assignmentId: "1", assignmentTitle: "", assignmentRef: "", date: "2026-10-05", hours: 6, note: "", createdAt: "" },
    { id: "t2", uid: "u1", assignmentId: null, assignmentTitle: "", assignmentRef: "", date: "2026-09-30", hours: 8, note: "", createdAt: "" },
    { id: "t3", uid: "u2", assignmentId: null, assignmentTitle: "", assignmentRef: "", date: "2026-10-05", hours: 8, note: "", createdAt: "" },
  ];
  const reports: WorkReport[] = [
    {
      id: "r1",
      uid: "u1",
      authorName: "Chanda",
      period: "weekly",
      periodStart: "2026-10-05",
      periodEnd: "2026-10-09",
      summary: "",
      accomplishments: "",
      challenges: "",
      nextSteps: "",
      hours: null,
      assignmentIds: [],
      status: "submitted",
      feedback: "",
      rating: null,
      reviewedAt: null,
      reviewedBy: null,
      createdAt: "2026-10-09T15:00:00.000Z",
      updatedAt: "",
    },
  ];

  it("summarises one person's month", () => {
    const metrics = employeeMetrics(
      user,
      {
        assignments: [
          assignment({ id: "1", status: "completed", completedAt: "2026-10-15T10:00:00.000Z", qualityRating: 4, fee: 2000 }),
          assignment({ id: "2", status: "completed", completedAt: "2026-10-25T10:00:00.000Z", qualityRating: 5 }),
          assignment({ id: "3", status: "in_progress", dueDate: "2026-10-28" }),
          assignment({ id: "4", status: "in_progress", assigneeIds: ["u2"] }),
        ],
        timeLogs: logs,
        reports,
        attendance: [],
      },
      october,
      "2026-10-31",
    );
    expect(metrics.completedInPeriod).toBe(2);
    expect(metrics.completedOnTime).toBe(1);
    expect(metrics.onTimeRate).toBe(0.5);
    expect(metrics.avgQuality).toBe(4.5);
    expect(metrics.activeCount).toBe(1);
    expect(metrics.overdueCount).toBe(1);
    expect(metrics.hoursLogged).toBe(6);
    expect(metrics.revenue).toBe(2000);
    expect(metrics.reportWeeksCovered).toBe(1);
    expect(metrics.reportWeeksExpected).toBe(5);
    expect(metrics.workingDays).toBe(22);
    expect(metrics.score).not.toBeNull();
  });
});

describe("delivery date", () => {
  it("counts the employee's last submission, not the approval date", () => {
    expect(
      wasOnTime(assignment({ status: "completed", dueDate: "2026-10-20", submittedAt: "2026-10-19T10:00:00.000Z", completedAt: "2026-10-23T10:00:00.000Z" })),
    ).toBe(true);
    expect(
      wasOnTime(assignment({ status: "completed", dueDate: "2026-10-20", submittedAt: "2026-10-22T10:00:00.000Z", completedAt: "2026-10-23T10:00:00.000Z" })),
    ).toBe(false);
  });

  it("does not expect a report for the current week before Friday", () => {
    const metrics = employeeMetrics(user, { assignments: [], timeLogs: [], reports: [], attendance: [] }, { from: "2026-10-26", to: "2026-10-28" }, "2026-10-28");
    expect(metrics.reportWeeksExpected).toBe(0);
    expect(metrics.parts.reporting).toBeNull();
  });
});
