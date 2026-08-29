import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-8 w-40" />
      <div className="mt-4">
        <SkeletonBlock className="h-24 w-full" rounded="rounded-lg" />
      </div>
      <div className="mt-6">
        <SkeletonList
          count={3}
          itemClassName="h-16 w-full"
          gapClassName="gap-2"
          rounded="rounded-lg"
        />
      </div>
    </LoadingFrame>
  );
}
