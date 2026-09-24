export type BattingStat = {
  title: string;
  equation: string;
  descriptions: string[];
  slug?: string;
  columnUrl?: string;
};

export type PitchingStat = {
  title: string;
  equation: string;
  descriptions: string[];
  slug?: string;
  columnUrl?: string;
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

/** 計算ツールの解説直下から誘導する解説コラムへのリンク */
export type RelatedColumn = {
  label: string;
  href: `/column/${string}`;
  description: string;
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
  /**
   * 解説セクションの直下に表示する対応コラム。ツールページはサイト内で最も評価が高く、
   * 本文からリンクして解説記事へ評価を流すために置く（関連ツール欄とは別）。
   */
  relatedColumns?: RelatedColumn[];
  cta?: {
    heading: string;
    body: string;
  };
};
