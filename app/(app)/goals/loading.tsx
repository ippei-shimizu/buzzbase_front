import HeaderBackTo from "@app/components/header/HeaderBackTo";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame
      header={<HeaderBackTo href="/dashboard" label="ホームに戻る" />}
      paddingTop="pt-[74px]"
    >
      <SkeletonBlock className="h-6 w-16" />
      <div className="mt-5 flex gap-2">
        <div className="flex-1">
          <SkeletonBlock className="h-10 w-full" rounded="rounded-lg" />
        </div>
        <div className="flex-1">
          <SkeletonBlock className="h-10 w-full" rounded="rounded-lg" />
        </div>
        <div className="flex-1">
          <SkeletonBlock className="h-10 w-full" rounded="rounded-lg" />
        </div>
      </div>
      <div className="mt-4">
        <SkeletonList
          count={2}
          itemClassName="h-28 w-full"
          gapClassName="gap-3"
          rounded="rounded-[10px]"
        />
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-11 w-full" rounded="rounded-lg" />
      </div>
    </LoadingFrame>
  );
}
