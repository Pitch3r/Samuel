import type { IconName } from "@/lib/icons";

export const values: { title: string; detail: string }[] = [
  { title: "Rigour", detail: "Method before opinion. Every claim can be traced to its evidence." },
  { title: "Clarity", detail: "Plain language, clean reporting, one idea at a time." },
  { title: "Integrity", detail: "Honest findings, transparent limitations, no inflated conclusions." },
  { title: "Partnership", detail: "We work alongside clients and researchers, not above them." },
];

export const reasons: { title: string; detail: string; icon: IconName }[] = [
  {
    title: "Rigour",
    detail: "Method before opinion. Every claim in our reports can be traced to its evidence.",
    icon: "microscope",
  },
  {
    title: "Clarity",
    detail: "Plain language, clean reporting and one idea at a time, so findings are understood the first time.",
    icon: "eye",
  },
  {
    title: "Integrity",
    detail: "Honest findings and transparent limitations. We do not inflate conclusions to please a brief.",
    icon: "scale",
  },
  {
    title: "Local depth, regional reach",
    detail: "We understand Zambian markets, communities and institutions, and we work across the region.",
    icon: "map-pin",
  },
  {
    title: "One partner for the whole cycle",
    detail: "Design, fieldwork, analysis, reporting and training under one roof, which means fewer hand-offs and fewer errors.",
    icon: "workflow",
  },
  {
    title: "Research at every level",
    detail: "The same discipline whether the client is a student, a start-up or a ministry.",
    icon: "layers",
  },
];

/** Published commitments, used in place of testimonials. */
export const commitments: { title: string; detail: string }[] = [
  { title: "A named lead researcher", detail: "One accountable person runs your study from scoping to final presentation." },
  { title: "A methods note in every report", detail: "Sample, mode, dates, weighting and limitations, stated plainly." },
  { title: "Timelines agreed in writing", detail: "A workplan you sign off, with progress updates at every stage." },
  { title: "Secure data handling", detail: "Encrypted devices, restricted access and agreed retention periods." },
  { title: "Honest findings", detail: "Including the ones you did not expect, and the ones you did not want." },
  { title: "A reply within one working day", detail: "Every enquiry gets a response from a researcher, not an autoresponder." },
];

export const clientTypes: { title: string; icon: IconName }[] = [
  { title: "Businesses and brands", icon: "briefcase" },
  { title: "Government and public agencies", icon: "landmark" },
  { title: "NGOs and development partners", icon: "handshake" },
  { title: "Universities and institutes", icon: "book-open" },
  { title: "Small and medium enterprises", icon: "building" },
  { title: "Students and researchers", icon: "graduation-cap" },
];

export const capabilities: { title: string; detail: string; icon: IconName }[] = [
  { title: "Research leads", detail: "Design studies, manage clients and own the quality of every deliverable.", icon: "compass" },
  { title: "Statisticians and analysts", detail: "Sampling, weighting, modelling and reproducible analysis.", icon: "sigma" },
  { title: "Field managers and supervisors", detail: "Plan logistics, lead teams and enforce quality standards on the ground.", icon: "route" },
  { title: "Trained enumerators", detail: "Interviewers trained on ethics, devices and each study's instrument.", icon: "users" },
  { title: "Qualitative researchers", detail: "Moderate groups, conduct interviews and lead thematic analysis.", icon: "messages" },
  { title: "Associate specialists", detail: "Sector experts and economists brought in where a study needs them.", icon: "network" },
];

export const fieldLanguages = ["English", "Bemba", "Nyanja", "Tonga", "Lozi", "Kaonde", "Lunda", "Luvale"] as const;

export const provinces = [
  "Central",
  "Copperbelt",
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western",
] as const;

/** Main local languages by province, used on the coverage map. */
export const provinceLanguages: Record<(typeof provinces)[number], string[]> = {
  Central: ["Bemba", "Lenje"],
  Copperbelt: ["Bemba", "Lamba"],
  Eastern: ["Nyanja", "Tumbuka"],
  Luapula: ["Bemba"],
  Lusaka: ["Nyanja", "Bemba"],
  Muchinga: ["Bemba", "Namwanga"],
  Northern: ["Bemba", "Mambwe"],
  "North-Western": ["Kaonde", "Lunda", "Luvale"],
  Southern: ["Tonga"],
  Western: ["Lozi"],
};

