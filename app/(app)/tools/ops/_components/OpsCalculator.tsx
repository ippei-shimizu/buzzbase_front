"use client";

import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../../_components/CalculatorForm";

const definition = getCalculatorDefinition("ops")!;

function calculateMultiple(
  values: Record<string, number>,
): Record<string, number | null> {
  const { hits, atBats, walks, hitByPitch, sacrificeFlies, totalBases } =
    values;
  const obpDenominator = atBats + walks + hitByPitch + sacrificeFlies;
  if (!obpDenominator || obpDenominator === 0)
    return { obp: null, slg: null, ops: null };
  if (!atBats || atBats === 0) return { obp: null, slg: null, ops: null };

  const obp = (hits + walks + hitByPitch) / obpDenominator;
  const slg = totalBases / atBats;
  const ops = obp + slg;

  return { obp, slg, ops };
}

const formatRate = (value: number) => value.toFixed(3).replace(/^0/, "");

export default function OpsCalculator() {
  return (
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
      multipleOutputs={{
        calculate: calculateMultiple,
        outputs: [
          { key: "obp", label: "出塁率", format: formatRate },
          { key: "slg", label: "長打率", format: formatRate },
          { key: "ops", label: "OPS", format: formatRate },
        ],
      }}
    />
  );
}
