"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { ActionForm, Field, Input, Select, SubmitButton, Textarea } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

export type LogTimeAssignment = { id: string; ref: string; title: string; assigneeIds: string[] };
export type LogTimePerson = { uid: string; name: string };

type Action = (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;

const QUICK_HOURS = [0.5, 1, 2, 4, 8];

/**
 * Keeps typed values when an action fails validation. React resets a form
 * after every action; this form clears its own fields on success instead.
 */
function useKeepValues() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const keep = (event: Event) => event.preventDefault();
    form.addEventListener("reset", keep);
    return () => form.removeEventListener("reset", keep);
  }, []);
  return ref;
}

/**
 * Log hours against one of the person's open assignments, or general office
 * work. The administrator can also log for a member of staff; the assignment
 * list then follows the person chosen.
 */
export function LogTimeForm({
  action,
  assignments,
  people,
  viewerUid,
  isAdmin,
  defaultUid,
  defaultDate,
  defaultAssignmentId,
  today,
}: {
  action: Action;
  assignments: LogTimeAssignment[];
  people: LogTimePerson[];
  viewerUid: string;
  isAdmin: boolean;
  defaultUid: string;
  defaultDate: string;
  defaultAssignmentId: string;
  today: string;
}) {
  const [uid, setUid] = useState(defaultUid);
  const [date, setDate] = useState(defaultDate);
  const [assignmentId, setAssignmentId] = useState(defaultAssignmentId);
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const keepRef = useKeepValues();

  // The administrator logging their own time may use any open assignment.
  const options = useMemo(
    () => (isAdmin && uid === viewerUid ? assignments : assignments.filter((assignment) => assignment.assigneeIds.includes(uid))),
    [assignments, isAdmin, uid, viewerUid],
  );
  const selected = options.some((option) => option.id === assignmentId) ? assignmentId : "";

  return (
    <ActionForm
      action={action}
      className="space-y-4"
      onSuccess={() => {
        setHours("");
        setNote("");
      }}
    >
      <span ref={keepRef} hidden />
      {isAdmin && (
        <Field label="Whose time" name="uid" hint={uid === viewerUid ? "Logging your own time." : "Logged on their timesheet and counted in their hours."}>
          <Select name="uid" value={uid} onChange={(event) => setUid(event.target.value)}>
            {people.map((person) => (
              <option key={person.uid} value={person.uid}>
                {person.uid === viewerUid ? `Me (${person.name})` : person.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" name="date" required>
          <Input type="date" name="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} required />
        </Field>
        <Field label="Hours" name="hours" required>
          <Input
            type="number"
            name="hours"
            inputMode="decimal"
            step="0.25"
            min="0.25"
            max="16"
            placeholder="0"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            required
          />
        </Field>
      </div>

      <div className="-mt-1 flex flex-wrap gap-1.5" role="group" aria-label="Quick hours">
        {QUICK_HOURS.map((value) => {
          const active = Number(hours) === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setHours(String(value))}
              aria-pressed={active}
              className={cn(
                "tabular rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                active ? "border-blue bg-blue-tint text-blue-dark" : "border-mist bg-white text-slate hover:border-slate/40 hover:text-navy",
              )}
            >
              {value < 1 ? "30 min" : `${value} h`}
            </button>
          );
        })}
      </div>

      <Field
        label="Worked on"
        name="assignmentId"
        hint={options.length ? undefined : isAdmin && uid !== viewerUid ? "This person has no open assignments." : "You have no open assignments, so this goes to general office work."}
      >
        <Select name="assignmentId" value={selected} onChange={(event) => setAssignmentId(event.target.value)}>
          <option value="">General office work</option>
          {options.length > 0 && (
            <optgroup label="Open assignments">
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.ref} {option.title}
                </option>
              ))}
            </optgroup>
          )}
        </Select>
      </Field>

      <Field label="Note" name="note" hint="A few words on what was done, for example analysis, drafting or a client call.">
        <Textarea name="note" rows={2} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Saving">
        <Clock aria-hidden="true" />
        Log time
      </SubmitButton>
    </ActionForm>
  );
}
