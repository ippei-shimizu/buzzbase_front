import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-8 w-20" />
      <div className="mt-6 flex flex-col gap-6">
        <SkeletonBlock className="h-20 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-16 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-40 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-14 w-full" rounded="rounded-xl" />
      </div>
    </LoadingFrame>
  );
}
