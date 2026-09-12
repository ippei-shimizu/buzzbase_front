import SkeletonBlock from "@app/components/loading/SkeletonBlock";

/**
 * 分析セクションのスケルトン。ルート直下の `stats/loading.tsx` と
 * `AnalysisLoading`（Suspense fallback）の両方から共有し、
 * ローディング状態が切り替わる際の見た目のズレをなくす。
 */
export function AnalysisSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonBlock className="h-10 w-full" />
      <SkeletonBlock className="h-28 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-48 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-64 w-full" rounded="rounded-xl" />
    </div>
  );
}
