import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-3.5 w-40" />
      <div className="mt-4">
        <SkeletonBlock className="h-4 w-24" />
      </div>
      <div className="mt-2">
        <SkeletonBlock className="h-7 w-full" />
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
    </LoadingFrame>
  );
}
