import type { IconName } from "@/lib/icons";

export type Service = {
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  icon: IconName;
  summary: string;
  /** Meta description for search results, 110 to 160 characters. */
  seoDescription: string;
  lead: string;
  questions: string[];
  offerings: { title: string; detail: string }[];
  methods: string[];
  deliverables: string[];
  audiences: string[];
  sectors: string[];
  timeline: string;
  note?: { title: string; body: string };
  faqs: { question: string; answer: string }[];
};

export const services: Service[] = [
  {
    slug: "market-research",
    number: "01",
    title: "Market research",
    shortTitle: "Market research",
    icon: "trending-up",
    summary:
      "Understand markets, customers and competitors so that commercial decisions rest on evidence rather than assumption.",
    seoDescription:
      "Market research in Zambia: market sizing, segmentation, customer satisfaction and NPS, brand health, pricing and product testing.",
    lead: "Whether you are entering a new market, launching a product or defending your share, we give you a clear view of the people you sell to and the forces that shape their choices.",
    questions: [
      "How big is the opportunity, and which segments should we prioritise?",
      "Why do customers choose us, and why do they leave?",
      "Will this product, price or pack work before we commit to a launch?",
      "How is our brand really seen next to our competitors?",
    ],
    offerings: [
      {
        title: "Market sizing, segmentation and market entry",
        detail: "Estimate demand, identify the segments worth serving and test the route to market before you invest.",
      },
      {
        title: "Customer satisfaction and loyalty tracking",
        detail: "CSAT, NPS and churn measurement that shows what drives loyalty and where customers are slipping away.",
      },
      {
        title: "Brand health and advertising effectiveness",
        detail: "Track awareness, consideration and image over time, and test whether campaigns change what people think and do.",
      },
      {
        title: "Product, concept, packaging and pricing research",
        detail: "Test ideas, packs and price points with real buyers before launch, using methods such as Van Westendorp and conjoint analysis.",
      },
      {
        title: "Usage and attitude (U&A) studies",
        detail: "Understand how, when and why people use a category, and which needs are still unmet.",
      },
      {
        title: "Competitor analysis, retail audits and mystery shopping",
        detail: "See your market as customers see it: shelf presence, distribution, pricing and service quality on the ground.",
      },
    ],
    methods: [
      "Consumer surveys (CAPI, CATI, online)",
      "Focus group discussions",
      "In-depth interviews",
      "Retail audits",
      "Mystery shopping",
      "Conjoint and MaxDiff",
      "Price sensitivity models",
      "Driver analysis",
    ],
    deliverables: [
      "Market model and segment profiles",
      "Brand health and customer dashboards",
      "Tracking reports with trend analysis",
      "Clear recommendations on product, price, place and promotion",
    ],
    audiences: ["Corporates and brands", "Small and medium enterprises", "Investors", "Start-ups"],
    sectors: ["consumer-goods-retail", "financial-services", "telecommunications-technology", "agriculture-agribusiness"],
    timeline: "Most studies run for 3 to 10 weeks. Tracking programmes continue monthly or quarterly.",
    faqs: [
      {
        question: "Can you run a study for a small business with a modest budget?",
        answer:
          "Yes. We scale the method to the decision. A focused customer survey or a set of in-depth interviews can answer many questions without a large sample.",
      },
      {
        question: "Do you offer continuous tracking?",
        answer:
          "Yes. Satisfaction, brand health and NPS programmes can run monthly or quarterly, with a dashboard that updates as each wave is completed.",
      },
      {
        question: "Will we own the data?",
        answer:
          "Yes. You receive the full report and, on request, the cleaned dataset and code, subject to the confidentiality we promise respondents.",
      },
    ],
  },
  {
    slug: "opinion-polling-social-surveys",
    number: "02",
    title: "Public opinion polling and social surveys",
    shortTitle: "Opinion polling and surveys",
    icon: "megaphone",
    summary:
      "Measure what the public thinks, experiences and expects, with samples designed to represent the people they describe.",
    seoDescription:
      "Public opinion polls and social surveys in Zambia: representative samples, citizen satisfaction, household, KAP and media audience research.",
    lead: "Credible public opinion research depends on two things: a sample that truly represents the population, and questions that do not lead the answer. We take both seriously.",
    questions: [
      "What do citizens think about a policy, a service or an issue, and how strongly?",
      "How satisfied are people with public services in their district?",
      "What do households know, believe and do about a health or social issue?",
      "Which media do people use, and which do they trust?",
    ],
    offerings: [
      {
        title: "Opinion polls on political, economic and social issues",
        detail: "Representative polls that measure what people think, how strongly they hold their views, and how views differ across groups and regions.",
      },
      {
        title: "Citizen perception and public service satisfaction",
        detail: "Evidence on how citizens experience services such as health, water, roads and local government.",
      },
      {
        title: "Household, community and livelihoods surveys",
        detail: "Structured surveys on income, assets, food security, access to services and wellbeing.",
      },
      {
        title: "Knowledge, attitudes and practices (KAP) studies",
        detail: "Measure what people know, believe and do, so that behaviour change programmes are designed and targeted well.",
      },
      {
        title: "Media audience and readership research",
        detail: "Who listens, watches and reads which outlets, when, and how much they trust them.",
      },
      {
        title: "Stakeholder and employee surveys",
        detail: "Confidential surveys that give leadership an honest picture of staff, partner and stakeholder views.",
      },
    ],
    methods: [
      "Multi-stage probability sampling",
      "Stratified household samples",
      "Face-to-face interviews",
      "Telephone polling",
      "Weighting to population benchmarks",
      "Margin of error reporting",
      "Cognitive pre-testing",
    ],
    deliverables: [
      "Topline results with margins of error",
      "Weighted datasets with full documentation",
      "Breakdowns by province, gender, age and setting",
      "A methods statement ready for publication",
    ],
    audiences: ["Government ministries and agencies", "Media houses", "NGOs and development partners", "Civil society"],
    sectors: ["government-public-sector", "media-communications", "development-ngos", "health-public-health"],
    timeline: "A national poll usually takes 4 to 8 weeks from design to topline results.",
    note: {
      title: "Our polling standard",
      body: "Every poll we release states who commissioned it, when and how it was conducted, the population and sample size, the weighting applied and the margin of error. We follow the ESOMAR/WAPOR Guideline on Opinion Polls and Published Surveys.",
    },
    faqs: [
      {
        question: "How large does a national sample need to be?",
        answer:
          "It depends on the precision you need and the subgroups you want to report. Around 1,000 to 1,200 interviews gives a margin of error of about plus or minus 3 points nationally. Provincial breakdowns need larger samples. Try our sample size calculator for a first estimate.",
      },
      {
        question: "Can results be published?",
        answer:
          "Yes, with a full methods statement. We review any public release to make sure the findings are reported accurately and within the limits of the data.",
      },
    ],
  },
  {
    slug: "monitoring-evaluation",
    number: "03",
    title: "Monitoring, evaluation and development research",
    shortTitle: "Monitoring and evaluation",
    icon: "clipboard-check",
    summary: "Research for programmes that need to show what changed, for whom, and why.",
    seoDescription:
      "Monitoring and evaluation in Zambia: baseline, midline and endline surveys, impact evaluations, theories of change and third-party monitoring.",
    lead: "Donors, governments and implementing partners need evidence that stands up to scrutiny. We design and deliver monitoring and evaluation that is rigorous, practical and reported to partner standards.",
    questions: [
      "What is the starting point before our programme begins?",
      "Is the programme being delivered as planned, and reaching the right people?",
      "What changed, and how much of that change can we attribute to the programme?",
      "What should we keep, fix or scale in the next phase?",
    ],
    offerings: [
      {
        title: "Baseline, midline and endline surveys",
        detail: "Measure the starting point, track progress and assess change with comparable instruments at every round.",
      },
      {
        title: "Needs assessments and situation analyses",
        detail: "Establish the scale and nature of a problem before a programme is designed.",
      },
      {
        title: "Process, outcome and impact evaluations",
        detail: "Assess whether a programme was delivered as planned, what it achieved, and what can be attributed to it.",
      },
      {
        title: "Theories of change, results frameworks and indicators",
        detail: "Make the logic of a programme explicit and choose indicators that can actually be measured, round after round.",
      },
      {
        title: "Third-party monitoring and data quality assessments",
        detail: "Independent verification of delivery on the ground, and of the data that partners report.",
      },
      {
        title: "Reporting to donor and partner standards",
        detail: "Reports structured around the OECD DAC criteria and the templates your funders require.",
      },
    ],
    methods: [
      "Difference-in-differences",
      "Propensity score matching",
      "Randomised designs where feasible",
      "Contribution analysis",
      "Most significant change",
      "Mixed-methods evaluation",
      "Data quality assessments",
    ],
    deliverables: [
      "Inception report and evaluation matrix",
      "Baseline values for every indicator",
      "Evaluation report against the OECD DAC criteria",
      "Learning briefs and practical recommendations",
    ],
    audiences: ["Development partners and donors", "NGOs", "Government programmes", "Foundations"],
    sectors: ["development-ngos", "health-public-health", "education", "agriculture-agribusiness"],
    timeline: "Baselines take 6 to 12 weeks. Full evaluations follow the programme cycle, from months to several years.",
    faqs: [
      {
        question: "When should an evaluation be planned?",
        answer:
          "Before the programme starts. A baseline collected late, or indicators that cannot be measured again, limit what any evaluation can prove later.",
      },
      {
        question: "Can you work with our existing results framework?",
        answer:
          "Yes. We can review and strengthen an existing framework, or build one with your team from a theory of change.",
      },
    ],
  },
  {
    slug: "policy-economic-research",
    number: "04",
    title: "Policy, economic and sector research",
    shortTitle: "Policy and economic research",
    icon: "landmark",
    summary: "Evidence for government, regulators, associations and investors.",
    seoDescription:
      "Policy, economic and sector research in Zambia: feasibility studies, cost-benefit analysis, value chains and regulatory impact assessments.",
    lead: "Policy and investment decisions carry real consequences. We bring economic analysis, sector knowledge and structured consultation together to show what is likely to happen, and what it will cost.",
    questions: [
      "Is this project feasible, and do its benefits justify its costs?",
      "How will a new regulation affect businesses, households and public revenue?",
      "Where are the constraints and the opportunities in this value chain?",
      "What do stakeholders need, and where do they disagree?",
    ],
    offerings: [
      {
        title: "Policy analysis and policy briefs",
        detail: "Short, evidence-based briefs that set out the options, the trade-offs and a clear recommendation.",
      },
      {
        title: "Feasibility studies and cost-benefit analysis",
        detail: "Test whether a project is viable, and whether its benefits justify the costs.",
      },
      {
        title: "Sector, value-chain and labour-market studies",
        detail: "Map how a sector works, where value is added and lost, and where the constraints lie.",
      },
      {
        title: "Regulatory and economic impact assessments",
        detail: "Estimate how a law, regulation or investment will affect businesses, households and public finances.",
      },
      {
        title: "Stakeholder mapping and structured consultation",
        detail: "Identify who matters, gather their views systematically and record where they agree and disagree.",
      },
      {
        title: "Business plans and investment cases",
        detail: "Market evidence and financial analysis packaged for lenders, investors and boards.",
      },
    ],
    methods: [
      "Cost-benefit analysis",
      "Cost-effectiveness analysis",
      "Economic modelling",
      "Value-chain mapping",
      "Key-informant interviews",
      "Structured consultation",
      "Secondary data analysis",
    ],
    deliverables: [
      "Policy briefs for decision makers",
      "Feasibility and impact assessment reports",
      "Financial and economic models",
      "Stakeholder maps and consultation records",
    ],
    audiences: ["Government and regulators", "Industry associations", "Investors and lenders", "Development finance"],
    sectors: ["government-public-sector", "energy-mining-infrastructure", "agriculture-agribusiness", "financial-services"],
    timeline: "Most assignments take 6 to 12 weeks. Policy briefs can be turned around in 2 to 3 weeks.",
    faqs: [
      {
        question: "Do you work with official statistics?",
        answer:
          "Yes. We combine published data, such as national surveys and census results, with primary research where the official data does not answer the question.",
      },
      {
        question: "Can you facilitate stakeholder workshops?",
        answer:
          "Yes. We design and run structured consultations and workshops, and document the results so that every view is on the record.",
      },
    ],
  },
  {
    slug: "data-collection-field-services",
    number: "05",
    title: "Data collection and field services",
    shortTitle: "Data collection and fieldwork",
    icon: "monitor-smartphone",
    summary: "Our own trained field teams, managed end to end.",
    seoDescription:
      "Data collection in Zambia: CAPI, CATI, online and SMS surveys, focus groups and interviews, delivered by trained field teams with daily quality checks.",
    lead: "Good analysis cannot rescue bad data. We recruit, train and supervise our own field teams, and we check quality while fieldwork is still under way, not after it has finished.",
    questions: [
      "How do we reach a representative sample across urban and rural districts?",
      "Which mode suits our population and budget: face-to-face, telephone, online or SMS?",
      "How do we know the interviews really happened, and were done well?",
    ],
    offerings: [
      {
        title: "Questionnaire design, pre-testing and translation",
        detail: "Instruments that are clear, neutral and tested, translated into local languages and back-translated for accuracy.",
      },
      {
        title: "Sampling design and sample management",
        detail: "Probability and purposive samples designed for the question, with replacement rules agreed in advance.",
      },
      {
        title: "CAPI, CATI, online and SMS surveys",
        detail: "The right mode for your population, budget and timeline, or a deliberate mix of modes.",
      },
      {
        title: "Focus groups and in-depth interviews",
        detail: "Focus group discussions, in-depth interviews and key-informant interviews led by experienced moderators.",
      },
      {
        title: "Observation studies and mystery shopping",
        detail: "Structured observation of services, outlets and behaviour as they actually happen.",
      },
      {
        title: "Enumerator training, supervision and quality control",
        detail: "Trained teams, daily supervision, back-checks and real-time validation while data is still coming in.",
      },
    ],
    methods: [
      "CAPI on tablets",
      "CATI",
      "Web surveys",
      "SMS surveys",
      "GPS and timestamp checks",
      "Audio audits with consent",
      "Back-check interviews",
    ],
    deliverables: [
      "Translated and back-translated instruments",
      "Daily fieldwork progress and quality updates",
      "Field report with response rates and quality metrics",
      "Clean dataset with a codebook",
    ],
    audiences: ["Research institutes", "NGOs and development partners", "Corporates", "International research firms"],
    sectors: ["development-ngos", "health-public-health", "consumer-goods-retail", "government-public-sector"],
    timeline: "Fieldwork usually takes 2 to 8 weeks, depending on sample size, geography and mode.",
    faqs: [
      {
        question: "Which languages can you work in?",
        answer:
          "We translate instruments and interview in English and the local languages each study needs, including Bemba, Nyanja, Tonga and Lozi, and we back-translate to check meaning.",
      },
      {
        question: "Can we see the data while fieldwork is running?",
        answer:
          "Yes. We share progress and quality indicators throughout fieldwork, so you can see completion rates and issues as they arise.",
      },
      {
        question: "Do you subcontract fieldwork?",
        answer:
          "Our default is to manage our own trained teams end to end, which keeps quality and accountability in one place.",
      },
    ],
  },
  {
    slug: "data-analysis-reporting",
    number: "06",
    title: "Data analysis and reporting",
    shortTitle: "Data analysis and reporting",
    icon: "chart-combined",
    summary: "Turning raw data into findings that people can act on.",
    seoDescription:
      "Data analysis and reporting: data cleaning, statistics in SPSS, Stata, R and Python, qualitative analysis, dashboards and clear research reports.",
    lead: "We clean, analyse and interpret data with methods that fit the question, then present the results so that a busy reader understands them in minutes.",
    questions: [
      "What does our data actually show, and how confident can we be?",
      "Which factors drive the outcome we care about?",
      "How do we present complex results to a board, a ministry or the public?",
    ],
    offerings: [
      {
        title: "Data cleaning, coding and database management",
        detail: "Documented cleaning rules, consistent coding and datasets that others can use with confidence.",
      },
      {
        title: "Descriptive and inferential statistics",
        detail: "Regression, factor and cluster analysis, segmentation and reliability testing, chosen to fit the question.",
      },
      {
        title: "Qualitative and thematic analysis",
        detail: "Systematic coding of interviews and focus groups, so that every theme can be traced to what people actually said.",
      },
      {
        title: "Industry-standard tools",
        detail: "SPSS, Stata, R, Python, NVivo, Excel and Power BI, with scripts that make the analysis reproducible.",
      },
      {
        title: "Dashboards, data visualisation and infographics",
        detail: "Interactive dashboards and clear charts that make one point at a time.",
      },
      {
        title: "Reports, briefs and presentations",
        detail: "Research reports, executive summaries, policy briefs and slide decks written for the people who will use them.",
      },
    ],
    methods: ["SPSS", "Stata", "R", "Python", "NVivo", "Excel", "Power BI", "Regression", "Factor analysis", "Cluster analysis"],
    deliverables: [
      "An agreed analysis plan",
      "Documented code and reproducible outputs",
      "Interactive dashboards where useful",
      "Reports, executive summaries and slide decks",
    ],
    audiences: ["Organisations with existing data", "Researchers", "Programme teams", "Corporate insight teams"],
    sectors: ["financial-services", "health-public-health", "education", "development-ngos"],
    timeline: "Analysis of an existing dataset usually takes 1 to 4 weeks.",
    faqs: [
      {
        question: "Can you analyse data we collected ourselves?",
        answer:
          "Yes. We start with a data review, agree an analysis plan with you, and flag any limitations in the data before drawing conclusions.",
      },
      {
        question: "Will we get the code?",
        answer: "Yes. Syntax and scripts are documented and available on request, so the analysis can be checked and repeated.",
      },
    ],
  },
  {
    slug: "academic-research-support",
    number: "07",
    title: "Academic and institutional research support",
    shortTitle: "Academic research support",
    icon: "graduation-cap",
    summary:
      "Helping researchers at every stage, from first degree to doctorate and beyond, do their own research well.",
    seoDescription:
      "Academic research support in Zambia: research design, ethics applications, statistical analysis, interpretation and editing for theses and papers.",
    lead: "We support students, academics and research units with methods, analysis and writing, always in a way that builds your own understanding and respects your institution's rules on academic integrity.",
    questions: [
      "Is my research design strong enough to answer my question?",
      "Which statistical test fits my data, and how do I interpret the result?",
      "How do I prepare my manuscript for a peer-reviewed journal?",
    ],
    offerings: [
      {
        title: "Research design and methodology consulting",
        detail: "Sharpen your question and choose a design, sample and instruments that can answer it.",
      },
      {
        title: "Proposal development and ethics applications",
        detail: "Structure a strong proposal and prepare the documents that ethics committees expect.",
      },
      {
        title: "Statistical analysis and interpretation",
        detail: "Choose the right tests, run them correctly and understand what the results mean, for theses, dissertations and faculty projects.",
      },
      {
        title: "Manuscript preparation and journal submission",
        detail: "Shape findings into a publishable paper and respond well to journal requirements and reviewer comments.",
      },
      {
        title: "Editing, formatting and referencing",
        detail: "Language editing and formatting to your institution's guide, with APA, Harvard and other referencing styles.",
      },
      {
        title: "Methods advice for research units and think tanks",
        detail: "On-call methods support and peer review for university departments and policy institutes.",
      },
    ],
    methods: [
      "Research design",
      "Sampling",
      "Questionnaire validation",
      "SPSS, Stata and R",
      "NVivo",
      "Systematic reviews",
      "APA and Harvard referencing",
    ],
    deliverables: [
      "Written feedback on design and methods",
      "Analysis outputs with plain-language interpretation",
      "One-to-one coaching sessions",
      "Editing and formatting to your institution's guide",
    ],
    audiences: ["Undergraduate and postgraduate students", "Doctoral candidates", "Academic staff", "Research units and think tanks"],
    sectors: ["education", "health-public-health", "development-ngos"],
    timeline: "Support is flexible: a single session, or guidance across every stage of a thesis.",
    note: {
      title: "Our integrity commitment",
      body: "We teach, advise and review so that the work, and the understanding behind it, remain yours. We do not write assessed work for submission on a student's behalf, and we follow your institution's rules on academic integrity.",
    },
    faqs: [
      {
        question: "Can you help with just one chapter, such as the analysis?",
        answer:
          "Yes. Many researchers come to us for one stage only, such as methodology, analysis or final formatting.",
      },
      {
        question: "Do you work with students outside Lusaka?",
        answer: "Yes. Sessions can be held online, so we work with researchers across Zambia and beyond.",
      },
      {
        question: "Will you write my thesis for me?",
        answer:
          "No. We help you design, analyse, interpret and present your own research. That keeps your work honest and leaves you able to defend it with confidence.",
      },
    ],
  },
  {
    slug: "research-training",
    number: "08",
    title: "Research training and capacity building",
    shortTitle: "Research training",
    icon: "presentation",
    summary: "Building research skills inside organisations and universities.",
    seoDescription:
      "Research training in Zambia: practical courses in research methods, survey design, SPSS, Stata, R, NVivo, monitoring and evaluation and Power BI.",
    lead: "We train teams to design, collect, analyse and use data themselves. Every course is practical, built around real datasets and the software your team actually uses.",
    questions: [
      "How do we build an in-house team that can run its own surveys?",
      "Which software should our analysts learn, and how quickly can they be productive?",
      "How do we prepare enumerators and supervisors for a large study?",
    ],
    offerings: [
      {
        title: "Research methods, survey design and sampling",
        detail: "Short courses that cover the full research cycle, from question to sample to instrument.",
      },
      {
        title: "Software training: SPSS, Stata, R and NVivo",
        detail: "Hands-on sessions built around real datasets, so that skills transfer straight to your work.",
      },
      {
        title: "Monitoring, evaluation and data visualisation workshops",
        detail: "Practical workshops on results frameworks, indicators, dashboards and telling clear stories with data.",
      },
      {
        title: "Enumerator and field supervisor training",
        detail: "Interviewing technique, research ethics, CAPI devices and quality standards for field teams.",
      },
      {
        title: "Tailored in-house programmes",
        detail: "Courses designed around your organisation's data, systems and goals, delivered at your premises or online.",
      },
      {
        title: "Mentoring for early-career researchers",
        detail: "Structured one-to-one guidance for graduate students and junior researchers.",
      },
    ],
    methods: ["Public courses in Lusaka", "In-house delivery", "Live online", "Hands-on labs", "Real datasets", "Certificates of completion"],
    deliverables: [
      "Course materials and practice datasets",
      "Pre and post training assessment",
      "Certificates of completion",
      "Follow-up support after the course",
    ],
    audiences: ["Government statistics and M&E units", "NGO programme teams", "Universities", "Corporate analysts"],
    sectors: ["education", "government-public-sector", "development-ngos"],
    timeline: "Most courses run for 2 to 5 days. Mentoring programmes run for 3 months.",
    faqs: [
      {
        question: "Can training be delivered at our offices?",
        answer: "Yes. In-house programmes can be delivered at your premises anywhere in Zambia, or online.",
      },
      {
        question: "Do participants need their own software licences?",
        answer:
          "For SPSS, Stata and NVivo, participants need access to a licence or trial. R courses use free, open-source software.",
      },
    ],
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}
