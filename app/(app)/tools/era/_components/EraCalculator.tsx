"use client";

import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../../_components/CalculatorForm";

const definition = getCalculatorDefinition("era")!;

const nextActions = definition.relatedSlugs
  .map((slug) => {
    const related = getCalculatorDefinition(slug);
    return related
      ? { label: `${related.title}で計算する`, href: `/tools/${slug}` }
      : null;
  })
  .filter((a): a is { label: string; href: string } => a !== null);

export default function EraCalculator() {
  return (
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
      nextActions={nextActions}
      analyticsSourceTool={definition.slug}
    />
  );
}
