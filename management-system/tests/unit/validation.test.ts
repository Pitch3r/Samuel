import { describe, expect, it } from "vitest";
import { accessSettingsSchema, assignmentSchema, formToObject, parseForm, parseMilestoneLines, timeLogSchema } from "@/lib/validation";
import { toCsv } from "@/lib/csv";
import { safeNextPath } from "@/lib/utils";
import { addMonths, describeDue, startOfWeek, toISODate } from "@/lib/format";

function form(entries: [string, string][]) {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return data;
}

describe("forms", () => {
  it("collects repeated keys into arrays", () => {
    const object = formToObject(form([["assigneeIds", "a"], ["assigneeIds", "b"], ["title", "x"]]), ["assigneeIds", "days"]);
    expect(object).toEqual({ assigneeIds: ["a", "b"], title: "x", days: [] });
  });

  it("validates an assignment and reports field errors", () => {
    const bad = parseForm(assignmentSchema, form([["title", ""], ["track", "corporate"], ["categoryId", "x"], ["priority", "normal"]]), ["assigneeIds"]);
    expect(bad.ok).toBe(false);
    if (!bad.ok && !bad.result.ok) {
      expect(bad.result.fieldErrors?.title).toBeTruthy();
      expect(bad.result.fieldErrors?.assigneeIds).toBeTruthy();
    }
    const good = parseForm(
      assignmentSchema,
      form([
        ["title", "Brand tracker"],
        ["track", "corporate"],
        ["categoryId", "market-research"],
        ["assigneeIds", "u1"],
        ["priority", "high"],
        ["startDate", "2026-10-01"],
        ["dueDate", "2026-10-30"],
        ["fee", "12,500"],
        ["amountPaid", ""],
        ["estimatedHours", ""],
        ["tags", "brand, tracker"],
      ]),
      ["assigneeIds"],
    );
    expect(good.ok).toBe(true);
    if (good.ok) {
      expect(good.data.fee).toBe(12500);
      expect(good.data.amountPaid).toBe(0);
      expect(good.data.estimatedHours).toBeNull();
      expect(good.data.tags).toEqual(["brand", "tracker"]);
      expect(good.data.clientId).toBeNull();
    }
  });

  it("refuses a due date before the start date", () => {
    const result = assignmentSchema.safeParse({ title: "x", track: "academic", categoryId: "c", assigneeIds: ["u"], priority: "low", startDate: "2026-10-10", dueDate: "2026-10-01" });
    expect(result.success).toBe(false);
  });

  it("limits time entries", () => {
    expect(timeLogSchema.safeParse({ date: "2026-10-01", hours: "0.1" }).success).toBe(false);
    expect(timeLogSchema.safeParse({ date: "2026-10-01", hours: "17" }).success).toBe(false);
    expect(timeLogSchema.safeParse({ date: "2026-10-01", hours: "7.5" }).success).toBe(true);
  });

  it("checks office access settings", () => {
    const base = { deviceMode: "first-sign-in", maxPerEmployee: "1", radiusMeters: "150", start: "07:00", end: "18:00", sessionHours: "10", days: ["1"], latitude: "", longitude: "" };
    expect(accessSettingsSchema.safeParse({ ...base, networkEnabled: "on", allowed: "" }).success).toBe(false);
    expect(accessSettingsSchema.safeParse({ ...base, networkEnabled: "on", allowed: "41.72.100.10\n10.0.0.0/8" }).success).toBe(true);
    expect(accessSettingsSchema.safeParse({ ...base, networkEnabled: "on", allowed: "office wifi" }).success).toBe(false);
    expect(accessSettingsSchema.safeParse({ ...base, hoursEnabled: "on", start: "18:00", end: "07:00", allowed: "" }).success).toBe(false);
    expect(accessSettingsSchema.safeParse({ ...base, locationEnabled: "on", allowed: "" }).success).toBe(false);
  });

  it("parses milestone lines", () => {
    expect(parseMilestoneLines("Inception | 2026-11-01\n\nFieldwork\nBad date | soon")).toEqual([
      { title: "Inception", dueDate: "2026-11-01" },
      { title: "Fieldwork", dueDate: null },
      { title: "Bad date", dueDate: null },
    ]);
  });
});

describe("helpers", () => {
  it("only redirects to same-site paths", () => {
    expect(safeNextPath("/assignments/1")).toBe("/assignments/1");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(safeNextPath("/login")).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
  });

  it("escapes CSV and blocks spreadsheet formulas", () => {
    const csv = toCsv([{ a: 'He said "hi", twice', b: "=SUM(A1)" }], [
      { key: "a", label: "A" },
      { key: "b", label: "B" },
    ]);
    expect(csv).toContain('"He said ""hi"", twice"');
    expect(csv).toContain("'=SUM(A1)");
  });

  it("does date arithmetic in Lusaka time", () => {
    expect(toISODate("2026-10-31T22:30:00Z")).toBe("2026-11-01");
    expect(startOfWeek("2026-11-01")).toBe("2026-10-26");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(describeDue("2026-10-30", "2026-10-31").tone).toBe("danger");
    expect(describeDue("2026-10-31", "2026-10-31").label).toBe("Due today");
  });
});
