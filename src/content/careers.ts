import type { IconName } from "@/lib/icons";

export const careerRoles: { title: string; detail: string; icon: IconName }[] = [
  {
    title: "Enumerators and field interviewers",
    detail: "Conduct face-to-face and telephone interviews with care, accuracy and respect for every respondent.",
    icon: "users",
  },
  {
    title: "Field supervisors and team leaders",
    detail: "Lead field teams, manage logistics and enforce our quality standards on the ground.",
    icon: "route",
  },
  {
    title: "Data analysts and statisticians",
    detail: "Clean, analyse and visualise data in SPSS, Stata, R or Python on an associate basis.",
    icon: "sigma",
  },
  {
    title: "Research associates and consultants",
    detail: "Sector specialists, economists and qualitative researchers who join studies where their expertise is needed.",
    icon: "briefcase",
  },
  {
    title: "Internships and industrial attachments",
    detail: "Practical experience for university students in research, fieldwork and analysis.",
    icon: "graduation-cap",
  },
];

export const fieldPromises: { title: string; detail: string }[] = [
  { title: "Training before every study", detail: "You are briefed and trained on each instrument before you start." },
  { title: "Clear terms", detail: "Your role, rates and schedule are agreed in writing before fieldwork." },
  { title: "Safety first", detail: "Field safety protocols, supervision and support while you work." },
  { title: "Room to grow", detail: "Strong enumerators are considered first for supervisor and analyst roles." },
];

export const careerRoleOptions = [
  "Enumerator / field interviewer",
  "Field supervisor / team leader",
  "Data analyst / statistician",
  "Research associate / consultant",
  "Internship or attachment",
] as const;

export const educationLevels = [
  "Grade 12 certificate",
  "Certificate or diploma",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate",
] as const;
