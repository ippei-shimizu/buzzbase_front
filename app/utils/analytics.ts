import type { GoalKind, GoalPeriodType } from "@app/types/goal";
import type { PlanType, Platform, ProFeature } from "@app/types/pro";
import type { ScheduleEventType } from "@app/types/schedule";
import { capture } from "@app/utils/posthog";

/**
 * PostHog コンバージョンイベント名。
 *
 * **mobile（`buzzbase_mobile/utils/analytics.ts`）と同一の文字列で固定する。**
 * 片方だけ改名すると Web / アプリのファネルが分断され、横断分析ができなくなる。
 * 命名は object-verb（PostHog 慣例）。
 */
export const ANALYTICS_EVENTS = {
  SIGN_UP_COMPLETED: "sign up completed",
  USER_LOGGED_IN: "user logged in",
  GAME_RECORD_STEP_VIEWED: "game record step viewed",
  GAME_RECORD_COMPLETED: "game record completed",
  PLATE_APPEARANCE_COMPLETED: "plate appearance completed",
  PLATE_APPEARANCE_CANCELED: "plate appearance canceled",
  GROUP_CREATED: "group created",
  GROUP_JOINED: "group joined",
  USER_FOLLOWED: "user followed",
  PROFILE_UPDATED: "profile updated",
  STATS_FILTER_CHANGED: "stats filter changed",
  BATTING_TREND_GRANULARITY_CHANGED: "batting trend granularity changed",
  ERA_TREND_GRANULARITY_CHANGED: "era trend granularity changed",
  PRO_FEATURE_TAPPED: "pro feature tapped",
  GOAL_CREATED: "goal created",
  PRACTICE_RECORD_CREATED: "practice record created",
  NOTE_CREATED: "note created",
  THEME_CREATED: "theme created",
  PRACTICE_SCHEDULE_CREATED: "practice schedule created",
  REVIEW_COMPLETED: "review completed",
  SHADOW_SWING_COMPLETED: "shadow swing completed",
  PAYWALL_VIEWED: "paywall viewed",
  UPGRADE_STARTED: "upgrade started",
  PURCHASE_COMPLETED: "purchase completed",
  PURCHASE_FAILED: "purchase failed",
  FREE_LIMIT_REACHED: "free limit reached",
} as const;

type LoginType = "email" | "google" | "apple";

/**
 * Pro 訴求（Paywall / ロックカード / 上限到達）の起点となった機能キー。
 * `PRO_FEATURES` の正式キーに揃える。LP の CTA など特定機能に紐づかない導線は "general"。
 */
export type ProTrigger = ProFeature | "general";

/**
 * 無料枠の上限に当たった導線。PostHog の次元値になるため、typo で値が増えないよう
 * 列挙で縛る。他の無料枠へ広げるときはここへ追加する。
 */
export type FreeLimitSource =
  | "group_create"
  | "group_join_link"
  | "group_invitation";

/** 試合記録フローのステップ。1: 試合情報 / 2: 打席 / 3: 投手成績 / summary: まとめ。 */
export type GameRecordStep = 1 | 2 | 3 | "summary";

export const trackSignUpCompleted = (loginType: LoginType) =>
  capture(ANALYTICS_EVENTS.SIGN_UP_COMPLETED, { login_type: loginType });

export const trackUserLoggedIn = (loginType: LoginType) =>
  capture(ANALYTICS_EVENTS.USER_LOGGED_IN, { login_type: loginType });

export const trackGameRecordStepViewed = (step: GameRecordStep) =>
  capture(ANALYTICS_EVENTS.GAME_RECORD_STEP_VIEWED, { step });

export const trackGameRecordCompleted = (props: {
  match_type: string | null;
  appearance_type: string;
  has_pitching: boolean;
}) => capture(ANALYTICS_EVENTS.GAME_RECORD_COMPLETED, props);

export const trackGroupCreated = (groupId: number) =>
  capture(ANALYTICS_EVENTS.GROUP_CREATED, { group_id: groupId });

export const trackGroupJoined = (groupId: number) =>
  capture(ANALYTICS_EVENTS.GROUP_JOINED, { group_id: groupId });

export const trackUserFollowed = (followedUserId: number) =>
  capture(ANALYTICS_EVENTS.USER_FOLLOWED, {
    followed_user_id: followedUserId,
  });

export const trackProfileUpdated = () =>
  capture(ANALYTICS_EVENTS.PROFILE_UPDATED);

/**
 * 打席記録ウィザードの作成 / 更新完了。`is_edit` で新規・編集を区別する。
 * `has_pitcher` / `has_detail` は任意の詳細入力がどれだけ使われたかの計測用。
 */
export const trackPlateAppearanceCompleted = (props: {
  is_edit: boolean;
  has_pitcher: boolean;
  has_detail: boolean;
}) => capture(ANALYTICS_EVENTS.PLATE_APPEARANCE_COMPLETED, props);

/** 打席記録ウィザードの途中離脱（完了せずに画面を離れた）。 */
export const trackPlateAppearanceCanceled = (props: { is_edit: boolean }) =>
  capture(ANALYTICS_EVENTS.PLATE_APPEARANCE_CANCELED, props);

/** 成績画面のフィルター変更。どの絞り込みが使われるかの計測用。 */
export const trackStatsFilterChanged = (props: {
  filter_key: string;
  filter_value: string | null;
}) => capture(ANALYTICS_EVENTS.STATS_FILTER_CHANGED, props);

