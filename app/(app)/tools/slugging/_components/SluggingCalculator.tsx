"use client";

import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../../_components/CalculatorForm";
import SlgResultCard from "./SlgResultCard";

const definition = getCalculatorDefinition("slugging")!;

const nextActions = definition.relatedSlugs
  .map((slug) => {
    const related = getCalculatorDefinition(slug);
    return related
      ? { label: `${related.title}で計算する`, href: `/tools/${slug}` }
      : null;
  })
  .filter((a): a is { label: string; href: string } => a !== null);

export default function SluggingCalculator() {
  return (
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
      nextActions={nextActions}
      analyticsSourceTool={definition.slug}
      renderExtraResult={(raw) => {
        if (typeof raw !== "number" || Number.isNaN(raw)) return null;
        return <SlgResultCard slg={raw} />;
      }}
    />
  );
}
