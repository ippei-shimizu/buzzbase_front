export type BattingStat = {
  title: string;
  equation: string;
  descriptions: string[];
  slug?: string;
};

export type PitchingStat = {
  title: string;
  equation: string;
  descriptions: string[];
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
  key?: string;
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
  calculate: (
    values: Record<string, number>,
  ) => number | Record<string, number | null> | null;
  faq: FaqItem[];
  relatedSlugs: string[];
};
