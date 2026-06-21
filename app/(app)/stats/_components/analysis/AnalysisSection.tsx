import { Suspense } from "react";
import { getInitialAnalysisData } from "../../analysisActions";
import { AnalysisContainer } from "./AnalysisContainer";
import { AnalysisLoading } from "./AnalysisLoading";

/**
 * 打撃分析セクション（Server Component）。
 * 初期データをサーバーで取得して `AnalysisContainer` に渡し、取得が終わるまでは
 * セクション内のインラインローディングをストリーミング表示する。
 * これによりシェル（ヘッダ/タブ/テーブル）は即描画され、分析だけ後から差し込まれる。
 */
export function AnalysisSection() {
  return (
    <Suspense fallback={<AnalysisLoading />}>
      <AnalysisDataProvider />
    </Suspense>
  );
}

async function AnalysisDataProvider() {
  const initialData = await getInitialAnalysisData();
  return <AnalysisContainer initialData={initialData} />;
}
