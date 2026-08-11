import HeaderBack from "@app/components/header/HeaderBack";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

export default function Loading() {
  return (
    <LoadingFrame header={<HeaderBack />} paddingTop="pt-20">
      <SkeletonBlock className="h-3.5 w-32" />
      <div className="mt-3 mb-10 flex flex-col gap-4">
        <SkeletonBlock className="h-6 w-40" />
        <SkeletonBlock className="h-56 w-full" rounded="rounded-xl" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-20 w-full" rounded="rounded-xl" />
          <SkeletonBlock className="h-20 w-full" rounded="rounded-xl" />
        </div>
      </div>
    </LoadingFrame>
  );
}
