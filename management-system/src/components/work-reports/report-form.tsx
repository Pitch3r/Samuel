"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, CalendarRange, Clock, ListChecks, NotebookPen, Send, Sun } from "lucide-react";
import { ActionForm, Checkbox, Field, Input, SubmitButton, Textarea, useFieldError } from "@/components/ui/form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { KeepValuesAfterSubmit } from "@/components/ui/form";
import { RANGE_CHOICES, defaultRange, previousRange, rangeLabel, type Range } from "@/components/work-reports/periods";
import { REPORT_PERIODS, type ReportPeriod } from "@/lib/constants";
import { formatHours } from "@/lib/format";
import { cn, round, sum } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

export type ReportFormAssignment = { id: string; ref: string; title: string; status: string; open: boolean };
export type ReportFormLog = { date: string; assignmentId: string | null; hours: number };
export type ReportFormValues = {
  period: ReportPeriod;
  periodStart: string;
  periodEnd: string;
  summary: string;
  accomplishments: string;
  challenges: string;
  nextSteps: string;
  hours: number | null;
  assignmentIds: string[];
};

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

const PERIOD_OPTIONS: Record<ReportPeriod, { label: string; description: string; icon: React.ReactNode }> = {
  daily: { label: "Daily", description: "One day's work", icon: <Sun aria-hidden="true" /> },
  weekly: { label: "Weekly", description: "Monday to Friday", icon: <CalendarRange aria-hidden="true" /> },
  monthly: { label: "Monthly", description: "The whole month", icon: <CalendarDays aria-hidden="true" /> },
};

