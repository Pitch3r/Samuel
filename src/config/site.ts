/**
 * Central site configuration.
 *
 * IMPORTANT: the contact details below are the placeholders supplied in the
 * brand kit ("Every contact detail in this kit is a placeholder"). Replace them
 * with the real details before launch. Optional fields left empty are hidden
 * on the site automatically.
 */
export const site = {
  name: "Primeresearch Consultants",
  shortName: "Primeresearch",
  legalName: "Primeresearch Consultants",
  tagline: "Evidence-led insight.",
  aim: "Every decision deserves evidence.",
  promise: "Clear questions. Sound methods. Findings you can act on.",
  primeInsight: "Every dataset has a prime insight. We find it.",
  mission:
    "To gather evidence rigorously and ethically, find the insight that matters most, and present it so clearly that decision makers can act with confidence.",
  vision:
    "A Zambia, and a region, where every important decision, public or private, rests on evidence people can trust.",
  description:
    "Primeresearch Consultants: market research, opinion polling, evaluation and data analysis in Zambia. Evidence-led insight at every level of research.",
  intro:
    "Primeresearch Consultants is a Zambian research and advisory firm specialising in market research, public opinion polling, evaluation and data analysis. We support research at every level, from individual scholars to national studies, with one discipline throughout: clear questions, sound methods, and findings you can act on.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.primeresearch.co.zm").replace(/\/$/, ""),
  locale: "en_ZM",
  newsletterName: "The Prime Insight",

  contact: {
    email: "info@primeresearch.co.zm",
    phone: "+260 97 000 0000",
    phoneHref: "+260970000000",
    /** International format without "+", e.g. "260970000000". Empty hides WhatsApp links. */
    whatsapp: "",
    address: {
      street: "Plot 000, Great East Road",
      city: "Lusaka",
      country: "Zambia",
    },
    hours: "Monday to Friday, 08:00 to 17:00 (CAT)",
    responseTime: "We reply to every enquiry within one working day.",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Great+East+Road%2C+Lusaka%2C+Zambia",
  },

  /** Leave empty to hide. Use full URLs. */
  social: {
    linkedin: "",
    facebook: "",
    x: "",
  },

  legal: {
    line: "Primeresearch Consultants is registered in Zambia. Principal activity: ISIC 7320, Market research and public opinion polling.",
    isic: "ISIC 7320",
    isicLabel: "Market research and public opinion polling",
    section: "Section M: Professional, scientific and technical activities",
    /** Fill in to display in the footer and capability statement. Empty hides. */
    pacraNumber: "",
    tpin: "",
    dataProtectionRegistration: "",
  },
} as const;

export type NavItem = { label: string; href: string; description?: string };

export const mainNav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Sectors", href: "/sectors" },
  { label: "Approach", href: "/approach" },
  { label: "Insights", href: "/insights" },
  { label: "Training", href: "/training" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  company: [
    { label: "About us", href: "/about" },
    { label: "Our approach", href: "/approach" },
    { label: "Sectors", href: "/sectors" },
    { label: "Careers and field network", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Insights", href: "/insights" },
    { label: "Sample size calculator", href: "/tools/sample-size-calculator" },
    { label: "Research training", href: "/training" },
    { label: "Capability statement", href: "/capability-statement" },
    { label: "Request a proposal", href: "/start-a-project" },
  ],
  legal: [
    { label: "Privacy notice", href: "/privacy" },
    { label: "Terms of use", href: "/terms" },
  ],
} satisfies Record<string, NavItem[]>;
