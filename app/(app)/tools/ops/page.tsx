import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import OpsCalculator from "./_components/OpsCalculator";

const definition = getCalculatorDefinition("ops")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function OpsPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<OpsCalculator />}
    />
  );
}
