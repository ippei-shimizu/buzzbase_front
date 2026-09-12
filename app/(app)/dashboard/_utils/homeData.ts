import type {
  BaseballNoteV2,
  NoteFetchResult,
} from "@app/interface/baseballNoteV2";
import type { FetchResult } from "@app/services/v2/requests";
import type { ActivityHeatmap } from "@app/types/activity";
import type { Goal } from "@app/types/goal";
import type { ImprovementTheme } from "@app/types/improvementTheme";
import type { PeriodicReview } from "@app/types/periodicReview";
import type { Plan } from "@app/types/plan";
import type {
  MenuSummary,
  PracticeMenu,
  PracticeSession,
} from "@app/types/practice";
import type { ShadowSwingStats } from "@app/types/shadowSwing";
import { addDays } from "@app/(app)/practice/schedules/calendar/_utils/calendarDate";
import { GRASS_HISTORY_DAYS } from "@app/constants/activity";
import { getActivityHeatmap } from "@app/services/v2/activityService";
import { getBaseballNotes } from "@app/services/v2/baseballNoteService";
import { getGoals } from "@app/services/v2/goalService";
import { getImprovementThemes } from "@app/services/v2/improvementThemeService";
import { getPeriodicReviews } from "@app/services/v2/periodicReviewService";
import { getDayPlan } from "@app/services/v2/planService";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import { getPracticeSessions } from "@app/services/v2/practiceSessionService";
import { getMenuSummaries } from "@app/services/v2/practiceSummaryService";
import { getShadowSwingStats } from "@app/services/v2/shadowSwingService";

/**
 * セクション1つ分の取得を、他のセクションから隔離して待つ。
 *
 * 各セクションは独立した API を持ち、1つの失敗は「そのセクションだけエラー表示」で足りる。
 * 素の `Promise.all` に生の Promise を並べると1つの reject で全体が落ち、
 * 取得できていたセクションまで表示できなくなるため、例外はここで status:"error" に閉じ込める。
 *
 * @param fetcher 取得を開始する関数。同期 throw も拾えるよう Promise ではなく関数で受ける
 */
export async function isolate<T>(
  fetcher: () => Promise<FetchResult<T>>,
): Promise<FetchResult<T>> {
  try {
    return await fetcher();
  } catch {
    return { status: "error" };
  }
}

/** 「練習・活動」面の各セクションのデータ。セクションごとに取得結果を保つ。 */
export interface ActivityData {
  sessions: FetchResult<PracticeSession[]>;
  notes: NoteFetchResult<BaseballNoteV2[]>;
  menus: FetchResult<PracticeMenu[]>;
  summaries: FetchResult<MenuSummary[]>;
  themes: FetchResult<ImprovementTheme[]>;
  goals: FetchResult<Goal[]>;
  reviews: FetchResult<PeriodicReview[]>;
  todayPlans: FetchResult<Plan[]>;
  heatmap: FetchResult<ActivityHeatmap>;
  swingStats: FetchResult<ShadowSwingStats>;
  /** 草グラフで front が要求した開始日。back のクランプ検出に使う。 */
  grassFrom: string;
}

/**
 * 「練習・活動」面のデータをまとめて取得する。
 * セクション同士に依存が無いため並列で待ち、失敗はセクション内に閉じ込める。
 */
export async function loadActivityData(today: string): Promise<ActivityData> {
  // 草グラフは今日を含む 1 年ぶんを要求する。無料プランでは back が直近30日へ
  // クランプして返すため、要求した開始日も返してクランプを検出させる。
  const grassFrom = addDays(today, -(GRASS_HISTORY_DAYS - 1));

  const [
    sessions,
    notes,
    menus,
    summaries,
    themes,
    goals,
    reviews,
    todayPlans,
    heatmap,
    swingStats,
  ] = await Promise.all([
    isolate(() => getPracticeSessions()),
    isolate(() => getBaseballNotes()),
    isolate(() => getPracticeMenus()),
    isolate(() => getMenuSummaries()),
    isolate(() => getImprovementThemes({ status: "open" })),
    isolate(() => getGoals()),
    isolate(() => getPeriodicReviews()),
    isolate(() => getDayPlan(today)),
    isolate(() => getActivityHeatmap(grassFrom, today)),
    isolate(() => getShadowSwingStats()),
  ]);

  return {
    sessions,
    notes,
    menus,
    summaries,
    themes,
    goals,
    reviews,
    todayPlans,
    heatmap,
    swingStats,
    grassFrom,
  };
}
