"use client";

import type { MenuTrend } from "@app/types/practice";
import { useState } from "react";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { SampleDataLabel } from "@app/components/pro/SampleDataLabel";
import {
  TREND_DEFAULT_RANGE_INDEX,
  TREND_PERIOD_TABS,
  TREND_RANGE_OPTIONS,
  type TrendPeriod,
  bucketValueText,
  bucketsForPeriod,
  isDayLimitReached,
  periodLabel,
  sliceByRange,
} from "../_utils/menuTrendRange";
import MenuTrendChart from "./MenuTrendChart";
import {
  TREND_DAY_LIMIT_NOTICE,
  TREND_EMPTY,
  TREND_EMPTY_HINT,
  TREND_LOAD_ERROR,
  TREND_PAGE_TITLE,
  TREND_PRO_ONLY_NOTE,
} from "./menuTrendCopy";

/**
 * サーバーで決めた表示内容。
 * 記録 0 件（trend だがバケットが空）と取得失敗（error）は別物として扱う。
 * sample は Pro 限定機能のため実データを取得していない状態を表す。
 */
export type MenuTrendView =
  | { kind: "trend"; trend: MenuTrend }
  | { kind: "sample"; trend: MenuTrend }
  | { kind: "error" };

const FEATURE = "practice_menu_trend_detail" as const;

const INITIAL_PERIOD: TrendPeriod = "month";

/**
 * 推移グラフの Container。粒度タブとレンジ切替の状態を持ち、描画は子へ委ねる。
 * データ取得はサーバー側で完了しているため、ここでは API を叩かない
 * （無料ユーザーには Pro 限定 API を一度も叩かせない）。
 */
export default function MenuTrendContent({ view }: { view: MenuTrendView }) {
  const [period, setPeriod] = useState<TrendPeriod>(INITIAL_PERIOD);
  const [rangeIndex, setRangeIndex] = useState(
    TREND_DEFAULT_RANGE_INDEX[INITIAL_PERIOD],
  );

  if (view.kind === "error") {
    return (
      <>
        <h2 className="text-2xl font-bold">{TREND_PAGE_TITLE}</h2>
        <p className="py-8 text-center text-sm text-zinc-400">
          {TREND_LOAD_ERROR}
        </p>
      </>
    );
  }

  const { trend } = view;
  const isSample = view.kind === "sample";
  const rangeOptions = TREND_RANGE_OPTIONS[period];
  const rangeOption = rangeOptions[rangeIndex] ?? rangeOptions[0];
  const buckets = bucketsForPeriod(trend, period);
  const rangedBuckets = sliceByRange(buckets, rangeOption.limit);

  // 粒度ごとに選択肢が違うため、切り替えたらレンジも既定へ戻す。
  const handlePeriodChange = (next: TrendPeriod) => {
    setPeriod(next);
    setRangeIndex(TREND_DEFAULT_RANGE_INDEX[next]);
  };

  return (
    <>
      <h2 className="text-2xl font-bold">{trend.menu.name}</h2>
      <p className="mt-2 text-sm text-zinc-300">
        {isSample ? TREND_PRO_ONLY_NOTE : TREND_PAGE_TITLE}
      </p>

      {isSample ? (
        <div className="mt-4">
          <ProUpsellCard feature={FEATURE} />
        </div>
      ) : null}

      <div
        role="group"
        aria-label="集計の粒度"
        className="mt-5 flex rounded-md bg-[#27272A] p-0.5"
      >
        {TREND_PERIOD_TABS.map((tab) => {
          const isActive = tab.key === period;
          return (
            <button
              key={tab.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => handlePeriodChange(tab.key)}
              className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold ${
                isActive ? "bg-[#52525B] text-[#F4F4F4]" : "text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {buckets.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-zinc-400">{TREND_EMPTY}</p>
          <p className="mt-1 text-xs text-zinc-500">{TREND_EMPTY_HINT}</p>
        </div>
      ) : (
        <>
          <div
            role="group"
            aria-label="表示レンジ"
            className="mt-3 flex flex-wrap gap-2"
          >
            {rangeOptions.map((option, index) => {
              const isActive = index === rangeIndex;
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setRangeIndex(index)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    isActive
                      ? "border-[#d08000] bg-[#d08000] text-main"
                      : "border-zinc-600 bg-sub text-zinc-400"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {isSample ? <SampleDataLabel className="mt-3" /> : null}

          <div
            className={
              isSample
                ? "mt-2 rounded-[14px] border border-dashed border-zinc-600 p-3"
                : "mt-3"
            }
          >
            <div className="rounded-xl bg-sub p-4">
              <MenuTrendChart
                trend={trend}
                period={period}
                buckets={rangedBuckets}
              />
            </div>

            {isDayLimitReached(period, buckets) ? (
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                {TREND_DAY_LIMIT_NOTICE}
              </p>
            ) : null}

            <ul className="mt-3 rounded-xl bg-sub px-3.5">
              {rangedBuckets.map((bucket) => (
                <li
                  key={bucket.period}
                  className="flex items-center justify-between border-b border-main py-3 last:border-b-0"
                >
                  <span className="text-sm font-semibold text-white">
                    {periodLabel(period, bucket.period)}
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-[#d08000]">
                      {bucketValueText(trend, bucket)}
                    </span>
                    {/* 日別は 1 バケット = 1 日で記録日数が自明なため出さない。 */}
                    {period === "day" ? null : (
                      <span className="text-xs text-zinc-400">
                        {bucket.days_count}日
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
