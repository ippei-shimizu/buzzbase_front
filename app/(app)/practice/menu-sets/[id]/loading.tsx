import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-7 w-40" />
      <div className="mt-6">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-2">
          <SkeletonList
            count={3}
            itemClassName="h-12 w-full"
            gapClassName="gap-2"
            rounded="rounded-lg"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <SkeletonBlock className="h-10 w-24" rounded="rounded-lg" />
        <SkeletonBlock className="h-10 w-24" rounded="rounded-lg" />
      </div>
    </LoadingFrame>
  );
}
