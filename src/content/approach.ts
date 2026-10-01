import type { IconName } from "@/lib/icons";

export type ProcessStep = {
  number: string;
  title: string;
  headline: string;
  detail: string;
  output: string;
  icon: IconName;
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "Scope",
    headline: "We start with the decision you need to make, not the survey you think you need.",
    detail:
      "A short scoping conversation clarifies the decision, the audience, the timeline and the budget. Sometimes the right answer is a smaller study, or existing data.",
    output: "A written proposal with method, workplan, team and a transparent budget.",
    icon: "compass",
  },
  {
    number: "02",
    title: "Design",
    headline: "Method, sampling, instruments and ethics are agreed before fieldwork begins.",
    detail:
      "We design the sample, draft and pre-test the instruments, and secure ethical clearance where the study requires it. Nothing goes to the field until you have signed off.",
    output: "Inception report, sampling plan, tested instruments and approvals.",
    icon: "layers",
  },
  {
    number: "03",
    title: "Collect",
    headline: "Trained teams, a pilot, and quality checks while data is still coming in.",
    detail:
      "Our field teams are trained on your study before they start. We pilot first, then monitor progress and quality every day with back-checks and real-time validation.",
    output: "Daily progress updates and quality reports during fieldwork.",
    icon: "monitor-smartphone",
  },
  {
    number: "04",
    title: "Analyse",
    headline: "Clean data, appropriate tests, and interpretation that respects the limits of the evidence.",
    detail:
      "Data is cleaned against documented rules and analysed to an agreed plan. Every finding is checked against the data before it is written up.",
    output: "A clean, documented dataset and analysis outputs.",
    icon: "sigma",
  },
  {
    number: "05",
    title: "Report",
    headline: "Clear writing, strong visuals, and recommendations you can act on.",
    detail:
      "We lead with the answer, give one idea per section and use charts that make a single point. Limitations are stated plainly.",
    output: "A full report with executive summary, plus dashboards or infographics where useful.",
    icon: "file-text",
  },
  {
    number: "06",
    title: "Support",
    headline: "Presentations to your board or stakeholders, and follow-up as findings are put to use.",
    detail:
      "We present the findings to the people who need to act on them, answer their questions and stay available as decisions are made.",
    output: "Stakeholder presentations and follow-up support.",
    icon: "presentation",
  },
];

export type LevelDimension = {
  key: string;
  label: string;
  title: string;
  description: string;
  steps: { title: string; detail: string }[];
  progression: boolean;
};

export const researchLevels: LevelDimension[] = [
  {
    key: "depth",
    label: "By depth",
    title: "From a quick desk review to a national study",
    description: "We match the depth of the study to the weight of the decision.",
    progression: true,
    steps: [
      { title: "Desk review", detail: "What existing data and literature already tell us. Typically 1 to 2 weeks." },
      { title: "Rapid assessment", detail: "Fast, focused fieldwork for time-critical decisions. Typically 2 to 4 weeks." },
      { title: "Full survey", detail: "Representative primary data with full analysis. Typically 6 to 12 weeks." },
      { title: "Longitudinal study and evaluation", detail: "Repeated measurement to show change over time. Months to years." },
      { title: "National and multi-country studies", detail: "Large, complex samples across provinces and borders." },
    ],
  },
  {
    key: "method",
    label: "By method",
    title: "Methods chosen to fit the question",
    description: "Never the other way round. Many studies combine more than one approach.",
    progression: false,
    steps: [
      { title: "Quantitative", detail: "Surveys and statistics that measure how many, how much and how often." },
      { title: "Qualitative", detail: "Interviews and focus groups that explain why and how." },
      { title: "Mixed methods", detail: "Numbers and narratives designed to answer one question together." },
      { title: "Secondary data analysis", detail: "New insight from census, survey and administrative data that already exists." },
      { title: "Participatory approaches", detail: "Communities involved in shaping the questions and interpreting the answers." },
    ],
  },
  {
    key: "client",
    label: "By client",
    title: "The same discipline for every client",
    description: "Whether the brief comes from a student, a start-up or a ministry.",
    progression: false,
    steps: [
      { title: "Students and individual researchers", detail: "Methods, analysis and writing support for theses and papers." },
      { title: "Small and medium enterprises", detail: "Focused, affordable studies that answer one commercial question well." },
      { title: "Corporates and brands", detail: "Market, customer and brand research, including continuous tracking." },
      { title: "NGOs and development partners", detail: "Baselines, evaluations and monitoring to partner standards." },
      { title: "Government ministries and agencies", detail: "Citizen surveys, policy analysis and impact assessments." },
      { title: "Universities and research institutes", detail: "Fieldwork, analysis and methods support for research teams." },
    ],
  },
  {
    key: "reach",
    label: "By reach",
    title: "From one district to the region",
    description: "Based in Lusaka, working throughout Zambia and across Southern and Eastern Africa.",
    progression: true,
    steps: [
      { title: "Community and district", detail: "Deep, local studies in specific communities and districts." },
      { title: "Provincial", detail: "Samples designed to report reliably for one or more provinces." },
      { title: "National", detail: "Representative studies across all ten provinces of Zambia." },
      { title: "Regional", detail: "Assignments across Southern and Eastern Africa, with partners where needed." },
    ],
  },
];

