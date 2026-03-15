import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import WinningPercentageCalculator from "./_components/WinningPercentageCalculator";

const definition = getCalculatorDefinition("winning-percentage")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function WinningPercentagePage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<WinningPercentageCalculator />}
    />
  );
}
