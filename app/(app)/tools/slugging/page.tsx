import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import SluggingCalculator from "./_components/SluggingCalculator";

const definition = getCalculatorDefinition("slugging")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function SluggingPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<SluggingCalculator />}
    />
  );
}
