import { describe, expect, it } from "vitest";
import { formatPoints, marginOfError, sampleSize, zFor } from "@/lib/sample-size";

describe("sampleSize", () => {
  it("matches the standard large-population sample sizes at 95% confidence", () => {
    expect(sampleSize({ marginOfError: 0.1, confidence: 95 }).completes).toBe(97);
    expect(sampleSize({ marginOfError: 0.05, confidence: 95 }).completes).toBe(385);
    expect(sampleSize({ marginOfError: 0.03, confidence: 95 }).completes).toBe(1068);
    expect(sampleSize({ marginOfError: 0.02, confidence: 95 }).completes).toBe(2401);
  });

  it("applies the finite population correction", () => {
    expect(sampleSize({ marginOfError: 0.05, confidence: 95, population: 1000 }).completes).toBe(278);
    expect(sampleSize({ marginOfError: 0.03, confidence: 95, population: 1000 }).completes).toBe(517);
  });

  it("never asks for more interviews than the population", () => {
    expect(sampleSize({ marginOfError: 0.01, confidence: 99, population: 50 }).completes).toBeLessThanOrEqual(50);
  });

  it("scales for proportion, design effect and response rate", () => {
    expect(sampleSize({ marginOfError: 0.05, confidence: 95, proportion: 0.2 }).completes).toBe(246);
    expect(sampleSize({ marginOfError: 0.05, confidence: 95, designEffect: 2 }).completes).toBe(770);
    expect(sampleSize({ marginOfError: 0.05, confidence: 95, designEffect: 2, responseRate: 0.8 }).toApproach).toBe(963);
    const withResponse = sampleSize({ marginOfError: 0.05, confidence: 95, responseRate: 0.8 });
    expect(withResponse.completes).toBe(385);
    expect(withResponse.toApproach).toBe(482);
  });

  it("rejects impossible inputs", () => {
    expect(() => sampleSize({ marginOfError: 0, confidence: 95 })).toThrow();
    expect(() => sampleSize({ marginOfError: 0.05, confidence: 97 })).toThrow();
    expect(() => sampleSize({ marginOfError: 0.05, confidence: 95, responseRate: 0 })).toThrow();
  });
});

describe("marginOfError", () => {
  it("is about plus or minus 3 points for 1,067 interviews", () => {
    expect(formatPoints(marginOfError({ sample: 1067, confidence: 95 }))).toBe("±3.0");
  });

  it("shrinks to zero when the whole population is interviewed", () => {
    expect(marginOfError({ sample: 500, confidence: 95, population: 500 })).toBe(0);
  });

  it("uses the correct z-scores", () => {
    expect(zFor(90)).toBeCloseTo(1.645, 3);
    expect(zFor(99)).toBeCloseTo(2.576, 3);
  });
});
