import HeaderBack from "@app/components/header/HeaderBack";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

export default function Loading() {
  return (
    <LoadingFrame header={<HeaderBack />} paddingTop="pt-[74px]">
      <SkeletonBlock className="h-6 w-40" />
      <div className="mt-2">
        <SkeletonBlock className="h-4 w-64" />
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <SkeletonBlock className="h-9 w-[152px]" />
          <SkeletonBlock className="h-8 w-16" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <SkeletonBlock className="h-8 w-8" rounded="rounded-full" />
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="h-8 w-8" rounded="rounded-full" />
        </div>
        <SkeletonBlock className="h-64 w-full" rounded="rounded-[10px]" />
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-4 w-28" />
      </div>
    </LoadingFrame>
  );
}
