import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import KBBCalculator from "./_components/KBBCalculator";

const definition = getCalculatorDefinition("k-bb")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function KBBPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<KBBCalculator />}
    />
  );
}
