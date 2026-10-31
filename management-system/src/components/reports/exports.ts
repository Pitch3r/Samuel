import type { Period } from "@/lib/metrics";

/** CSV downloads served by /api/export/[type]. */
export const EXPORT_TYPES = ["assignments", "time", "reports", "attendance", "performance"] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];

export const EXPORTS: Record<ExportType, { label: string; description: string; employees: boolean }> = {
  assignments: {
    label: "Assignments",
    description: "Every assignment active in the period: client, people, status, dates, quality, hours and fees.",
    employees: false,
  },
  time: {
    label: "Time logs",
    description: "Each time entry in the period, with the person, the assignment and the note.",
    employees: true,
  },
  reports: {
    label: "Work reports",
    description: "Daily, weekly and monthly reports covering the period, with ratings and feedback.",
    employees: true,
  },
  attendance: {
    label: "Attendance",
    description: "Office sign-ins per person per day: first sign-in, last seen, computer and address.",
    employees: true,
  },
  performance: {
    label: "Performance",
    description: "Each active employee's score, its four parts and the figures behind them.",
    employees: false,
  },
};

export function isExportType(value: string): value is ExportType {
  return (EXPORT_TYPES as readonly string[]).includes(value);
}

/** Link to a CSV download for the period. */
export function exportHref(type: ExportType, period: Period) {
  return `/api/export/${type}?${new URLSearchParams({ from: period.from, to: period.to }).toString()}`;
}

/** "primeresearch-assignments-2026-10-01-to-2026-10-31.csv" */
export function exportFilename(type: ExportType, period: Period) {
  return `primeresearch-${type}-${period.from}-to-${period.to}.csv`;
}
