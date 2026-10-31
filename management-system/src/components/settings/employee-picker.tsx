"use client";

import { useFieldError } from "@/components/ui/form";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type EmployeeOption = { uid: string; name: string; jobTitle: string; photoVersion: string | null; suspended: boolean };

/**
 * Checkboxes for the employees allowed to use an office computer. Leaving
 * every box unticked means any employee may sign in on it.
 */
export function EmployeePicker({
  employees,
  selected = [],
  name = "assignedUids",
  legend = "Who may use this computer",
}: {
  employees: EmployeeOption[];
  selected?: string[];
  name?: string;
  legend?: string;
}) {
  const error = useFieldError(name);
  return (
    <fieldset>
      <legend className="field-label">{legend}</legend>
      {employees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-mist px-4 py-3 text-sm text-slate">
          There are no employee accounts yet, so any employee you add later can use it.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {employees.map((employee) => (
            <li key={employee.uid}>
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-mist bg-white px-3 py-2.5 transition-colors hover:border-slate/40",
                  "has-[:checked]:border-blue has-[:checked]:bg-blue-tint/60",
                )}
              >
                <input
                  type="checkbox"
                  name={name}
                  value={employee.uid}
                  defaultChecked={selected.includes(employee.uid)}
                  className="size-4 shrink-0 rounded border-mist accent-blue"
                />
                <Avatar name={employee.name} uid={employee.uid} photoVersion={employee.photoVersion} size="sm" />
                <span className="min-w-0 text-sm">
                  <span className="block truncate font-semibold text-navy">{employee.name}</span>
                  <span className="block truncate text-xs text-slate">{employee.suspended ? "Suspended" : employee.jobTitle || "Employee"}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="field-error">{error}</p> : <p className="field-hint">Leave every box unticked to let any employee sign in on it.</p>}
    </fieldset>
  );
}