export const deliverables: { title: string; detail: string; icon: IconName }[] = [
  { title: "Inception report", detail: "Agreed method, instruments, workplan and risks, signed off before fieldwork.", icon: "file-check" },
  { title: "Clean, documented dataset", detail: "Labelled variables, a codebook and documented cleaning rules.", icon: "database" },
  { title: "Full analytical report", detail: "Findings, methods and limitations, led by an executive summary.", icon: "file-text" },
  { title: "Stakeholder presentation", detail: "A clear deck, presented in person or online to the people who will act.", icon: "presentation" },
  { title: "Dashboards and infographics", detail: "Interactive or one-page visual summaries where they add value.", icon: "chart-column" },
  { title: "Raw data and code", detail: "Available on request, within the confidentiality promised to respondents.", icon: "lock" },
];

export const qualityProtocol: { title: string; detail: string }[] = [
  { title: "Every instrument is piloted", detail: "Questions are tested with real respondents before the main fieldwork starts." },
  { title: "Teams trained on each study", detail: "Enumerators are trained on the specific instrument and tested before deployment." },
  { title: "GPS, timestamps and durations checked daily", detail: "Location, timing and interview length are reviewed as data arrives." },
  { title: "Independent back-checks", detail: "A random sample of interviews is re-contacted by a separate team to verify them." },
  { title: "Audio audits, with consent", detail: "Where a study allows, short recordings confirm that questions were asked as written." },
  { title: "Automated range and consistency checks", detail: "Impossible values and broken skip patterns are flagged in real time." },
  { title: "Documented cleaning and a codebook", detail: "Every change to the data is recorded, so the dataset can be audited." },
  { title: "Internal peer review", detail: "A second researcher reviews every report before it reaches you." },
];

export const ethicsCommitments: { title: string; detail: string; icon: IconName }[] = [
  {
    title: "Informed consent",
    detail:
      "Every respondent is told who we are, why we are asking and how their answers will be used, and can decline or stop at any time.",
    icon: "handshake",
  },
  {
    title: "Confidentiality",
    detail: "Names and identifying details are kept separate from answers and never appear in reports.",
    icon: "lock",
  },
  {
    title: "Ethical clearance",
    detail:
      "Where a study requires it, we obtain approval from an accredited research ethics committee and, for health research, authority from the National Health Research Authority before fieldwork begins.",
    icon: "file-check",
  },
  {
    title: "Data protection",
    detail:
      "Personal data is handled in line with Zambia's Data Protection Act No. 3 of 2021: collected for a stated purpose, stored securely and kept only as long as it is needed.",
    icon: "shield-check",
  },
  {
    title: "Care for vulnerable groups",
    detail: "Additional safeguards, including guardian consent, apply to research with children and other vulnerable people.",
    icon: "users",
  },
  {
    title: "Recognised codes",
    detail:
      "We follow the ICC/ESOMAR International Code on Market, Opinion and Social Research and Data Analytics, the ESOMAR/WAPOR Guideline on Opinion Polls and Published Surveys, and the OECD DAC evaluation criteria.",
    icon: "scale",
  },
];
