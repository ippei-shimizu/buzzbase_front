import HeaderBackTo from "@app/components/header/HeaderBackTo";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame
      header={<HeaderBackTo href="/dashboard" label="ホームに戻る" />}
      paddingTop="pt-[46px]"
    >
      <nav className="flex border-b border-zinc-700">
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-20" />
        </div>
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-20" />
        </div>
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-20" />
        </div>
      </nav>
      <div className="my-6">
        <SkeletonBlock className="h-6 w-40" />
        <div className="mt-2">
          <SkeletonBlock className="h-4 w-full" />
        </div>
        <div className="mt-6">
          <SkeletonList
            count={3}
            itemClassName="h-14 w-full"
            gapClassName="gap-2"
            rounded="rounded-lg"
          />
        </div>
        <div className="mt-6">
          <SkeletonBlock className="h-11 w-full" rounded="rounded-lg" />
        </div>
      </div>
    </LoadingFrame>
  );
}
