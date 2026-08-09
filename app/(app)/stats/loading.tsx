import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
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
    </LoadingFrame>
  );
}
