import HeaderBackTo from "@app/components/header/HeaderBackTo";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

/**
 * 実ページのヘッダー（成功時は ScheduleDetailContent が描く HeaderDetailActions）は
 * 予定データが確定しないと出せないため、ロード中は見た目の高さが同じ
 * HeaderBackTo（失敗時のフォールバックヘッダー）で代用する。
 */
export default function Loading() {
  return (
    <LoadingFrame
      header={<HeaderBackTo href="/dashboard" label="ホームに戻る" />}
      paddingTop="pt-[74px]"
    >
      <div className="flex items-start gap-3">
        <SkeletonBlock className="mt-1 h-10 w-1" rounded="rounded-full" />
        <div className="min-w-0 flex-1">
          <SkeletonBlock className="h-6 w-48" />
          <div className="mt-2">
            <SkeletonBlock className="h-5 w-20" rounded="rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <SkeletonList
          count={3}
          itemClassName="h-10 w-full"
          gapClassName="gap-0"
          rounded="rounded-none"
        />
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-4 w-32" />
        <div className="mt-2">
          <SkeletonList
            count={2}
            itemClassName="h-12 w-full"
            gapClassName="gap-2"
            rounded="rounded-lg"
          />
        </div>
      </div>
      <div className="mt-6">
        <SkeletonBlock className="h-11 w-full" rounded="rounded-[10px]" />
      </div>
    </LoadingFrame>
  );
}
