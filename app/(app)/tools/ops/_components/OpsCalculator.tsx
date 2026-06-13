"use client";

import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../../_components/CalculatorForm";
import OpsResultCard from "./OpsResultCard";

const definition = getCalculatorDefinition("ops")!;

const nextActions = definition.relatedSlugs
  .map((slug) => {
    const related = getCalculatorDefinition(slug);
    return related
      ? { label: `${related.title}で計算する`, href: `/tools/${slug}` }
      : null;
  })
  .filter((a): a is { label: string; href: string } => a !== null);

function isOpsResult(
  raw: number | Record<string, number | null>,
): raw is Record<string, number | null> {
  return typeof raw === "object" && raw !== null;
}

export default function OpsCalculator() {
  return (
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
      nextActions={nextActions}
      renderExtraResult={(raw) => {
        if (!isOpsResult(raw)) return null;
        const ops = raw.ops;
        const obp = raw.obp;
        const slg = raw.slg;
        if (ops === null || obp === null || slg === null) return null;
        return <OpsResultCard ops={ops} obp={obp} slg={slg} />;
      }}
    />
  );
}
