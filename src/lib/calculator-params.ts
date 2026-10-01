import { confidenceLevels, type ConfidenceLevel } from "@/lib/sample-size";

export type CalculatorInitial = Partial<{
  mode: "size" | "margin";
  confidence: ConfidenceLevel;
  moe: number;
  proportion: number;
  population: string;
  designEffect: number;
  responseRate: number;
  sample: number;
}>;

/** Reads settings shared through the calculator's own "copy link" URLs. Runs on the server. */
export function parseCalculatorParams(params: Record<string, string | string[] | undefined>): CalculatorInitial {
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const num = (key: string) => {
    const raw = one(key);
    const value = raw === undefined ? NaN : Number(raw);
    return Number.isFinite(value) ? value : undefined;
  };
  const initial: CalculatorInitial = {};
  const c = num("c");
  if (c !== undefined && confidenceLevels.some((entry) => entry.level === c)) initial.confidence = c as ConfidenceLevel;
  const e = num("e");
  if (e !== undefined && e >= 1 && e <= 15) initial.moe = e;
  const p = num("p");
  if (p !== undefined && p >= 1 && p <= 99) initial.proportion = p;
  const n = one("N");
  if (n && /^\d{1,12}$/.test(n)) initial.population = n;
  const d = num("d");
  if (d !== undefined && d >= 1 && d <= 4) initial.designEffect = d;
  const r = num("r");
  if (r !== undefined && r >= 10 && r <= 100) initial.responseRate = r;
  const sample = num("n");
  if (sample !== undefined && sample >= 10 && sample <= 20000) initial.sample = Math.round(sample);
  if (one("mode") === "margin") initial.mode = "margin";
  return initial;
}
