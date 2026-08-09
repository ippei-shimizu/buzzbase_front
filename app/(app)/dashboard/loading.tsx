import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";
import SkeletonList from "@app/components/loading/SkeletonList";

/**
 * ホーム画面（練習・活動面）のスケルトン。既定表示である活動面の並びに合わせる
 * （dashboard面はクエリパラメータ次第だが、両面ともサーバーで判定するため
 * `loading.tsx` からは出し分けられない）。
 */
export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-12">
      <div className="flex border-b border-zinc-700">
        <SkeletonBlock className="h-11 flex-1" rounded="rounded-none" />
        <SkeletonBlock className="h-11 flex-1" rounded="rounded-none" />
      </div>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex gap-2">
          <SkeletonBlock className="h-[52px] flex-1" rounded="rounded-[10px]" />
          <SkeletonBlock className="h-[52px] flex-1" rounded="rounded-[10px]" />
        </div>
        <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-20 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-20 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-40 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-16 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
        <SkeletonBlock className="h-28 w-full" rounded="rounded-xl" />
        <SkeletonList
          count={3}
          itemClassName="h-16 w-full"
          rounded="rounded-xl"
        />
      </div>
    </LoadingFrame>
  );
}
