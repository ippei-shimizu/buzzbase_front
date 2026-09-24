import type { Metadata } from "next";
import { SITE_URL } from "@app/constants/app";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import OpponentBattingAverageCalculator from "./_components/OpponentBattingAverageCalculator";

const definition = getCalculatorDefinition("opponent-batting-average")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `${SITE_URL}/tools/${definition.slug}`,
  },
};

export default function OpponentBattingAveragePage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<OpponentBattingAverageCalculator />}
    />
  );
}
