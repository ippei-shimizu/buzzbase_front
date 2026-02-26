"use client";

import { Input, Button } from "@heroui/react";
import { useState, useCallback } from "react";
import {
  CalculatorField,
  CalculatorOutput,
} from "@app/data/baseball-stats/types";

type Props = {
  fields: CalculatorField[];
  outputs: CalculatorOutput[];
  calculate: (values: Record<string, number>) => number | null;
  multipleOutputs?: {
    calculate: (
      values: Record<string, number>,
    ) => Record<string, number | null>;
    outputs: {
      key: string;
      label: string;
      format: (value: number) => string;
    }[];
  };
};

export default function CalculatorForm({
  fields,
  outputs,
  calculate,
  multipleOutputs,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [multiResults, setMultiResults] = useState<Record<
    string,
    string
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCalculate = useCallback(() => {
    setError(null);
    setResult(null);
    setMultiResults(null);

    const numericValues: Record<string, number> = {};
    for (const field of fields) {
      const val = values[field.name];
      if (val === undefined || val === "") {
        setError(`${field.label}を入力してください`);
        return;
      }
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        setError(`${field.label}には0以上の数値を入力してください`);
        return;
      }
      numericValues[field.name] = num;
    }

    if (multipleOutputs) {
      const results = multipleOutputs.calculate(numericValues);
      const formatted: Record<string, string> = {};
      let hasNull = false;
      for (const out of multipleOutputs.outputs) {
        const val = results[out.key];
        if (val === null || val === undefined) {
          hasNull = true;
          break;
        }
        formatted[out.label] = out.format(val);
      }
      if (hasNull) {
        setError("入力値が正しくありません。値を確認してください。");
        return;
      }
      setMultiResults(formatted);
    } else {
      const calculated = calculate(numericValues);
      if (calculated === null) {
        setError("入力値が正しくありません。値を確認してください。");
        return;
      }
      setResult(outputs[0].format(calculated));
    }
  }, [values, fields, outputs, calculate, multipleOutputs]);

  const handleReset = useCallback(() => {
    setValues({});
    setResult(null);
    setMultiResults(null);
    setError(null);
  }, []);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <Input
              type="number"
              label={field.label}
              placeholder={field.placeholder}
              value={values[field.name] || ""}
              onValueChange={(val) => handleChange(field.name, val)}
              min={field.min}
              step={field.step}
              variant="bordered"
              classNames={{
                label: "text-zinc-300",
                input: "text-white",
                inputWrapper: "border-zinc-600 hover:border-zinc-400",
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        <Button color="warning" className="font-bold" onPress={handleCalculate}>
          計算する
        </Button>
        <Button
          variant="bordered"
          className="border-zinc-600 text-zinc-300"
          onPress={handleReset}
        >
          リセット
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-900/30 border border-red-700 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg bg-yellow-900/20 border border-yellow-700/50 px-4 py-4">
          <p className="text-sm text-zinc-400">{outputs[0].label}</p>
          <p className="text-3xl font-bold text-yellow-500 mt-1">{result}</p>
        </div>
      )}

      {multiResults && (
        <div className="mt-4 grid gap-3">
          {Object.entries(multiResults).map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg bg-yellow-900/20 border border-yellow-700/50 px-4 py-3"
            >
              <p className="text-sm text-zinc-400">{label}</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
