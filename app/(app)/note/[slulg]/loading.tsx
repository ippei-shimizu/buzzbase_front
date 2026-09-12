import HeaderBack from "@app/components/header/HeaderBack";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

/**
 * ノート詳細のスケルトン。実ページのヘッダー（`HeaderNoteDetail`）は noteId を必要とし
 * ロード中は確定していないため、見た目の高さが同じ `HeaderBack` で代用する。
 */
export default function Loading() {
  return (
    <LoadingFrame header={<HeaderBack />} paddingTop="pt-14">
      <SkeletonBlock className="h-4 w-32" />
      <div className="mt-2">
        <SkeletonBlock className="h-7 w-56" />
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-28 w-full" rounded="rounded-xl" />
      </div>
      <div className="mt-8">
        <SkeletonBlock className="h-40 w-full" rounded="rounded-xl" />
      </div>
    </LoadingFrame>
  );
}
