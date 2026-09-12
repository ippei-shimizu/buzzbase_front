import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import { AnalysisSkeleton } from "./_components/analysis/AnalysisSkeleton";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-12">
      <div className="flex border-b border-zinc-700">
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-10" />
        </div>
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-10" />
        </div>
      </div>
      <div className="mt-5">
        <AnalysisSkeleton />
      </div>
    </LoadingFrame>
  );
}
