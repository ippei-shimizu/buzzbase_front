"use client";

import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../../_components/CalculatorForm";

const definition = getCalculatorDefinition("obp")!;

export default function ObpCalculator() {
  return (
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
    />
  );
}
