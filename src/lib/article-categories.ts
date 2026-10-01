export const articleCategories = ["Methods", "Fieldwork", "Evaluation", "Analysis", "Reporting", "Academic"] as const;

export type ArticleCategory = (typeof articleCategories)[number];
