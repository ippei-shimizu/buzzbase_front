import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-4 w-16" />
      <div className="mt-3">
        <SkeletonBlock className="h-8 w-40" />
      </div>
      <div className="mt-2">
        <SkeletonBlock className="h-4 w-full" />
      </div>
      <div className="my-6">
        <SkeletonList
          count={4}
          itemClassName="h-16 w-full"
          gapClassName="gap-3"
          rounded="rounded-lg"
        />
      </div>
    </LoadingFrame>
  );
}
