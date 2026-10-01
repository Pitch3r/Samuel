/**
 * Sample size and margin of error for estimating a proportion.
 *
 *   n0 = z^2 * p(1 - p) / e^2                 (large population)
 *   n  = n0 / (1 + (n0 - 1) / N)               (finite population correction)
 *   n  = n * deff                              (design effect, e.g. clustering)
 *   n  = n / responseRate                      (allow for non-response)
 *
 * Each stage is rounded up before the next, the conservative convention used
 * in our guidance (385 completes with a design effect of 2 becomes 770).
 */

export const confidenceLevels = [
  { level: 80, z: 1.2816 },
  { level: 85, z: 1.4395 },
  { level: 90, z: 1.6449 },
  { level: 95, z: 1.96 },
  { level: 99, z: 2.5758 },
] as const;

export type ConfidenceLevel = (typeof confidenceLevels)[number]["level"];

export function zFor(level: ConfidenceLevel | number) {
  const match = confidenceLevels.find((entry) => entry.level === level);
  if (!match) throw new Error(`Unsupported confidence level: ${level}`);
  return match.z;
}

/** Round up, ignoring floating point dust such as 2401.0000000000005. */
function ceilClean(value: number) {
  return Math.ceil(Number(value.toFixed(6)));
}

export type SampleSizeInput = {
  /** Margin of error as a proportion, e.g. 0.05 for plus or minus 5 points. */
  marginOfError: number;
  confidence: ConfidenceLevel | number;
  /** Expected proportion. 0.5 is the cautious default. */
  proportion?: number;
  /** Population size. Omit or use Infinity for a large population. */
  population?: number;
  /** Design effect. 1 for simple random sampling, often 1.5 to 2 for cluster samples. */
  designEffect?: number;
  /** Expected response rate as a proportion, e.g. 0.8. */
  responseRate?: number;
};

export type SampleSizeResult = {
  /** Before finite population correction. */
  base: number;
  /** Completed interviews needed. */
  completes: number;
  /** Contacts to plan for once non-response is allowed for. */
  toApproach: number;
};

export function sampleSize({
  marginOfError,
  confidence,
  proportion = 0.5,
  population,
  designEffect = 1,
  responseRate = 1,
}: SampleSizeInput): SampleSizeResult {
  if (!(marginOfError > 0 && marginOfError < 1)) throw new Error("Margin of error must be between 0 and 1.");
  if (!(proportion > 0 && proportion < 1)) throw new Error("Proportion must be between 0 and 1.");
  if (!(designEffect >= 1)) throw new Error("Design effect must be 1 or more.");
  if (!(responseRate > 0 && responseRate <= 1)) throw new Error("Response rate must be between 0 and 1.");

  const z = zFor(confidence);
  const n0 = (z * z * proportion * (1 - proportion)) / (marginOfError * marginOfError);
  const finite = population && Number.isFinite(population) && population > 0;
  const corrected = ceilClean(finite ? n0 / (1 + (n0 - 1) / population) : n0);
  const completes = ceilClean(corrected * designEffect);
  const capped = finite ? Math.min(completes, Math.ceil(population)) : completes;

  return {
    base: ceilClean(n0),
    completes: capped,
    toApproach: ceilClean(capped / responseRate),
  };
}

/** Margin of error (as a proportion) achieved by a given number of completed interviews. */
export function marginOfError({
  sample,
  confidence,
  proportion = 0.5,
  population,
  designEffect = 1,
}: {
  sample: number;
  confidence: ConfidenceLevel | number;
  proportion?: number;
  population?: number;
  designEffect?: number;
}) {
  if (!(sample > 0)) throw new Error("Sample size must be greater than 0.");
  const z = zFor(confidence);
  const effective = sample / designEffect;
  let moe = z * Math.sqrt((proportion * (1 - proportion)) / effective);
  if (population && Number.isFinite(population) && population > 1) {
    if (sample >= population) return 0;
    moe *= Math.sqrt((population - sample) / (population - 1));
  }
  return moe;
}

export function formatPoints(moe: number) {
  return `±${(moe * 100).toFixed(1)}`;
}
