import HeaderBack from "@app/components/header/HeaderBack";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame header={<HeaderBack />} paddingTop="pt-[74px]">
      <SkeletonBlock className="h-6 w-40" />
      <div className="mt-2">
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-44 w-full" rounded="rounded-xl" />
      </div>
      <div className="mt-6">
        <SkeletonList
          count={4}
          itemClassName="h-36 w-full"
          gapClassName="gap-3"
          rounded="rounded-xl"
        />
      </div>
    </LoadingFrame>
  );
}
