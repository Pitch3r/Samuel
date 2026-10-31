import { employeeSlot, type SeriesSlot } from "@/components/charts/scale";
import { TRACK_SERIES, type Track } from "@/lib/constants";

export { employeeSlot };

/** uid to chart slot, from the full employee list in its usual order. */
export function slotsFor(employees: { uid: string }[]) {
  return new Map(employees.map((employee, index) => [employee.uid, employeeSlot(index)]));
}

/** General office work sits beside the two research tracks in its own slot. */
export const GENERAL_SLOT: SeriesSlot = 3;

export function workSlot(track: Track | null): SeriesSlot {
  return track ? TRACK_SERIES[track] : GENERAL_SLOT;
}
