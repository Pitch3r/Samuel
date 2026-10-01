import type { IconName } from "@/lib/icons";

export type CourseCategory = "Methods" | "Software" | "M&E" | "Data visualisation" | "Fieldwork" | "Mentoring";

export type Course = {
  slug: string;
  title: string;
  category: CourseCategory;
  icon: IconName;
  duration: string;
  level: string;
  summary: string;
  outcomes: string[];
};

export const courseCategories: CourseCategory[] = ["Methods", "Software", "M&E", "Data visualisation", "Fieldwork", "Mentoring"];

export const courses: Course[] = [
  {
    slug: "research-methods-foundations",
    title: "Research methods foundations",
    category: "Methods",
    icon: "compass",
    duration: "2 days",
    level: "Beginner",
    summary: "The full research cycle in two practical days, from a sharp question to a credible conclusion.",
    outcomes: ["Write research questions that lead to decisions", "Choose between quantitative, qualitative and mixed designs", "Plan ethics, consent and data protection"],
  },
  {
    slug: "questionnaire-design-sampling",
    title: "Questionnaire design and survey sampling",
    category: "Methods",
    icon: "list-checks",
    duration: "2 days",
    level: "Intermediate",
    summary: "Design questions that measure what you intend, and samples that represent the people you care about.",
    outcomes: ["Avoid leading and double-barrelled questions", "Calculate sample sizes and design effects", "Plan stratified and multi-stage samples"],
  },
  {
    slug: "data-analysis-spss",
    title: "Data analysis with SPSS",
    category: "Software",
    icon: "chart-column",
    duration: "3 days",
    level: "Beginner to intermediate",
    summary: "From raw data to tables, tests and charts, using SPSS on real survey datasets.",
    outcomes: ["Clean, recode and label data", "Run and interpret common statistical tests", "Produce publication-ready tables"],
  },
  {
    slug: "applied-statistics-stata",
    title: "Applied statistics with Stata",
    category: "Software",
    icon: "sigma",
    duration: "3 days",
    level: "Intermediate",
    summary: "Reproducible analysis in Stata, with do-files, survey weights and regression modelling.",
    outcomes: ["Write clean, reusable do-files", "Analyse complex survey data with weights", "Fit and interpret regression models"],
  },
  {
    slug: "data-analysis-r",
    title: "Data analysis and visualisation in R",
    category: "Software",
    icon: "chart-combined",
    duration: "3 days",
    level: "Intermediate",
    summary: "Free, open-source analysis with R and the tidyverse, from data wrangling to clear charts.",
    outcomes: ["Import, tidy and transform data", "Build charts that make one point clearly", "Create reproducible reports"],
  },
  {
    slug: "qualitative-analysis-nvivo",
    title: "Qualitative data analysis with NVivo",
    category: "Software",
    icon: "messages",
    duration: "2 days",
    level: "Beginner",
    summary: "Code interviews and focus groups systematically, and build themes you can trace back to the data.",
    outcomes: ["Set up and organise an NVivo project", "Develop and apply a coding framework", "Report themes with supporting evidence"],
  },
  {
    slug: "monitoring-evaluation-essentials",
    title: "Monitoring and evaluation essentials",
    category: "M&E",
    icon: "clipboard-check",
    duration: "3 days",
    level: "Beginner to intermediate",
    summary: "Theories of change, results frameworks, indicators and evaluation designs that stand up to scrutiny.",
    outcomes: ["Build a theory of change and results framework", "Write SMART indicators", "Choose an evaluation design that fits the question"],
  },
  {
    slug: "dashboards-power-bi",
    title: "Dashboards and data visualisation with Power BI",
    category: "Data visualisation",
    icon: "gauge",
    duration: "2 days",
    level: "Beginner",
    summary: "Turn spreadsheets into interactive dashboards that busy decision makers will actually use.",
    outcomes: ["Model and clean data in Power BI", "Design clear, uncluttered dashboards", "Publish and share reports safely"],
  },
  {
    slug: "enumerator-supervisor-training",
    title: "Enumerator and field supervisor training",
    category: "Fieldwork",
    icon: "users",
    duration: "Tailored to your study",
    level: "All levels",
    summary: "Interviewing technique, research ethics, CAPI devices and quality standards for field teams.",
    outcomes: ["Conduct neutral, ethical interviews", "Use CAPI devices and handle common problems", "Apply supervision and back-check procedures"],
  },
  {
    slug: "early-career-mentoring",
    title: "Mentoring for early-career researchers",
    category: "Mentoring",
    icon: "graduation-cap",
    duration: "3 months",
    level: "Early career",
    summary: "Structured one-to-one guidance for graduate students and junior researchers building their practice.",
    outcomes: ["A personal development plan", "Regular feedback on live research work", "Guidance on publishing and presenting"],
  },
];

export const trainingFormats: { title: string; detail: string; icon: IconName }[] = [
  { title: "Public courses in Lusaka", detail: "Join participants from other organisations on scheduled dates.", icon: "map-pin" },
  { title: "In-house at your premises", detail: "Built around your data and systems, anywhere in Zambia.", icon: "building" },
  { title: "Live online", detail: "Interactive sessions with hands-on exercises, wherever your team is.", icon: "monitor-smartphone" },
];
