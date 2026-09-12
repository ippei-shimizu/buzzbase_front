import HeaderBackTo from "@app/components/header/HeaderBackTo";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";
import { NOTE_LIST_PATH } from "@app/constants/note";

export default function Loading() {
  return (
    <LoadingFrame
      header={<HeaderBackTo href={NOTE_LIST_PATH} label="野球ノートに戻る" />}
      paddingTop="pt-[74px]"
    >
      <SkeletonBlock className="h-6 w-32" />
      <div className="mt-4">
        <SkeletonList
          count={3}
          itemClassName="h-20 w-full"
          gapClassName="gap-3"
          rounded="rounded-lg"
        />
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-11 w-full" rounded="rounded-lg" />
      </div>
    </LoadingFrame>
  );
}
