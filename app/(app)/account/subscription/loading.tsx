import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-20">
      <SkeletonBlock className="h-8 w-56" />
      <div className="my-6 flex flex-col gap-4">
        <SkeletonBlock className="h-32 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-11 w-full" rounded="rounded-lg" />
      </div>
    </LoadingFrame>
  );
}
