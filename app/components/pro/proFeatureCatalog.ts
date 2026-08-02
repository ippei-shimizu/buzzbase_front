import type { ProFeature } from "@app/types/pro";

/**
 * その機能を現在どの媒体で提供しているか。
 * Pro は Web とアプリで共通の 1 契約なので、Web 未提供の機能を Web の LP で無条件に
 * 「Pro なら使える」と書くと実態と異なる訴求になる。表示側で「アプリ版」と注記するために持つ。
 */
export type FeatureAvailability = "web_and_app" | "app_only";

export interface FeatureComparison {
  /** 無料プランでの上限・可否。back の PlanLimits / Entitlement の実値と一致させる。 */
  free: string;
  /** Pro での上限・可否。 */
  pro: string;
  availability: FeatureAvailability;
}

/**
 * Pro 機能ごとの Free / Pro 比較値と提供媒体。
 * `Record<ProFeature, _>` にすることで、back の PRO_FEATURES から派生した ProFeature に
 * キーを増減させたとき、比較表の追従漏れがコンパイルエラーになる。
 * 機能名は PRO_PAYWALL_COPY の title を使うため、ここでは持たない。
 */
export const FEATURE_COMPARISONS: Record<ProFeature, FeatureComparison> = {
  no_ads: { free: "表示あり", pro: "非表示", availability: "app_only" },
  season_transition_graph: {
    free: "単年のみ",
    pro: "複数年比較",
    availability: "web_and_app",
  },
  grass_full_history: {
    free: "直近30日",
    pro: "全期間",
    availability: "app_only",
  },
  unlimited_practice_menus: {
    free: "3件",
    pro: "無制限",
    availability: "app_only",
  },
  unlimited_media_uploads: {
    free: "月3件",
    pro: "無制限",
    availability: "app_only",
  },
  schedule_copy_next_week: {
    free: "手動",
    pro: "1タップ",
    availability: "app_only",
  },
  unlimited_menu_sets: { free: "2件", pro: "無制限", availability: "app_only" },
  unlimited_monthly_goals: {
    free: "2件",
    pro: "無制限",
    availability: "app_only",
  },
  season_goals: { free: "✕", pro: "○", availability: "app_only" },
  tournament_goals: { free: "✕", pro: "○", availability: "app_only" },
  custom_notification_messages: {
    free: "標準文言",
    pro: "自由編集",
    availability: "app_only",
  },
  detailed_condition_log: { free: "✕", pro: "○", availability: "app_only" },
  unlimited_improvement_themes: {
    free: "2件",
    pro: "無制限",
    availability: "app_only",
  },
  correlation_insights: { free: "✕", pro: "○", availability: "app_only" },
  unlimited_reflection_templates: {
    free: "1件",
    pro: "無制限",
    availability: "app_only",
  },
  advanced_periodic_review: { free: "✕", pro: "○", availability: "app_only" },
  note_tags: { free: "✕", pro: "○", availability: "app_only" },
  multi_game_result_notes: {
    free: "1件",
    pro: "複数件",
    availability: "app_only",
  },
  multi_improvement_theme_links: {
    free: "1件",
    pro: "複数件",
    availability: "app_only",
  },
  practice_menu_trend_detail: { free: "✕", pro: "○", availability: "app_only" },
  custom_period_goals: { free: "✕", pro: "○", availability: "app_only" },
  manual_metric_goals: { free: "✕", pro: "○", availability: "app_only" },
  shadow_swing_custom_interval: {
    free: "5〜10秒",
    pro: "1〜20秒",
    availability: "app_only",
  },
  shadow_swing_vibration: { free: "✕", pro: "○", availability: "app_only" },
  shadow_swing_background: {
    free: "✕(一時停止)",
    pro: "○",
    availability: "app_only",
  },
  schedule_calendar_full_history: {
    free: "前後3ヶ月",
    pro: "全期間",
    availability: "app_only",
  },
  unlimited_groups: { free: "1件", pro: "無制限", availability: "app_only" },
  hit_direction_average: { free: "✕", pro: "○", availability: "web_and_app" },
  count_situation_average: { free: "✕", pro: "○", availability: "web_and_app" },
  pitch_type_average: { free: "✕", pro: "○", availability: "web_and_app" },
  pitcher_faceoff_average: { free: "✕", pro: "○", availability: "web_and_app" },
};

export interface FeatureGroup {
  title: string;
  keys: ProFeature[];
}

/**
 * 比較表のグループ分け。PRO_FEATURES 全 31 項目を過不足・重複なく 1 回ずつ含む
 * （網羅性は __tests__/proFeatureCatalog.test.ts で担保する）。
 * Web で提供済みの成績分析を先頭に置き、LP を開いた Web ユーザーがまず自分で使える価値を読めるようにする。
 */
export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: "成績分析",
    keys: [
      "hit_direction_average",
      "count_situation_average",
      "pitch_type_average",
      "pitcher_faceoff_average",
      "season_transition_graph",
      "practice_menu_trend_detail",
    ],
  },
  {
    title: "振り返りレポート",
    keys: ["advanced_periodic_review"],
  },
  {
    title: "練習と成績のつながり",
    keys: ["correlation_insights"],
  },
  {
    title: "野球ノート",
    keys: [
      "note_tags",
      "multi_game_result_notes",
      "unlimited_media_uploads",
      "unlimited_reflection_templates",
    ],
  },
  {
    title: "練習の記録",
    keys: ["detailed_condition_log", "multi_improvement_theme_links"],
  },
  {
    title: "予定・プラン管理",
    keys: [
      "unlimited_practice_menus",
      "unlimited_menu_sets",
      "schedule_copy_next_week",
      "schedule_calendar_full_history",
    ],
  },
  {
    title: "目標管理",
    keys: [
      "unlimited_monthly_goals",
      "season_goals",
      "tournament_goals",
      "custom_period_goals",
      "manual_metric_goals",
    ],
  },
  {
    title: "課題管理",
    keys: ["unlimited_improvement_themes"],
  },
  {
    title: "練習ツール",
    keys: [
      "shadow_swing_custom_interval",
      "shadow_swing_vibration",
      "shadow_swing_background",
    ],
  },
  {
    title: "継続",
    keys: ["grass_full_history"],
  },
  {
    title: "グループ",
    keys: ["unlimited_groups"],
  },
  {
    title: "その他",
    keys: ["custom_notification_messages", "no_ads"],
  },
];

/**
 * 料金カードと加入モーダルで先に見せる代表機能。
 * ProFeature で持つことで、機能キーが消えたときに訴求文言だけが生き残る事故を防ぐ。
 */
export const PLAN_HIGHLIGHT_FEATURES: readonly ProFeature[] = [
  "hit_direction_average",
  "count_situation_average",
  "pitch_type_average",
  "pitcher_faceoff_average",
  "season_transition_graph",
  "correlation_insights",
  "advanced_periodic_review",
  "unlimited_media_uploads",
  "no_ads",
];

/**
 * LP で 1 機能ずつ詳しく紹介する機能。
 * PRO_PAYWALL_COPY の benefits を箇条書きに使うため、benefits を持つキーだけを選ぶ。
 */
export const SHOWCASE_FEATURES: readonly ProFeature[] = [
  "hit_direction_average",
  "correlation_insights",
  "grass_full_history",
];

/** availability が app_only の機能に添えるラベル。 */
export const APP_ONLY_LABEL = "アプリ版";
