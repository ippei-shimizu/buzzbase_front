import HeaderBack from "@app/components/header/HeaderBack";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

/**
 * 実ページのヘッダー（HeaderNote）は保存状態の判定に hasChanges を要するため、
 * ロード中は見た目の高さが同じ HeaderBack で代用する。
 */
export default function Loading() {
  return (
    <LoadingFrame header={<HeaderBack />} paddingTop="pt-14">
      <SkeletonBlock className="h-4 w-10" />
      <div className="mt-1">
        <SkeletonBlock className="h-8 w-28" />
      </div>
      <div className="mt-6 flex flex-col gap-5">
        <SkeletonBlock className="h-24 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-24 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-12 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-12 w-full" rounded="rounded-lg" />
      </div>
    </LoadingFrame>
  );
}
