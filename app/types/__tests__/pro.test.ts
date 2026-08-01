import {
  DEFAULT_PRO_STATUS,
  FREE_FEATURES,
  PRO_FEATURES,
} from "@app/types/pro";

// back/app/models/concerns/entitlement.rb の定数をそのまま書き写したもの。
// back は front とは別リポジトリでテスト実行時に参照できないため、正の定義を
// スナップショットとして持ち、片側だけを書き換えると必ず落ちるようにしている。
const BACK_FREE_FEATURES = [
  "basic_game_record",
  "basic_stats",
  "group_ranking",
  "calculation_tools",
  "baseball_note_basic",
  "shadow_swing_basic",
  "practice_log_basic",
  "grass_recent_30days",
  "monthly_goal_single",
  "schedule_single",
];

const BACK_PRO_FEATURES = [
  "no_ads",
  "season_transition_graph",
  "grass_full_history",
  "unlimited_practice_menus",
  "unlimited_media_uploads",
  "schedule_copy_next_week",
  "unlimited_menu_sets",
  "unlimited_monthly_goals",
  "season_goals",
  "tournament_goals",
  "custom_notification_messages",
  "detailed_condition_log",
  "unlimited_improvement_themes",
  "correlation_insights",
  "unlimited_reflection_templates",
  "advanced_periodic_review",
  "note_tags",
  "multi_game_result_notes",
  "multi_improvement_theme_links",
  "practice_menu_trend_detail",
  "custom_period_goals",
  "manual_metric_goals",
  "shadow_swing_custom_interval",
  "shadow_swing_vibration",
  "shadow_swing_background",
  "schedule_calendar_full_history",
  "unlimited_groups",
  "hit_direction_average",
  "count_situation_average",
  "pitch_type_average",
  "pitcher_faceoff_average",
];

// back に存在しないまま front だけに残っていたキー。復活させないための回帰テスト。
const REMOVED_FEATURES = [
  "media_long_term_storage",
  "unlimited_schedules",
  "advanced_goal_tracking",
];

describe("Entitlement 定義の back との同期", () => {
  describe("FREE_FEATURES", () => {
    it("キー数が back と一致する", () => {
      expect(FREE_FEATURES).toHaveLength(BACK_FREE_FEATURES.length);
    });

    it("キー名が back と順序込みで一致する", () => {
      expect([...FREE_FEATURES]).toEqual(BACK_FREE_FEATURES);
    });
  });

  describe("PRO_FEATURES", () => {
    it("キー数が back と一致する", () => {
      expect(PRO_FEATURES).toHaveLength(BACK_PRO_FEATURES.length);
    });

    it("キー名が back と順序込みで一致する", () => {
      expect([...PRO_FEATURES]).toEqual(BACK_PRO_FEATURES);
    });

    it("back に存在しないキーを含まない", () => {
      for (const removed of REMOVED_FEATURES) {
        expect(PRO_FEATURES as readonly string[]).not.toContain(removed);
      }
    });
  });

  describe("全機能キー", () => {
    it("FREE と PRO で重複したキーを持たない", () => {
      const all = [...FREE_FEATURES, ...PRO_FEATURES] as string[];

      expect(new Set(all).size).toBe(all.length);
    });
  });

  describe("DEFAULT_PRO_STATUS", () => {
    it("entitlements が無料機能のみで構成される", () => {
      expect(DEFAULT_PRO_STATUS.entitlements).toEqual([...FREE_FEATURES]);
    });
  });
});
