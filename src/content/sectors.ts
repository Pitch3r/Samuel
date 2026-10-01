import type { IconName } from "@/lib/icons";

export type Sector = {
  slug: string;
  title: string;
  icon: IconName;
  summary: string;
  questions: string[];
  services: string[];
};

export const sectors: Sector[] = [
  {
    slug: "consumer-goods-retail",
    title: "Consumer goods and retail",
    icon: "shopping-bag",
    summary: "Evidence on shoppers, brands, prices and channels, from Lusaka supermarkets to rural markets.",
    questions: [
      "Which products, packs and prices win with Zambian households?",
      "How visible and available are we at the point of sale?",
    ],
    services: ["market-research", "data-collection-field-services", "data-analysis-reporting"],
  },
  {
    slug: "financial-services",
    title: "Financial services, banking, insurance and mobile money",
    icon: "wallet",
    summary: "Research on trust, access, adoption and customer experience across formal and digital finance.",
    questions: [
      "What builds trust in a financial product, and what breaks it?",
      "Why do customers adopt mobile money, and why do some stop using it?",
    ],
    services: ["market-research", "data-analysis-reporting", "policy-economic-research"],
  },
  {
    slug: "telecommunications-technology",
    title: "Telecommunications and technology",
    icon: "smartphone",
    summary: "Subscriber satisfaction, network experience, churn and the adoption of digital services.",
    questions: [
      "How satisfied are subscribers, and what drives churn?",
      "Which digital services do people value enough to pay for?",
    ],
    services: ["market-research", "opinion-polling-social-surveys", "data-analysis-reporting"],
  },
  {
    slug: "agriculture-agribusiness",
    title: "Agriculture and agribusiness",
    icon: "sprout",
    summary: "Farmer surveys, value-chain analysis and evaluations of agricultural programmes and inputs.",
    questions: [
      "How do farmers adopt new inputs, reach markets and manage risk?",
      "Where is value lost along the chain, and who captures it?",
    ],
    services: ["policy-economic-research", "monitoring-evaluation", "data-collection-field-services"],
  },
  {
    slug: "health-public-health",
    title: "Health and public health",
    icon: "heart-pulse",
    summary: "KAP studies, service delivery assessments and evaluations, with ethical clearance where required.",
    questions: [
      "What do communities know and practise, and where are the gaps?",
      "How do patients experience care, and what keeps them from seeking it?",
    ],
    services: ["opinion-polling-social-surveys", "monitoring-evaluation", "data-collection-field-services"],
  },
  {
    slug: "education",
    title: "Education",
    icon: "school",
    summary: "Learning assessments, school surveys and evaluations for ministries, partners and institutions.",
    questions: [
      "What helps learners learn, and what holds them back?",
      "How do schools, teachers and families experience a reform?",
    ],
    services: ["monitoring-evaluation", "academic-research-support", "research-training"],
  },
  {
    slug: "energy-mining-infrastructure",
    title: "Energy, mining and infrastructure",
    icon: "pickaxe",
    summary: "Socio-economic baselines, community perception studies and economic impact assessments.",
    questions: [
      "What do host communities expect from a project?",
      "What are the social and economic effects of an investment?",
    ],
    services: ["policy-economic-research", "opinion-polling-social-surveys", "monitoring-evaluation"],
  },
  {
    slug: "development-ngos",
    title: "Development organisations and NGOs",
    icon: "handshake",
    summary: "Baselines, evaluations and third-party monitoring reported to donor and partner standards.",
    questions: [
      "Is the programme working, for whom, and why?",
      "Are partners delivering what they report?",
    ],
    services: ["monitoring-evaluation", "data-collection-field-services", "research-training"],
  },
  {
    slug: "government-public-sector",
    title: "Government and the public sector",
    icon: "landmark",
    summary: "Citizen surveys, policy analysis and regulatory impact assessments for ministries and agencies.",
    questions: [
      "How do citizens experience public services, and what would improve them?",
      "What will a proposed policy cost, and who will it affect?",
    ],
    services: ["policy-economic-research", "opinion-polling-social-surveys", "research-training"],
  },
  {
    slug: "media-communications",
    title: "Media and communications",
    icon: "radio",
    summary: "Audience and readership measurement, message testing and campaign evaluation.",
    questions: [
      "Who is listening, reading and watching, and when?",
      "Did our campaign reach the right people and change what they think?",
    ],
    services: ["opinion-polling-social-surveys", "market-research", "data-analysis-reporting"],
  },
];

export function getSector(slug: string) {
  return sectors.find((sector) => sector.slug === slug);
}
