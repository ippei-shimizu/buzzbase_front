import type { Metadata } from "next";
import { SITE_URL } from "@app/constants/app";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import RispBattingAverageCalculator from "./_components/RispBattingAverageCalculator";

const definition = getCalculatorDefinition("risp-batting-average")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `${SITE_URL}/tools/${definition.slug}`,
  },
};

export default function RispBattingAveragePage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<RispBattingAverageCalculator />}
    />
  );
}