/** 打撃成績推移グラフの粒度切替（試合 / 月 / 年 / シーズン）。 */
export const trackBattingTrendGranularityChanged = (granularity: string) =>
  capture(ANALYTICS_EVENTS.BATTING_TREND_GRANULARITY_CHANGED, {
    granularity,
  });

/** 防御率推移グラフの粒度切替（月 / シーズン）。 */
export const trackEraTrendGranularityChanged = (granularity: string) =>
  capture(ANALYTICS_EVENTS.ERA_TREND_GRANULARITY_CHANGED, {
    granularity,
  });

/**
 * Pro 訴求（Paywall / Coming Soon）の起動。課金意向シグナルとして計測する。
 * `feature` は `PRO_FEATURES` の正式キーに揃える（略称を混ぜると集計が分裂する）。
 */
export const trackProFeatureTapped = (feature: ProTrigger) =>
  capture(ANALYTICS_EVENTS.PRO_FEATURE_TAPPED, { feature });

export const trackGoalCreated = (props: {
  period_type: GoalPeriodType;
  kind: GoalKind;
}) => capture(ANALYTICS_EVENTS.GOAL_CREATED, props);

/**
 * 練習記録（日次）の保存完了。サーバー側は日付キーの upsert のため、同じ日を
 * 編集し直すと再送される。件数を「作成された記録数」として読めるよう、既存記録の
 * 編集かどうかを `is_edit` で区別する。
 * `menu_count` は量の入力有無に関わらず選択されたメニュー数。
 */
export const trackPracticeRecordCreated = (props: {
  menu_count: number;
  has_condition: boolean;
  is_edit: boolean;
}) => capture(ANALYTICS_EVENTS.PRACTICE_RECORD_CREATED, props);

export const trackNoteCreated = (props: { has_reflection: boolean }) =>
  capture(ANALYTICS_EVENTS.NOTE_CREATED, props);

export const trackThemeCreated = () => capture(ANALYTICS_EVENTS.THEME_CREATED);

export const trackPracticeScheduleCreated = (props: {
  event_type: ScheduleEventType;
  recurring: boolean;
}) => capture(ANALYTICS_EVENTS.PRACTICE_SCHEDULE_CREATED, props);

/**
 * 振り返りテンプレに回答したノートの保存完了（`note created` と同時に発火する）。
 * 計測するのは新規作成時のみで、保存後の編集でテンプレ回答を足した場合は含まない。
 */
export const trackReviewCompleted = (props: { answer_count: number }) =>
  capture(ANALYTICS_EVENTS.REVIEW_COMPLETED, props);

export const trackShadowSwingCompleted = (props: { swing_count: number }) =>
  capture(ANALYTICS_EVENTS.SHADOW_SWING_COMPLETED, props);

/** Paywall（ProUpgradeModal / Pro 画面）の表示。課金ファネルの分母。 */
export const trackPaywallViewed = (trigger: ProTrigger) =>
  capture(ANALYTICS_EVENTS.PAYWALL_VIEWED, { trigger });

/** Paywall の購入ボタン押下。Stripe Checkout へ遷移する直前に送る。 */
export const trackUpgradeStarted = (props: {
  plan_type: PlanType | null;
  trigger: ProTrigger;
}) => capture(ANALYTICS_EVENTS.UPGRADE_STARTED, props);

/**
 * 購入完了。課金の正は Stripe / DB 側であり、このイベントは Paywall 表示からの
 * ファネルを同じ計測基盤で追うためのもの。
 */
export const trackPurchaseCompleted = (props: {
  plan_type: PlanType | null;
  platform: Platform;
  is_trial: boolean;
}) => capture(ANALYTICS_EVENTS.PURCHASE_COMPLETED, props);

/**
 * 購入失敗。`reason` の値の体系は Web と mobile で異なる（Web は Checkout 開始の
 * 失敗理由、mobile は RevenueCat のエラーコード由来）。横断集計するときは
 * PostHog の `$lib` で分けてから reason を見ること。
 */
export const trackPurchaseFailed = (props: {
  reason:
    | "unauthorized"
    | "already_subscribed"
    | "invalid_plan"
    | "stripe_api_error"
    | "unknown";
  plan_type: PlanType | null;
}) => capture(ANALYTICS_EVENTS.PURCHASE_FAILED, props);

/**
 * 無料枠の上限に阻まれた操作。DB のスナップショット集計では「いつ・何回ぶつかったか」が
 * 取れないため、課金に最も近いシグナルとしてイベントで残す。
 *
 * 同一ユーザーが上限に当たり続けると操作のたびに送られ、経路によって粒度も違う
 * （新規ノートは添付操作 1 回ごと、既存ノートの編集はファイル 1 件ごと）ため、
 * 集計はイベント数ではなくユニークユーザー数で行う。
 *
 * `source` / `detection` は現状グループ導線にのみ付与している。他の導線は両方とも
 * 送っていないため、**`detection` 未設定は「未計装」であって `client` ではない**。
 * `detection: "client"` で絞るとクライアント事前判定の大半が抜け落ちる点に注意する。
 *
 * @param feature - 上限に当たった Pro 機能の正式キー（`PRO_FEATURES`）
 * @param props.source - 上限に当たった導線
 * @param props.detection - クライアント事前判定で弾いたか、サーバーの 403 に当たったか
 */
export const trackFreeLimitReached = (
  feature: ProFeature,
  props?: { source?: FreeLimitSource; detection?: "client" | "server" },
) => capture(ANALYTICS_EVENTS.FREE_LIMIT_REACHED, { feature, ...props });
