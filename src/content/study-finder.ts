import type { IconName } from "@/lib/icons";

export type StudyGoal = {
  key: string;
  goal: string;
  icon: IconName;
  service: string;
  studyName: string;
  approach: string;
  methods: string[];
  timeline: string;
  youReceive: string[];
};

/** Powers the "What do you need to know?" study finder on the home page. */
export const studyGoals: StudyGoal[] = [
  {
    key: "market-entry",
    goal: "Size a market or plan an entry",
    icon: "target",
    service: "market-research",
    studyName: "Market sizing and entry study",
    approach: "A desk review of existing data, a demand model, then a consumer survey and trade interviews to test the assumptions.",
    methods: ["Desk review", "Consumer survey", "Key-informant interviews", "Market model"],
    timeline: "4 to 8 weeks",
    youReceive: ["Market size and growth estimates", "Priority segments", "Entry recommendations"],
  },
  {
    key: "customer-loyalty",
    goal: "Understand customer satisfaction",
    icon: "gauge",
    service: "market-research",
    studyName: "Customer satisfaction and loyalty tracker",
    approach: "A CSAT and NPS survey with driver analysis, followed by short interviews with promoters and detractors.",
    methods: ["CATI or online survey", "NPS and CSAT", "Driver analysis", "Follow-up interviews"],
    timeline: "3 to 6 weeks, then monthly or quarterly",
    youReceive: ["Satisfaction and NPS scores", "What drives loyalty and churn", "A tracking dashboard"],
  },
  {
    key: "product-test",
    goal: "Test a product, price or campaign",
    icon: "lightbulb",
    service: "market-research",
    studyName: "Concept, pricing and campaign test",
    approach: "Structured concept tests with target buyers, price sensitivity models and focus groups to explain the numbers.",
    methods: ["Concept testing", "Van Westendorp or conjoint", "Focus groups", "Ad recall testing"],
    timeline: "3 to 6 weeks",
    youReceive: ["Go or no-go evidence", "Optimal price range", "Improvements to make before launch"],
  },
  {
    key: "public-opinion",
    goal: "Measure public opinion",
    icon: "megaphone",
    service: "opinion-polling-social-surveys",
    studyName: "Representative opinion poll",
    approach: "A probability sample of households or phone numbers, neutral questions, and weighting to population benchmarks.",
    methods: ["Multi-stage sampling", "Face-to-face or telephone", "Weighting", "Margin of error"],
    timeline: "4 to 8 weeks",
    youReceive: ["Topline results with margins of error", "Breakdowns by province and group", "A publishable methods statement"],
  },
  {
    key: "evaluate-programme",
    goal: "Evaluate a programme",
    icon: "clipboard-check",
    service: "monitoring-evaluation",
    studyName: "Baseline and impact evaluation",
    approach: "A theory of change, measurable indicators and a baseline with a comparison group, repeated at midline and endline.",
    methods: ["Theory of change", "Household survey", "Comparison group design", "Qualitative case studies"],
    timeline: "6 to 12 weeks for a baseline; evaluations follow the programme",
    youReceive: ["Baseline values for every indicator", "Evidence of what changed and why", "Learning briefs for the next phase"],
  },
  {
    key: "feasibility",
    goal: "Assess feasibility or policy impact",
    icon: "scale",
    service: "policy-economic-research",
    studyName: "Feasibility and impact assessment",
    approach: "Economic and financial analysis combined with structured stakeholder consultation and sector data.",
    methods: ["Cost-benefit analysis", "Economic modelling", "Stakeholder consultation", "Secondary data"],
    timeline: "6 to 12 weeks",
    youReceive: ["A clear feasibility verdict", "Costs, benefits and risks", "A policy brief for decision makers"],
  },
  {
    key: "collect-data",
    goal: "Collect data for my own analysis",
    icon: "monitor-smartphone",
    service: "data-collection-field-services",
    studyName: "Managed fieldwork",
    approach: "Your instrument, translated and piloted, delivered by our trained teams with daily quality control.",
    methods: ["CAPI or CATI", "Translation and back-translation", "Back-checks", "Real-time validation"],
    timeline: "2 to 8 weeks",
    youReceive: ["A clean dataset and codebook", "Daily progress updates", "A field and quality report"],
  },
  {
    key: "analyse-data",
    goal: "Analyse data I already have",
    icon: "chart-combined",
    service: "data-analysis-reporting",
    studyName: "Analysis and reporting",
    approach: "A data review and agreed analysis plan, then cleaning, statistical analysis and a clear written report.",
    methods: ["Data cleaning", "Statistical testing", "Regression and segmentation", "Dashboards"],
    timeline: "1 to 4 weeks",
    youReceive: ["Reproducible analysis outputs", "A report or slide deck", "Documented code"],
  },
  {
    key: "thesis",
    goal: "Get support with my thesis or paper",
    icon: "graduation-cap",
    service: "academic-research-support",
    studyName: "Academic research support",
    approach: "One-to-one guidance on design, methods and analysis that strengthens your own work and understanding.",
    methods: ["Methods review", "Analysis coaching", "Interpretation", "Editing and formatting"],
    timeline: "Flexible, from one session to the whole project",
    youReceive: ["Written feedback", "Analysis you understand and can defend", "A submission-ready document"],
  },
  {
    key: "build-skills",
    goal: "Build my team's research skills",
    icon: "presentation",
    service: "research-training",
    studyName: "Training programme",
    approach: "A practical short course or in-house programme built around your data and the software your team uses.",
    methods: ["Hands-on labs", "Real datasets", "Pre and post assessment", "Follow-up support"],
    timeline: "2 to 5 days",
    youReceive: ["Course materials", "Certificates of completion", "A team that can do more itself"],
  },
];
