import HeaderBackTo from "@app/components/header/HeaderBackTo";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

/**
 * 実ページのヘッダー（成功時は PracticeSessionDetail が描く HeaderDetailActions）は
 * 記録データが確定しないと出せないため、ロード中は見た目の高さが同じ
 * HeaderBackTo（失敗時のフォールバックヘッダー）で代用する。
 */
export default function Loading() {
  return (
    <LoadingFrame
      header={
        <HeaderBackTo href="/practice/records" label="練習記録一覧に戻る" />
      }
      paddingTop="pt-[74px]"
    >
      <SkeletonBlock className="h-7 w-40" />
      <div className="mt-8">
        <SkeletonBlock className="h-4 w-20" />
        <div className="mt-3">
          <SkeletonList
            count={3}
            itemClassName="h-16 w-full"
            gapClassName="gap-2"
            rounded="rounded-xl"
          />
        </div>
      </div>
      <div className="mt-8">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-3">
          <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
        </div>
      </div>
      <div className="mt-8">
        <SkeletonBlock className="h-4 w-16" />
        <div className="mt-3">
          <SkeletonList
            count={2}
            itemClassName="h-20 w-full"
            gapClassName="gap-2"
            rounded="rounded-lg"
          />
        </div>
      </div>
    </LoadingFrame>
  );
}
