"use client";

import type { FetchResult } from "@app/services/v2/requests";
import type { ActivityHeatmap, ShadowSwingStats } from "@app/types/activity";
import TrophyIcon from "@heroicons/react/24/outline/TrophyIcon";
import FireIcon from "@heroicons/react/24/solid/FireIcon";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { parseDecimal } from "@app/constants/practice";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  activeDayMilestoneText,
  isActiveOn,
  streakNudge,
  swingMilestoneText,
} from "../_utils/activityStreak";
import {
  EMPTY_MESSAGE,
  LOAD_ERROR,
  PAYWALL_DESCRIPTION,
  PAYWALL_RANGE_NOTICE,
  PAYWALL_TITLE,
  SECTION_TITLE,
} from "./activityCopy";
import ActivityHeatmapGrid from "./ActivityHeatmap";
import StreakBadge from "./StreakBadge";

const FEATURE = "grass_full_history" as const;

interface ActivityGrassSectionProps {
  /** Asia/Tokyo の今日。 */
  today: string;
  /** front が要求した期間の開始日。back のクランプを検出するために渡す。 */
  requestedFrom: string;
  heatmap: FetchResult<ActivityHeatmap>;
  /** 素振り累計。素振りカウンターは未実装のため、取得できなくても本体は成立する。 */
  swingStats: FetchResult<ShadowSwingStats>;
}

/**
 * 継続セクション（Streak ＋ 草グラフ）。
 *
 * 表示期間は必ずレスポンスの from / to を使う。無料プランでは back が直近30日へ
 * クランプして 200 を返すため、要求した期間で描くと 30 日より前が「記録が無い日」に
 * 見えてしまう。クランプされた事実は from の比較で分かるので、Pro 判定の確定を
 * 待たずに空グラフを避けられる。
 */
export default function ActivityGrassSection({
  today,
  requestedFrom,
  heatmap,
  swingStats,
}: ActivityGrassSectionProps) {
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();

  if (heatmap.status !== "ok") {
    return (
      <section className="rounded-[10px] bg-sub p-4">
        <h3 className="text-base font-bold text-white">{SECTION_TITLE}</h3>
        <p className="mt-3 text-sm text-zic-300">{LOAD_ERROR}</p>
      </section>
    );
  }

  const {
    from,
    to,
    data: logs,
    current_streak_days: currentStreak,
    longest_streak_days: longestStreak,
    total_active_days: totalActiveDays,
  } = heatmap.data;

  const isClamped = from > requestedFrom;
  // Pro 判定が未確定の間はペイウォールを出さない。先に無料前提で出すと、
  // 加入済みユーザーに一瞬だけ「Pro に入ろう」と見えてしまう。
  const showPaywall =
    isClamped && !isEntitlementLoading && !hasEntitlement(FEATURE);

  const nudge = streakNudge(
    currentStreak,
    longestStreak,
    isActiveOn(logs, today),
  );
  const activeDayMilestone = activeDayMilestoneText(totalActiveDays);
  const swingTotal =
    swingStats.status === "ok"
      ? parseDecimal(swingStats.data.total_count)
      : null;
  const swingMilestone = swingMilestoneText(swingTotal);

  return (
    <section className="rounded-[10px] bg-sub p-4">
      <h3 className="text-base font-bold text-white">{SECTION_TITLE}</h3>

      <div className="mt-3">
        <StreakBadge current={currentStreak} longest={longestStreak} />
      </div>

      <p className="mt-2.5 flex items-center gap-1.5 text-sm font-bold text-white">
        <FireIcon className="h-4 w-4 shrink-0 text-[#d08000]" aria-hidden />
        {nudge}
      </p>

      <div className="mt-3">
        <ActivityHeatmapGrid from={from} to={to} logs={logs} today={today} />
      </div>

      {logs.length === 0 ? (
        <p className="mt-2 text-xs text-zic-300">{EMPTY_MESSAGE}</p>
      ) : null}

      <p className="mt-2.5 text-xs text-zic-300">通算 {totalActiveDays}日</p>

      {activeDayMilestone === null ? null : (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zic-300">
          <TrophyIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {activeDayMilestone}
        </p>
      )}

      {swingMilestone === null ? null : (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-zic-300">
          <TrophyIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {swingMilestone}
        </p>
      )}

      {showPaywall ? (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs text-zic-300">{PAYWALL_RANGE_NOTICE}</p>
          <ProUpsellCard
            feature={FEATURE}
            title={PAYWALL_TITLE}
            description={PAYWALL_DESCRIPTION}
          />
        </div>
      ) : null}
    </section>
  );
}
