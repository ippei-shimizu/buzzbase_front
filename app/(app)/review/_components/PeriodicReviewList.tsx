"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type { PeriodicReview } from "@app/types/periodicReview";
import { useEffect, useRef } from "react";
import MonthPaginator from "@app/components/filter/MonthPaginator";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { SampleDataLabel } from "@app/components/pro/SampleDataLabel";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { useMonthPager } from "@app/hooks/records/useMonthPager";
import { markPeriodicReviewRead } from "@app/services/v2/periodicReviewService";
import { reviewDate, unreadReviewIds } from "../_utils/periodicReviewFormat";
import PeriodicReviewCard from "./PeriodicReviewCard";
import {
  LOAD_ERROR_MESSAGE,
  NOT_GENERATED_MESSAGE,
} from "./periodicReviewCopy";
import { SAMPLE_PERIODIC_REVIEWS } from "./periodicReviewSampleData";

interface PeriodicReviewListProps {
  result: FetchResult<PeriodicReview[]>;
}

const FEATURE = "advanced_periodic_review" as const;

const LOADING_PLACEHOLDER = (
  <div className="flex flex-col gap-4" aria-busy="true">
    <p className="sr-only">読み込み中</p>
    {[0, 1].map((key) => (
      <div key={key} className="h-40 animate-pulse rounded-[10px] bg-sub" />
    ))}
  </div>
);

/**
 * 振り返りレポート一覧。
 *
 * back は entitlement を持たないユーザーにも 200 + 空配列を返すため、空配列だけでは
 * 「Pro 未加入」と「Pro だがまだ生成されていない」を区別できない。entitlement と
 * 組み合わせて次の3通りに出し分ける。
 *   判定未確定  … どちらとも決めつけずプレースホルダのみ（訴求も未生成案内も出さない）
 *   無料        … サンプル + Pro 訴求
 *   Pro         … 実データ。0 件なら「まだ生成されていない」案内（訴求は出さない）
 */
export default function PeriodicReviewList({
  result,
}: PeriodicReviewListProps) {
  const { hasEntitlement, isLoading } = useEntitlement();
  const canViewReviews = hasEntitlement(FEATURE);
  // 全期間を縦に並べると期間が増えるほど目的のレポートに辿り着けないため、
  // 野球ノート一覧と同じくレポートがある月だけを1ページずつ送る。
  const pager = useMonthPager(
    result.status === "ok" ? result.data : [],
    reviewDate,
  );
  // 既読化を送った id。再レンダリングのたびに PATCH を打ち直さないための記録で、
  // 成否は問わない（失敗しても再送しない代わりに、一覧の閲覧は一切妨げない）。
  const requestedIdsRef = useRef<Set<number>>(new Set());

  // 一覧を開いた時点で未読をまとめて既読にする（未読バッジの解消）。
  // 既読化の失敗は握りつぶす。既読が付かなくてもレポートは読めるべきで、
  // ここでエラーを投げると一覧ごと落ちてしまうため。
  useEffect(() => {
    if (isLoading || !canViewReviews || result.status !== "ok") return;

    const targets = unreadReviewIds(result.data).filter(
      (id) => !requestedIdsRef.current.has(id),
    );
    if (targets.length === 0) return;

    targets.forEach((id) => requestedIdsRef.current.add(id));
    void Promise.allSettled(targets.map((id) => markPeriodicReviewRead(id)));
  }, [result, canViewReviews, isLoading]);

  if (isLoading) return LOADING_PLACEHOLDER;

  if (!canViewReviews) {
    return (
      <div className="flex flex-col gap-y-2">
        <ProUpsellCard feature={FEATURE} />
        <SampleDataLabel />
        <div className="flex flex-col gap-4">
          {SAMPLE_PERIODIC_REVIEWS.map((review) => (
            <PeriodicReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    );
  }

  if (result.status !== "ok") {
    return (
      <p className="py-8 text-center text-sm text-zinc-400">
        {LOAD_ERROR_MESSAGE}
      </p>
    );
  }

  if (result.data.length === 0) {
    return (
      <p className="py-8 text-center text-sm leading-6 text-zinc-400">
        {NOT_GENERATED_MESSAGE}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {pager.month ? (
        <MonthPaginator
          month={pager.month}
          count={pager.items.length}
          index={pager.index}
          total={pager.months.length}
          onChange={pager.goTo}
        />
      ) : null}
      {pager.items.map((review) => (
        <PeriodicReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
