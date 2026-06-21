import { Suspense } from "react";
import { getEraTrend } from "../../analysisActions";
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
  // 防御率推移は year/season/tournament のみで絞る（既定は通算）。
  const initialEraTrend = await getEraTrend({ year: "通算" });
  return <PitchingAnalysisContainer initialEraTrend={initialEraTrend} />;
}
