import type { ProFeature } from "@app/types/pro";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import {
  FEATURE_COMPARISONS,
  FEATURE_GROUPS,
  PLAN_HIGHLIGHT_FEATURES,
  SHOWCASE_FEATURES,
} from "@app/components/pro/proFeatureCatalog";
import { PRO_FEATURES } from "@app/types/pro";

/**
 * back の PlanLimits / Entitlement が定める無料枠。
 * ここを back と手で突き合わせておくことで、比較表の数値が実装と食い違ったまま
 * 公開されるのを防ぐ（誤った上限の掲示は景表法上のリスクになる）。
 */
const FREE_LIMITS_FROM_BACK: Partial<Record<ProFeature, string>> = {
  // PlanLimits::PRACTICE_MENU_FREE_LIMIT = 3
  unlimited_practice_menus: "3件",
  // PlanLimits::MEDIA_UPLOAD_FREE_LIMIT_PER_MONTH = 3
  unlimited_media_uploads: "月3件",
  // PlanLimits::MENU_SET_FREE_LIMIT = 2
  unlimited_menu_sets: "2件",
  // PlanLimits::MONTHLY_GOAL_FREE_LIMIT = 2
  unlimited_monthly_goals: "2件",
  // PlanLimits::IMPROVEMENT_THEME_FREE_LIMIT = 2
  unlimited_improvement_themes: "2件",
  // PlanLimits::REFLECTION_TEMPLATE_FREE_LIMIT = 1
  unlimited_reflection_templates: "1件",
  // PlanLimits::GROUP_FREE_LIMIT = 1
  unlimited_groups: "1件",
  // FREE_FEATURES の grass_recent_30days（草機能は無料だと直近30日まで）
  grass_full_history: "直近30日",
  // Api::V2::PlansController::FREE_CALENDAR_WINDOW_MONTHS = 3
  schedule_calendar_full_history: "前後3ヶ月",
  // Entitlement の shadow_swing_custom_interval コメント（無料は5〜10秒のみ）
  shadow_swing_custom_interval: "5〜10秒",
  multi_game_result_notes: "1件",
  multi_improvement_theme_links: "1件",
};

/** Web（front）で実際に entitlement ゲートを実装済みの機能。 */
const WEB_DELIVERED_FEATURES: ProFeature[] = [
  "no_ads",
  "detailed_condition_log",
  "season_transition_graph",
  "hit_direction_average",
  "count_situation_average",
  "pitch_type_average",
  "pitcher_faceoff_average",
  "unlimited_media_uploads",
];

describe("FEATURE_COMPARISONS", () => {
  it("PRO_FEATURES の全キーを過不足なく持つ", () => {
    expect(Object.keys(FEATURE_COMPARISONS).sort()).toEqual(
      [...PRO_FEATURES].sort(),
    );
  });

  it("Free / Pro の表記が空でない", () => {
    for (const feature of PRO_FEATURES) {
      expect(FEATURE_COMPARISONS[feature].free).not.toBe("");
      expect(FEATURE_COMPARISONS[feature].pro).not.toBe("");
    }
  });

  it("無料枠の数値が back の PlanLimits と一致する", () => {
    for (const [feature, expected] of Object.entries(FREE_LIMITS_FROM_BACK)) {
      expect(FEATURE_COMPARISONS[feature as ProFeature].free).toBe(expected);
    }
  });

  it("Web で提供済みの機能だけを web_and_app として扱う", () => {
    const webFeatures = PRO_FEATURES.filter(
      (feature) => FEATURE_COMPARISONS[feature].availability === "web_and_app",
    );

    expect([...webFeatures].sort()).toEqual([...WEB_DELIVERED_FEATURES].sort());
  });

  it("ブラウザで成立しない素振りカウンターの機能を Web 提供として扱わない", () => {
    // バックグラウンド継続とバイブレーションはブラウザの制約で Web では実現できない。
    expect(FEATURE_COMPARISONS.shadow_swing_background.availability).toBe(
      "app_only",
    );
    expect(FEATURE_COMPARISONS.shadow_swing_vibration.availability).toBe(
      "app_only",
    );
  });
});

describe("FEATURE_GROUPS", () => {
  it("PRO_FEATURES の全項目を過不足・重複なく 1 回ずつ分類している", () => {
    const groupedKeys = FEATURE_GROUPS.flatMap((group) => group.keys);

    expect(groupedKeys).toHaveLength(PRO_FEATURES.length);
    expect(new Set(groupedKeys).size).toBe(PRO_FEATURES.length);
    expect(new Set(groupedKeys)).toEqual(new Set(PRO_FEATURES));
  });

  it("空のグループを持たない", () => {
    for (const group of FEATURE_GROUPS) {
      expect(group.keys.length).toBeGreaterThan(0);
    }
  });

  it("グループ名が重複しない", () => {
    const titles = FEATURE_GROUPS.map((group) => group.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("PLAN_HIGHLIGHT_FEATURES", () => {
  it("PRO_FEATURES のキーだけを重複なく持つ", () => {
    expect(new Set(PLAN_HIGHLIGHT_FEATURES).size).toBe(
      PLAN_HIGHLIGHT_FEATURES.length,
    );
    for (const feature of PLAN_HIGHLIGHT_FEATURES) {
      expect(PRO_FEATURES).toContain(feature);
    }
  });

  it("Web で使える成績分析を先頭に据えている", () => {
    // Web の LP を開いた人がまず自分で使える価値を読めるようにするための順序。
    expect(PLAN_HIGHLIGHT_FEATURES.slice(0, 5)).toEqual([
      "hit_direction_average",
      "count_situation_average",
      "pitch_type_average",
      "pitcher_faceoff_average",
      "season_transition_graph",
    ]);
  });

  it("相関インサイトと週次・月次レポートを訴求に含む", () => {
    expect(PLAN_HIGHLIGHT_FEATURES).toContain("correlation_insights");
    expect(PLAN_HIGHLIGHT_FEATURES).toContain("advanced_periodic_review");
  });
});

describe("SHOWCASE_FEATURES", () => {
  it("PRO_FEATURES のキーだけを重複なく持つ", () => {
    expect(new Set(SHOWCASE_FEATURES).size).toBe(SHOWCASE_FEATURES.length);
    for (const feature of SHOWCASE_FEATURES) {
      expect(PRO_FEATURES).toContain(feature);
    }
  });

  it("箇条書きに使う benefits を持つキーだけを選んでいる", () => {
    for (const feature of SHOWCASE_FEATURES) {
      expect(PRO_PAYWALL_COPY[feature].benefits?.length).toBeGreaterThan(0);
    }
  });
});
