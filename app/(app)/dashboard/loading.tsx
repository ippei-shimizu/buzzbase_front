import Header from "@app/components/header/Header";
import LoadingFrame from "@app/components/loading/LoadingFrame";
import SkeletonBlock from "@app/components/loading/SkeletonBlock";

/**
 * ホーム画面（練習・活動面）のスケルトン。既定表示である活動面の並びに合わせる
 * （dashboard面はクエリパラメータ次第だが、両面ともサーバーで判定するため
 * `loading.tsx` からは出し分けられない）。
 * `HomeTabBar` はテキストリンク（下線のみ）、`RecordButtonsSection` /
 * `TodayTasksSection` はカード枠なしのため、実際の見た目に合わせて他の
 * セクション（`SectionCard` 使用、`bg-sub rounded-xl`）と区別する。
 */
export default function Loading() {
  return (
    <LoadingFrame header={<Header />} paddingTop="pt-12">
      <nav className="flex border-b border-zinc-700">
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <div className="flex flex-1 justify-center py-3">
          <SkeletonBlock className="h-4 w-16" />
        </div>
      </nav>
      <div className="mt-6 flex flex-col gap-4">
        {/* RecordButtonsSection: カード枠なし。ボタン2つ + リンク1つ */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <SkeletonBlock
              className="h-[52px] flex-1"
              rounded="rounded-[10px]"
            />
            <SkeletonBlock
              className="h-[52px] flex-1"
              rounded="rounded-[10px]"
            />
          </div>
          <SkeletonBlock className="h-11 w-full" rounded="rounded-[10px]" />
        </div>

        {/* TodayTasksSection: カード枠なし。見出し + 予定リスト + 下部ボタン群 */}
        <div>
          <SkeletonBlock className="h-5 w-28" />
          <div className="mt-3 flex flex-col gap-3">
            <SkeletonBlock className="h-16 w-full" rounded="rounded-lg" />
            <SkeletonBlock className="h-16 w-full" rounded="rounded-lg" />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <SkeletonBlock className="h-11 w-full" rounded="rounded-[10px]" />
            <SkeletonBlock className="h-10 w-full" rounded="rounded-[10px]" />
          </div>
        </div>

        {/* CurrentThemeSection */}
        <SkeletonBlock className="h-28 w-full" rounded="rounded-xl" />
        {/* GoalSection */}
        <SkeletonBlock className="h-28 w-full" rounded="rounded-xl" />
        {/* ActivityGrassSection（ヒートマップを含むため高め） */}
        <SkeletonBlock className="h-40 w-full" rounded="rounded-xl" />
        {/* PeriodicReviewBanner（1行の導線バナー） */}
        <SkeletonBlock className="h-14 w-full" rounded="rounded-[10px]" />
        {/* PracticeToolsSection */}
        <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
        {/* ImprovementToolsSection */}
        <SkeletonBlock className="h-24 w-full" rounded="rounded-xl" />
        {/* MonthlySummarySection */}
        <SkeletonBlock className="h-32 w-full" rounded="rounded-xl" />
        {/* RecentPracticeSection */}
        <SkeletonBlock className="h-40 w-full" rounded="rounded-xl" />
      </div>
    </LoadingFrame>
  );
}
