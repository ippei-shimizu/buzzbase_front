import HeaderBack from "@app/components/header/HeaderBack";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame header={<HeaderBack />} paddingTop="pt-20">
      <SkeletonBlock className="h-8 w-56" />
      <div className="mt-4">
        <SkeletonBlock className="h-10 w-full" />
      </div>
      <div className="mt-5">
        <SkeletonBlock className="h-10 w-full" />
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-3 w-24" />
      </div>
      <div className="mt-2">
        <SkeletonList
          count={3}
          itemClassName="h-28 w-full"
          gapClassName="gap-3"
          rounded="rounded-[10px]"
        />
      </div>
    </LoadingFrame>
  );
}
