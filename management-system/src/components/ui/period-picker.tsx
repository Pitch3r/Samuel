import { FilterForm } from "@/components/ui/auto-submit";
import { PERIOD_PRESETS, type PeriodPreset } from "@/lib/period";
import type { Period } from "@/lib/metrics";

/** Date-range filter: presets plus a custom range. Keeps other query params via hidden inputs. */
export function PeriodPicker({
  preset,
  period,
  keep = {},
  presets = PERIOD_PRESETS.map((p) => p.id),
}: {
  preset: PeriodPreset;
  period: Period;
  keep?: Record<string, string | undefined>;
  presets?: PeriodPreset[];
}) {
  return (
    <FilterForm className="no-print flex flex-wrap items-end gap-2">
      {Object.entries(keep).map(([key, value]) => (value ? <input key={key} type="hidden" name={key} value={value} /> : null))}
      <label className="text-xs font-semibold text-slate">
        <span className="mb-1 block">Period</span>
        <select name="period" defaultValue={preset} className="field-input h-10 w-44 py-0 text-sm">
          {PERIOD_PRESETS.filter((p) => presets.includes(p.id)).map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      {preset === "custom" && (
        <>
          <label className="text-xs font-semibold text-slate">
            <span className="mb-1 block">From</span>
            <input type="date" name="from" defaultValue={period.from} className="field-input h-10 w-40 py-0 text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate">
            <span className="mb-1 block">To</span>
            <input type="date" name="to" defaultValue={period.to} className="field-input h-10 w-40 py-0 text-sm" />
          </label>
        </>
      )}
      <noscript>
        <button type="submit" className="field-input h-10 w-auto">
          Apply
        </button>
      </noscript>
    </FilterForm>
  );
}
