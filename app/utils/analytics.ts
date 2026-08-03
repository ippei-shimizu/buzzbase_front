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
  PRO_FEATURE_TAPPED: "pro feature tapped",
} as const;

type LoginType = "email" | "google" | "apple";

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

/** Pro 訴求（Paywall / Coming Soon）の起動。課金意向シグナルとして計測する。 */
export const trackProFeatureTapped = (feature: string) =>
  capture(ANALYTICS_EVENTS.PRO_FEATURE_TAPPED, { feature });
