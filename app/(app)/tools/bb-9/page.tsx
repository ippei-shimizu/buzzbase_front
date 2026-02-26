import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import BB9Calculator from "./_components/BB9Calculator";

const definition = getCalculatorDefinition("bb-9")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function BB9Page() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<BB9Calculator />}
    />
  );
}
