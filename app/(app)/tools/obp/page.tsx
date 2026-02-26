import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import ObpCalculator from "./_components/ObpCalculator";

const definition = getCalculatorDefinition("obp")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function ObpPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<ObpCalculator />}
    />
  );
}
