"use client";

import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";
import CalculatorForm from "../../_components/CalculatorForm";

const definition = getCalculatorDefinition("k-9")!;

export default function K9Calculator() {
  return (
    <CalculatorForm
      fields={definition.fields}
      outputs={definition.outputs}
      calculate={definition.calculate}
    />
  );
}
