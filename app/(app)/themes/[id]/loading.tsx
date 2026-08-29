import HeaderBackTo from "@app/components/header/HeaderBackTo";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

/**
 * 実ページのヘッダー（成功時は ThemeDetailContent が描く HeaderDetailActions）は
 * 課題データが確定しないと出せないため、ロード中は見た目の高さが同じ
 * HeaderBackTo（失敗時のフォールバックヘッダー）で代用する。
 */
export default function Loading() {
  return (
    <LoadingFrame
      header={<HeaderBackTo href="/themes" label="課題一覧に戻る" />}
      paddingTop="pt-[74px]"
    >
      <SkeletonBlock className="h-7 w-48" />
      <div className="mt-2">
        <SkeletonBlock className="h-4 w-40" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <SkeletonBlock className="h-16 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-16 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-16 w-full" rounded="rounded-xl" />
      </div>
      <div className="mt-8">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-2">
          <SkeletonList
            count={2}
            itemClassName="h-12 w-full"
            gapClassName="gap-2"
            rounded="rounded-lg"
          />
        </div>
      </div>
      <div className="mt-8">
        <SkeletonBlock className="h-4 w-24" />
        <div className="mt-2">
          <SkeletonList
            count={2}
            itemClassName="h-12 w-full"
            gapClassName="gap-2"
            rounded="rounded-lg"
          />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-3">
        <SkeletonBlock className="h-11 w-full" rounded="rounded-lg" />
        <SkeletonBlock className="h-11 w-full" rounded="rounded-lg" />
      </div>
    </LoadingFrame>
  );
}
