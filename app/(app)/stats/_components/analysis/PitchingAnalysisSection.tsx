import { Suspense } from "react";
import { getCachedProStatus } from "@app/(app)/pro/proStatus";
import { getEraTrend } from "../../analysisActions";
import {
  SEASON_TREND_FEATURES,
  grantedProFeatures,
} from "../../analysisProFeatures";
import { getStatsFilterOptions } from "../../filterOptions";
import { AnalysisLoading } from "./AnalysisLoading";
import { PitchingAnalysisContainer } from "./PitchingAnalysisContainer";

/**
 * 投手分析セクション（Server Component）。
 * 防御率推移の初期データをサーバーで取得して `PitchingAnalysisContainer` に渡し、
 * 取得が終わるまではセクション内のインラインローディングをストリーミング表示する。
 */
export function PitchingAnalysisSection() {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <PitchingAnalysisDataProvider />
    </Suspense>
  );
}

async function PitchingAnalysisDataProvider() {
  // /stats は認証チェックで既に dynamic なので、Pro 判定もサーバーで解決できる。
  const proStatusPromise = getCachedProStatus();
  // 防御率推移は year/season/tournament のみで絞る（既定は通算・月粒度）。
  const [initialEraTrend, filterOptions, proFeatures] = await Promise.all([
    getEraTrend({ year: "通算" }),
    getStatsFilterOptions(),
    // シーズン粒度を選ばせてよいかをサーバーで確定させ、クライアント判定の
    // 待ち時間に Pro ユーザーが Paywall へ倒れるのを防ぐ。
    proStatusPromise.then((proStatus) =>
      grantedProFeatures(proStatus, SEASON_TREND_FEATURES),
    ),
  ]);

  return (
    <PitchingAnalysisContainer
      // 既定の月粒度は Pro 限定ではないため、ここに pro_required は来ない。
      initialEraTrend={
        initialEraTrend.status === "ok" ? initialEraTrend.data.points : []
      }
      initialProFeatures={proFeatures}
      seasonOptions={filterOptions.seasonOptions}
      tournamentOptions={filterOptions.tournamentOptions}
    />
  );
}
