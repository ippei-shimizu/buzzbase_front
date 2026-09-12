import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-8 w-32" />
      <div className="mt-6 flex flex-col gap-5">
        <SkeletonBlock className="h-12 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-12 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-12 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-24 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-11 w-full" rounded="rounded-lg" />
      </div>
    </LoadingFrame>
  );
}
