export type BattingStat = {
  title: string;
  equation: string;
  description: string;
  slug?: string;
};

export type PitchingStat = {
  title: string;
  equation: string;
  description: string;
  description2: string;
  description3: string;
  slug?: string;
};

export type CalculatorField = {
  name: string;
  label: string;
  placeholder?: string;
  min?: number;
  step?: number;
};

export type CalculatorOutput = {
  label: string;
  format: (value: number) => string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type CalculatorDefinition = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  description: string;
  explanation: string;
  formula: string;
  formulaExample: string;
  guide: { label: string; description: string }[];
  fields: CalculatorField[];
  outputs: CalculatorOutput[];
  calculate: (values: Record<string, number>) => number | null;
  faq: FaqItem[];
  relatedSlugs: string[];
};
