import SkeletonBlock from "@app/components/loading/SkeletonBlock";

/** サマリータブの初回データ取得中に出すスケルトン。GameResultSummary の5セクションに合わせる。 */
export function GameSummarySkeleton() {
  return (
    <div className="flex flex-col gap-y-4">
      <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-20 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-48 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-32 w-full" rounded="rounded-xl" />
    </div>
  );
}
