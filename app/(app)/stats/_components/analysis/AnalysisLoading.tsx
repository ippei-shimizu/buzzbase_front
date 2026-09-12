import { AnalysisSkeleton } from "./AnalysisSkeleton";

/**
 * 分析セクションのストリーミング中に出すインラインローディング。
 * `stats/loading.tsx` と同じ `AnalysisSkeleton` を使い、
 * 遷移直後のスケルトンからそのまま連続して見えるようにする。
 */
export function AnalysisLoading() {
  return <AnalysisSkeleton />;
}