function PeriodPicker({ value, onChange }: { value: ReportPeriod; onChange: (period: ReportPeriod) => void }) {
  const error = useFieldError("period");
  return (
    <fieldset>
      <legend className="field-label">
        Type of report
        <span className="text-danger" aria-hidden="true">
          {" "}
          *
        </span>
      </legend>
      <div className="grid gap-2.5 sm:grid-cols-3">
        {REPORT_PERIODS.map((period) => {
          const option = PERIOD_OPTIONS[period];
          const selected = period === value;
          return (
            <label
              key={period}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-[border-color,background-color,box-shadow] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue",
                selected ? "border-blue bg-blue-tint/60 ring-1 ring-blue" : "border-mist bg-white hover:border-slate/40",
              )}
            >
              <input type="radio" name="period" value={period} checked={selected} onChange={() => onChange(period)} className="sr-only" />
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg ring-1 [&_svg]:size-4",
                  selected ? "bg-blue text-white ring-blue" : "bg-cloud text-navy ring-mist",
                )}
              >
                {option.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-navy">{option.label}</span>
                <span className="block text-xs text-slate">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

/**
 * The daily, weekly or monthly report form, for both new reports and edits.
 * Dates follow the type of report; hours and assignments are suggested from
 * the timesheet for the chosen dates.
 */
export function ReportForm({
  action,
  values,
  assignments,
  logs,
  today,
  submitLabel,
  cancelHref,
}: {
  action: Action;
  values: ReportFormValues;
  assignments: ReportFormAssignment[];
  logs: ReportFormLog[];
  today: string;
  submitLabel: string;
  cancelHref: string;
}) {
  const [period, setPeriod] = useState<ReportPeriod>(values.period);
  const [start, setStart] = useState(values.periodStart);
  const [end, setEnd] = useState(values.periodEnd);
  const [hours, setHours] = useState(values.hours === null ? "" : String(values.hours));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(values.assignmentIds));

  const inRange = useMemo(() => logs.filter((log) => log.date >= start && log.date <= end), [logs, start, end]);
  const logged = round(sum(inRange.map((log) => log.hours)), 2);
  const hoursByAssignment = useMemo(() => {
    const map = new Map<string, number>();
    for (const log of inRange) if (log.assignmentId) map.set(log.assignmentId, round((map.get(log.assignmentId) ?? 0) + log.hours, 2));
    return map;
  }, [inRange]);

  // Assignments with time in the period first, then open work, then the rest.
  const ordered = useMemo(
    () =>
      [...assignments].sort(
        (a, b) =>
          (hoursByAssignment.get(b.id) ?? 0) - (hoursByAssignment.get(a.id) ?? 0) ||
          Number(b.open) - Number(a.open) ||
          a.ref.localeCompare(b.ref),
      ),
    [assignments, hoursByAssignment],
  );
  const withTime = ordered.filter((assignment) => hoursByAssignment.has(assignment.id));
  const choices = RANGE_CHOICES[period];
  const ranges: [Range, Range] = [defaultRange(period, today), previousRange(period, today)];
  const validRange = /^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end) && start <= end;

  function choosePeriod(next: ReportPeriod) {
    setPeriod(next);
    const range = defaultRange(next, today);
    setStart(range.start);
    setEnd(range.end);
  }

  function toggle(id: string, on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <ActionForm action={action} className="grid gap-6 lg:grid-cols-3 lg:items-start">
      <KeepValuesAfterSubmit />

      <Card className="lg:col-span-2">
        <CardHeader icon={<NotebookPen aria-hidden="true" />} title="Your report" description="What you worked on, what you achieved and what comes next." />
        <CardBody className="space-y-6 py-5">
          <PeriodPicker value={period} onChange={choosePeriod} />

          <div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={period === "daily" ? "Date" : "From"} name="periodStart" required>
                <Input
                  type="date"
                  name="periodStart"
                  value={start}
                  max={today}
                  onChange={(event) => {
                    setStart(event.target.value);
                    if (period === "daily") setEnd(event.target.value);
                  }}
                  required
                />
              </Field>
              <Field label="To" name="periodEnd" required>
                <Input
                  type="date"
                  name="periodEnd"
                  value={end}
                  min={start}
                  onChange={(event) => setEnd(event.target.value)}
                  readOnly={period === "daily"}
                  aria-readonly={period === "daily"}
                  className={period === "daily" ? "bg-cloud text-slate" : undefined}
                  required
                />
              </Field>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5" role="group" aria-label="Quick dates">
              {ranges.map((range, index) => {
                const active = range.start === start && range.end === end;
                return (
                  <button
                    key={choices[index]}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setStart(range.start);
                      setEnd(range.end);
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                      active ? "border-blue bg-blue-tint text-blue-dark" : "border-mist bg-white text-slate hover:border-slate/40 hover:text-navy",
                    )}
                  >
                    {choices[index]}
                  </button>
                );
              })}
              {validRange && <span className="ml-1 text-xs text-slate">Covers {rangeLabel(start, end)}</span>}
            </div>
          </div>

          <Field label="Summary" name="summary" required hint="Two or three sentences the administrator can read at a glance.">
            <Textarea name="summary" rows={4} maxLength={4000} defaultValue={values.summary} required />
          </Field>
          <Field label="Accomplishments" name="accomplishments" hint="One per line: deliverables sent, analysis finished, meetings held.">
            <Textarea name="accomplishments" rows={5} maxLength={6000} defaultValue={values.accomplishments} />
          </Field>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Challenges" name="challenges" hint="Anything that slowed the work or needs a decision.">
              <Textarea name="challenges" rows={4} maxLength={4000} defaultValue={values.challenges} />
            </Field>
            <Field label="Next steps" name="nextSteps" hint="What you plan to do in the next period.">
              <Textarea name="nextSteps" rows={4} maxLength={4000} defaultValue={values.nextSteps} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card className="lg:sticky lg:top-24">
        <CardHeader icon={<Clock aria-hidden="true" />} title="Time and assignments" description="Taken from your timesheet for the dates chosen." />
        <CardBody className="space-y-5 py-5">
          <Field
            label="Hours worked"
            name="hours"
            hint={
              validRange ? (
                <>
                  You logged <span className="tabular font-semibold text-navy">{formatHours(logged)}</span> on the timesheet for {rangeLabel(start, end)}.
                  {logged > 0 && Number(hours) !== logged && (
                    <button type="button" onClick={() => setHours(String(logged))} className="ml-1 font-semibold text-blue-dark hover:underline">
                      Use {formatHours(logged)}
                    </button>
                  )}
                </>
              ) : (
                "Choose the dates to see the hours you logged."
              )
            }
          >
            <Input type="number" name="hours" inputMode="decimal" step="0.25" min="0" max="400" value={hours} onChange={(event) => setHours(event.target.value)} />
          </Field>

          <div role="group" aria-labelledby="report-assignments-label">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p id="report-assignments-label" className="field-label mb-0">
                Assignments worked on
              </p>
              {withTime.length > 0 && withTime.some((assignment) => !selected.has(assignment.id)) && (
                <button
                  type="button"
                  onClick={() => setSelected((current) => new Set([...current, ...withTime.map((assignment) => assignment.id)]))}
                  className="shrink-0 text-xs font-semibold whitespace-nowrap text-blue-dark hover:underline"
                >
                  Tick those with time
                </button>
              )}
            </div>
            {ordered.length === 0 ? (
              <p className="rounded-xl border border-dashed border-mist px-3 py-4 text-center text-sm text-slate">No assignments to link yet.</p>
            ) : (
              <div className="max-h-96 space-y-1 overflow-y-auto rounded-xl border border-mist p-1.5">
                {ordered.map((assignment) => {
                  const time = hoursByAssignment.get(assignment.id);
                  return (
                    <Checkbox
                      key={assignment.id}
                      name="assignmentIds"
                      value={assignment.id}
                      checked={selected.has(assignment.id)}
                      onChange={(event) => toggle(assignment.id, event.target.checked)}
                      className={cn("rounded-lg px-2.5 py-2 transition-colors hover:bg-cloud", selected.has(assignment.id) && "bg-blue-tint/50")}
                      label={
                        <>
                          <span className="tabular mr-1.5 text-xs font-semibold text-slate">{assignment.ref}</span>
                          {assignment.title}
                        </>
                      }
                      description={
                        <span className="text-xs">
                          {time ? `${formatHours(time)} logged in this period` : assignment.open ? "No time logged in this period" : assignment.status}
                        </span>
                      }
                    />
                  );
                })}
              </div>
            )}
            <p className="field-hint flex items-center gap-1.5">
              <ListChecks className="size-3.5" aria-hidden="true" />
              {selected.size ? `${selected.size} selected` : "Optional, but it links the report to the work."}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="flex flex-col-reverse gap-3 rounded-card border border-mist bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between lg:col-span-3">
        <p className="text-sm text-slate">Your report goes to the administrator for review. You can edit or delete it until it has been reviewed.</p>
        <div className="flex shrink-0 gap-2">
          <Link href={cancelHref} className={buttonClasses({ variant: "secondary" })}>
            Cancel
          </Link>
          <SubmitButton pendingLabel="Sending">
            <Send aria-hidden="true" />
            {submitLabel}
          </SubmitButton>
        </div>
      </div>
    </ActionForm>
  );
}
