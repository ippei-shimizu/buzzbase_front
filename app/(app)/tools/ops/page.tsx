import type { Metadata } from "next";
import Link from "next/link";
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
    <>
      <CalculatorPageContent
        definition={definition}
        calculatorSlot={<OpsCalculator />}
      />
      <div className="mt-6 mb-4">
        <Link
          href="/column/ops"
          className="inline-flex items-center gap-1 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          OPSとは？意味・計算方法・目安を詳しく解説 &rarr;
        </Link>
      </div>
    </>
  );
}
