import HeaderBack from "@app/components/header/HeaderBack";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame header={<HeaderBack />} paddingTop="pt-[74px]">
      <SkeletonBlock className="h-6 w-40" />
      <SkeletonBlock className="mt-2 h-4 w-64" />
      <SkeletonBlock className="mt-8 h-14 w-full" />
      <div className="mt-8">
        <SkeletonList
          count={5}
          itemClassName="h-14 w-full"
          rounded="rounded-[10px]"
        />
      </div>
    </LoadingFrame>
  );
}
