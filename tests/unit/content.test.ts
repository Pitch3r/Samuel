import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { processSteps, researchLevels } from "@/content/approach";
import { provinceLanguages, provinces } from "@/content/company";
import { seedArticles } from "@/content/insights-seed";
import { sectors } from "@/content/sectors";
import { services } from "@/content/services";
import { studyGoals } from "@/content/study-finder";
import { courses } from "@/content/training";
import { zambiaProvinces } from "@/content/zambia-map";
import { icons } from "@/lib/icons";

const serviceSlugs = new Set(services.map((service) => service.slug));
const sectorSlugs = new Set(sectors.map((sector) => sector.slug));

describe("content integrity", () => {
  it("has eight services and ten sectors with unique slugs", () => {
    expect(services).toHaveLength(8);
    expect(serviceSlugs.size).toBe(8);
    expect(sectors).toHaveLength(10);
    expect(sectorSlugs.size).toBe(10);
  });

  it("only cross-links to things that exist", () => {
    for (const service of services) for (const slug of service.sectors) expect(sectorSlugs.has(slug), `${service.slug} -> ${slug}`).toBe(true);
    for (const sector of sectors) for (const slug of sector.services) expect(serviceSlugs.has(slug), `${sector.slug} -> ${slug}`).toBe(true);
    for (const goal of studyGoals) expect(serviceSlugs.has(goal.service), goal.key).toBe(true);
  });

  it("uses only registered icons", () => {
    const names = [
      ...services.map((item) => item.icon),
      ...sectors.map((item) => item.icon),
      ...studyGoals.map((item) => item.icon),
      ...courses.map((item) => item.icon),
      ...processSteps.map((item) => item.icon),
    ];
    for (const name of names) expect(name in icons, name).toBe(true);
  });

  it("describes six process stages and four research dimensions", () => {
    expect(processSteps).toHaveLength(6);
    expect(researchLevels.map((level) => level.key)).toEqual(["depth", "method", "client", "reach"]);
  });

  it("maps all ten provinces with languages", () => {
    expect(zambiaProvinces).toHaveLength(10);
    for (const province of provinces) {
      expect(zambiaProvinces.some((shape) => shape.name === province), province).toBe(true);
      expect(provinceLanguages[province].length).toBeGreaterThan(0);
    }
  });

  it("seeds six well-formed articles", () => {
    expect(seedArticles).toHaveLength(6);
    expect(new Set(seedArticles.map((article) => article.slug)).size).toBe(6);
    expect(seedArticles.filter((article) => article.featured)).toHaveLength(1);
    for (const article of seedArticles) {
      expect(article.excerpt.length).toBeLessThanOrEqual(300);
      expect(article.body.split(/\s+/).length).toBeGreaterThan(500);
      expect(article.body).not.toMatch(/^# /m);
    }
  });
});

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "fonts" ? [] : walk(full);
    return /\.(tsx?|css|md)$/.test(entry) ? [full] : [];
  });
}

describe("house style", () => {
  it("contains no em dashes or en dashes anywhere in the source", () => {
    const offenders = walk(path.resolve(__dirname, "../../src")).filter((file) => /[–—]/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
