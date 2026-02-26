import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import WhipCalculator from "./_components/WhipCalculator";

const definition = getCalculatorDefinition("whip")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function WhipPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<WhipCalculator />}
    />
  );
}
