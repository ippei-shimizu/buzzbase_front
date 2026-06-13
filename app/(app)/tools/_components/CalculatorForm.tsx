"use client";

import { Input, Button } from "@heroui/react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { buildAppStoreUrl } from "@app/constants/app";
import {
  type CalculatorField,
  type CalculatorOutput,
} from "@app/data/baseball-stats/types";
import { trackEvent } from "@app/lib/analytics";

type ResultItem = {
  label: string;
  value: string;
};

type NextAction = {
  label: string;
  href: string;
};

type Props = {
  fields: CalculatorField[];
  outputs: CalculatorOutput[];
  calculate: (
    values: Record<string, number>,
  ) => number | Record<string, number | null> | null;
  nextActions?: NextAction[];
  /**
   * 計算成功時に追加で表示する要素。出力（数値）に応じてレベル評価やシェアなど
   * ツール固有の UI を結果カード直下に描画したい場合に渡す。
   */
  renderExtraResult?: (
    rawResult: number | Record<string, number | null>,
  ) => React.ReactNode;
  /**
   * GA4 計装用のツール slug。渡すと `tool_calculate` / `app_store_click` イベントに
   * `tool` パラメータとして付与される。未指定の場合は無印で送信される（既存ツールでの破壊を避けるため optional）。
   */
  analyticsSourceTool?: string;
};

export default function CalculatorForm({
  fields,
  outputs,
  calculate,
  nextActions,
  renderExtraResult,
  analyticsSourceTool,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ResultItem[]>([]);
  const [rawResult, setRawResult] = useState<
    number | Record<string, number | null> | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCalculate = useCallback(() => {
    setError(null);
    setResults([]);
    setRawResult(null);

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

    const calculated = calculate(numericValues);
    if (calculated === null) {
      setError("入力値が正しくありません。値を確認してください。");
      return;
    }

    if (typeof calculated === "number") {
      setResults([
        { label: outputs[0].label, value: outputs[0].format(calculated) },
      ]);
    } else {
      const formatted: ResultItem[] = [];
      for (const out of outputs) {
        const key = out.key ?? out.label;
        const val = calculated[key];
        if (val === null || val === undefined) {
          setError("入力値が正しくありません。値を確認してください。");
          return;
        }
        formatted.push({ label: out.label, value: out.format(val) });
      }
      setResults(formatted);
    }
    setRawResult(calculated);
    trackEvent("tool_calculate", { tool: analyticsSourceTool ?? "unknown" });
  }, [values, fields, outputs, calculate, analyticsSourceTool]);

  const handleReset = useCallback(() => {
    setValues({});
    setResults([]);
    setRawResult(null);
    setError(null);
  }, []);

  const handleAppStoreClick = useCallback(() => {
    trackEvent("app_store_click", {
      cta_location: "tool_calculator",
      tool: analyticsSourceTool ?? "unknown",
    });
  }, [analyticsSourceTool]);

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

      {error ? (
        <div className="mt-4 rounded-lg bg-red-900/30 border border-red-700 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {results.map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-yellow-900/20 border border-yellow-700/50 px-4 py-3"
            >
              <p className="text-sm text-zinc-400">{item.label}</p>
              <p className="text-2xl font-bold text-yellow-500 mt-1">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {results.length > 0 && renderExtraResult && rawResult !== null ? (
        <div className="mt-4">{renderExtraResult(rawResult)}</div>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-4 text-center">
          <a
            href={buildAppStoreUrl("tool_calculator")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAppStoreClick}
            className="inline-block w-full rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-3 text-sm font-bold text-white"
          >
            アプリで成績を記録する（無料）
          </a>
          <p className="text-xs text-zinc-400 mt-2">
            アプリなら成績推移グラフやランキングも見られます
          </p>
        </div>
      ) : null}

      {results.length > 0 && nextActions && nextActions.length > 0 ? (
        <div className="mt-5 pt-5 border-t border-zinc-700">
          <p className="text-sm font-bold text-zinc-300 mb-3">次のステップ</p>
          <div className="space-y-2">
            {nextActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-2.5"
              >
                <span className="text-sm text-zinc-300">{action.label}</span>
                <svg
                  className="w-4 h-4 shrink-0 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
