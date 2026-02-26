import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import EraCalculator from "./_components/EraCalculator";

const definition = getCalculatorDefinition("era")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function EraPage() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<EraCalculator />}
    />
  );
}
