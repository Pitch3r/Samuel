import { addDays, formatDate, startOfWeek, weekdayOf } from "@/lib/format";

const RAMP = ["#eef3fa", "#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#0d366b"];

/**
 * Calendar heatmap (weeks across, weekdays down) on a single-hue sequential
 * ramp. Each cell carries its value in a tooltip and the screen-reader table.
 */
export function CalendarHeatmap({
  values,
  from,
  to,
  title,
  unit = "h",
  thresholds = [0.01, 2, 4, 6, 8],
}: {
  values: Record<string, number>;
  from: string;
  to: string;
  title: string;
  unit?: string;
  thresholds?: number[];
}) {
  const start = startOfWeek(from);
  const weeks: string[][] = [];
  for (let week = start; week <= to; week = addDays(week, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(week, i)));
  }
  const level = (value: number) => thresholds.filter((t) => value >= t).length;
  const cell = 13;
  const gap = 3;
  const labels = ["Mon", "", "Wed", "", "Fri", "", ""];
  return (
    <figure>
      <svg
        viewBox={`0 0 ${30 + weeks.length * (cell + gap)} ${7 * (cell + gap)}`}
        className="w-full max-w-full"
        role="img"
        aria-label={title}
      >
        {labels.map((label, i) =>
          label ? (
            <text key={label} x="0" y={i * (cell + gap) + cell - 2} className="fill-slate text-[10px]">
              {label}
            </text>
          ) : null,
        )}
        {weeks.map((days, w) =>
          days.map((day) => {
            const row = (weekdayOf(day) + 6) % 7;
            const outside = day < from || day > to;
            const value = values[day] ?? 0;
            return (
              <rect
                key={day}
                x={30 + w * (cell + gap)}
                y={row * (cell + gap)}
                width={cell}
                height={cell}
                rx="3"
                fill={outside ? "transparent" : RAMP[level(value)]}
              >
                {!outside && <title>{`${formatDate(day)}: ${value.toLocaleString("en-GB")} ${unit}`}</title>}
              </rect>
            );
          }),
        )}
      </svg>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-slate" aria-hidden="true">
        Less
        {RAMP.map((color) => (
          <span key={color} className="size-2.5 rounded-[3px]" style={{ background: color }} />
        ))}
        More
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {Object.entries(values)
            .filter(([day]) => day >= from && day <= to)
            .map(([day, value]) => (
              <tr key={day}>
                <th scope="row">{formatDate(day)}</th>
                <td>
                  {value} {unit}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </figure>
  );
}
