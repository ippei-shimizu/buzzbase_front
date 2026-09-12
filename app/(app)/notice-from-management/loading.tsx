import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-8 w-56" />
      <div className="mt-4">
        <SkeletonList
          count={6}
          itemClassName="h-14 w-full"
          gapClassName="gap-2"
          rounded="rounded-lg"
        />
      </div>
    </LoadingFrame>
  );
}
