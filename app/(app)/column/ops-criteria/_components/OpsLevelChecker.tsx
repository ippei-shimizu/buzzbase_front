"use client";

import { useState } from "react";
import { findOpsBenchmark } from "../_constants/benchmarks";

/**
 * 入力した OPS がカテゴリ別にどのレベルかを即時に返す判定 UI。
 * 定義だけを答える検索結果との差別化として、目安記事の表の直下に置く。
 */
export default function OpsLevelChecker() {
  const [value, setValue] = useState("");

  const parsed = value.trim() === "" ? null : Number(value);
  const benchmark = parsed === null ? null : findOpsBenchmark(parsed);

  return (
    <div className="rounded-xl border border-yellow-700/40 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 px-5 py-6">
      <p className="text-lg font-bold">あなたのOPSはどのレベル？</p>
      <p className="mt-1 text-sm text-zinc-300">
        OPS を入力すると、プロ・高校・中学それぞれの目安を表示します。
      </p>
      <label className="mt-4 block">
        <span className="text-xs text-zinc-400">OPS（例: 0.850）</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.001"
          min="0"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="0.850"
          className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-900/60 px-4 py-2.5 text-base text-white placeholder:text-zinc-600 focus:border-yellow-500 focus:outline-none"
        />
      </label>

      {parsed !== null && benchmark === null ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          0 以上の数値を入力してください
        </p>
      ) : null}

      {benchmark ? (
        <div
          role="status"
          className="mt-4 rounded-lg border border-zinc-700/70 bg-zinc-950/50 px-4 py-3"
        >
          <p className={`text-base font-bold ${benchmark.color}`}>
            {benchmark.level}
            <span className="ml-2 text-sm font-normal text-zinc-400">
              OPS {benchmark.ops}
            </span>
          </p>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-zinc-400">プロ野球</dt>
              <dd className="text-zinc-200">{benchmark.pro}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-zinc-400">高校野球</dt>
              <dd className="text-zinc-200">{benchmark.high}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-16 shrink-0 text-zinc-400">中学野球</dt>
              <dd className="text-zinc-200">{benchmark.middle}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
