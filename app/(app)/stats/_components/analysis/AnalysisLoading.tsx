import SkeletonBlock from "@app/components/loading/SkeletonBlock";

/**
 * 分析セクションのストリーミング中に出すインラインローディング。
 * ルート直下の `stats/loading.tsx` の分析セクション枠と同じスケルトンにし、
 * 遷移直後のスケルトンからそのまま連続して見えるようにする。
 */
export function AnalysisLoading() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonBlock className="h-10 w-full" />
      <SkeletonBlock className="h-28 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-48 w-full" rounded="rounded-xl" />
      <SkeletonBlock className="h-64 w-full" rounded="rounded-xl" />
    </div>
  );
}
