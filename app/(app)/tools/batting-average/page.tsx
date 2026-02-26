import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import BattingAverageCalculator from "./_components/BattingAverageCalculator";

const definition = getCalculatorDefinition("batting-average")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function BattingAveragePage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<BattingAverageCalculator />}
    />
  );
}
