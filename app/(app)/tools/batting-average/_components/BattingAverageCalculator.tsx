"use client";

import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../../_components/CalculatorForm";

const definition = getCalculatorDefinition("batting-average")!;

export default function BattingAverageCalculator() {
  return (
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
    />
  );
}
