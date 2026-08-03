"use client";

import type { RecordSearchValues } from "@app/utils/recordListFilter";
import type { ReactNode } from "react";
import { alignDateRange } from "@app/utils/recordListFilter";

interface RecordSearchFilterBarProps {
  values: RecordSearchValues;
  onChange: (values: RecordSearchValues) => void;
  /** クリア押下時の初期化。呼び出し側が持つ追加条件もまとめて戻せるよう委ねる。 */
  onClear: () => void;
  /** クリアボタンを出すか。追加条件を持つ画面はそれも含めて判定した結果を渡す。 */
  showClear: boolean;
  /** 検索欄の読み上げ名。同一画面に複数の検索欄が並んでも区別できるよう画面ごとに変える。 */
  searchLabel: string;
  searchPlaceholder: string;
  /** タグチップなど、画面固有の絞り込み UI を日付行の下に差し込む。 */
  children?: ReactNode;
}

/**
 * 記録系一覧の絞り込みバー（フリーワード + 開始日 / 終了日 + クリア）。
 *
 * 成績・試合一覧の FilterBar は「年・月粒度の単一選択ドロップダウン」専用で
 * フリーワードと日単位の期間を表現できないため、記録系一覧はこちらを共有する。
 */
export default function RecordSearchFilterBar({
  values,
  onChange,
  onClear,
  showClear,
  searchLabel,
  searchPlaceholder,
  children,
}: RecordSearchFilterBarProps) {
  return (
    <div className="space-y-3">
      <input
        type="search"
        aria-label={searchLabel}
        placeholder={searchPlaceholder}
        value={values.keyword}
        onChange={(event) =>
          onChange({ ...values, keyword: event.target.value })
        }
        className="w-full rounded-lg bg-sub px-3 py-2 text-sm text-white placeholder:text-zinc-500"
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label="開始日"
          value={values.startDate}
          onChange={(event) =>
            onChange(alignDateRange(values, "startDate", event.target.value))
          }
          className="rounded-lg bg-sub px-3 py-2 text-sm text-white"
        />
        <span className="text-xs text-zinc-400">〜</span>
        <input
          type="date"
          aria-label="終了日"
          value={values.endDate}
          onChange={(event) =>
            onChange(alignDateRange(values, "endDate", event.target.value))
          }
          className="rounded-lg bg-sub px-3 py-2 text-sm text-white"
        />
        {showClear ? (
          <button
            type="button"
            onClick={onClear}
            className="px-2 py-1.5 text-xs font-medium text-[#A1A1AA]"
          >
            クリア
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
