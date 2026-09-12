import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-8 w-40" />
      <div className="my-6 flex flex-col gap-4">
        <SkeletonBlock className="h-16 w-full" rounded="rounded-[10px]" />
        <SkeletonBlock className="h-40 w-full" rounded="rounded-[10px]" />
        <SkeletonBlock className="h-24 w-full" rounded="rounded-[10px]" />
        <SkeletonBlock className="h-14 w-full" rounded="rounded-full" />
      </div>
    </LoadingFrame>
  );
}
