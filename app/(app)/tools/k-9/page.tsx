import type { Metadata } from "next";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorPageContent from "../_components/CalculatorPageContent";
import K9Calculator from "./_components/K9Calculator";

const definition = getCalculatorDefinition("k-9")!;

export const metadata: Metadata = {
  title: definition.metaTitle,
  description: definition.metaDescription,
  alternates: {
    canonical: `https://buzzbase.jp/tools/${definition.slug}`,
  },
};

export default function K9Page() {
  return (
    <CalculatorPageContent
      definition={definition}
      calculatorSlot={<K9Calculator />}
    />
  );
}
