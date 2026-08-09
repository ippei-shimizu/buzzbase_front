import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";
import { AnalysisSkeleton } from "./_components/analysis/AnalysisSkeleton";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-12">
      <div className="flex border-b border-zinc-700">
        <SkeletonBlock className="h-11 flex-1" rounded="rounded-none" />
        <SkeletonBlock className="h-11 flex-1" rounded="rounded-none" />
      </div>
      <div className="mt-5">
        <AnalysisSkeleton />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <SkeletonBlock className="h-5 w-20" />
        <SkeletonBlock className="h-8 w-32" rounded="rounded-lg" />
      </div>
      <div className="mt-3">
        <SkeletonList
          count={8}
          itemClassName="h-8 w-full"
          gapClassName="gap-2"
        />
      </div>
    </LoadingFrame>
  );
}
