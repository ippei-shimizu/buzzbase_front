import HeaderBackTo from "@app/components/header/HeaderBackTo";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

export default function Loading() {
  return (
    <LoadingFrame
      header={<HeaderBackTo href="/dashboard" label="ホームに戻る" />}
      paddingTop="pt-[40px]"
    >
      <nav className="flex border-b border-zinc-700">
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-16" />
        </div>
      </nav>
      <div className="my-6 flex flex-col gap-2.5">
        <div className="flex justify-end">
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <SkeletonBlock className="h-[52px] w-full" rounded="rounded-[10px]" />
        <SkeletonBlock className="h-10 w-full" rounded="rounded-lg" />
        <div className="mt-2">
          <SkeletonBlock className="h-10 w-full" />
        </div>
        <div className="mt-2">
          <SkeletonList
            count={3}
            itemClassName="h-16 w-full"
            gapClassName="gap-3"
            rounded="rounded-lg"
          />
        </div>
      </div>
    </LoadingFrame>
  );
}
