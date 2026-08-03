import type { MenuSummary, PracticeMenu } from "@app/types/practice";
import {
  buildMenuSummaryCards,
  formatLastLoggedOn,
  isWeightRepsSummary,
  summaryMonthText,
  summaryTotalLabel,
  summaryTotalText,
} from "../menuSummaryDisplay";

const buildSummary = (overrides: Partial<MenuSummary> = {}): MenuSummary => ({
  practice_menu_id: 1,
  menu_name: "素振り",
  unit: "count",
  unit_label: "本",
  total_amount: 12400,
  total_volume: null,
  this_month_amount: 800,
  this_month_volume: null,
  days_count: 40,
  last_logged_on: "2026-08-03",
  ...overrides,
});

const buildMenu = (overrides: Partial<PracticeMenu> = {}): PracticeMenu => ({
  id: 1,
  name: "素振り",
  category: "batting",
  unit: "count",
  unit_label: "本",
  default_value: null,
  is_favorite: false,
  sort_order: 0,
  ...overrides,
});

const weightRepsSummary = buildSummary({
  practice_menu_id: 2,
  menu_name: "ベンチプレス",
  unit: "weight_reps",
  unit_label: "回",
  total_amount: 620,
  total_volume: 8200,
  this_month_amount: 80,
  this_month_volume: 640,
});

describe("表示単位の出し分け", () => {
  it("通常メニューは累計を本数で出す", () => {
    const summary = buildSummary();

    expect(summaryTotalLabel(summary)).toBe("累計");
    expect(summaryTotalText(summary)).toBe("12,400本");
    expect(summaryMonthText(summary)).toBe("800本");
  });

  it("weight_reps は総挙上重量（t / kg）で出す", () => {
    expect(isWeightRepsSummary(weightRepsSummary)).toBe(true);
    expect(summaryTotalLabel(weightRepsSummary)).toBe("総挙上重量");
    expect(summaryTotalText(weightRepsSummary)).toBe("8.2t");
    expect(summaryMonthText(weightRepsSummary)).toBe("640kg");
  });

  it("unit が weight_reps でなくても重さ付きの記録があれば重量で出す", () => {
    const summary = buildSummary({
      unit: "count",
      total_volume: 1500,
      this_month_volume: 300,
    });

    expect(isWeightRepsSummary(summary)).toBe(true);
    expect(summaryTotalText(summary)).toBe("1.5t");
  });

  it("単位ラベルが無いメニューは数値だけを出す", () => {
    expect(summaryTotalText(buildSummary({ unit_label: null }))).toBe("12,400");
  });

  it("最終記録日は月/日にし、未記録は - にする", () => {
    expect(formatLastLoggedOn("2026-08-03")).toBe("8/3");
    expect(formatLastLoggedOn(null)).toBe("-");
  });
});

describe("カードの並び", () => {
  it("最終記録日が新しい順に並べる", () => {
    const cards = buildMenuSummaryCards(
      [
        buildSummary({
          practice_menu_id: 1,
          menu_name: "古い",
          last_logged_on: "2026-07-01",
        }),
        buildSummary({
          practice_menu_id: 2,
          menu_name: "新しい",
          last_logged_on: "2026-08-03",
        }),
      ],
      [],
    );

    expect(cards.map((card) => card.summary.menu_name)).toEqual([
      "新しい",
      "古い",
    ]);
  });

  it("未記録のメニューを補い、記録済みより後ろに置く", () => {
    const cards = buildMenuSummaryCards(
      [
        buildSummary({
          practice_menu_id: 1,
          menu_name: "記録あり",
          last_logged_on: "2026-01-05",
        }),
      ],
      [
        buildMenu({ id: 1, name: "記録あり" }),
        buildMenu({ id: 9, name: "未記録" }),
      ],
    );

    expect(cards.map((card) => card.summary.menu_name)).toEqual([
      "記録あり",
      "未記録",
    ]);
    expect(cards[1].summary.days_count).toBe(0);
    expect(cards[1].summary.last_logged_on).toBeNull();
  });

  it("メニューのカテゴリをカードに載せる", () => {
    const cards = buildMenuSummaryCards(
      [buildSummary({ practice_menu_id: 3 })],
      [buildMenu({ id: 3, category: "strength" })],
    );

    expect(cards[0].category).toBe("strength");
  });
});

describe("推移ページへのリンク", () => {
  it("メニューに紐付く記録はメニュー id のパスへ送る", () => {
    const [card] = buildMenuSummaryCards(
      [buildSummary({ practice_menu_id: 7 })],
      [],
    );

    expect(card.href).toBe("/practice/summary/7");
  });

  it("メニュー未紐付けの素振りは source=shadow_swing 付きのパスへ送る", () => {
    const [card] = buildMenuSummaryCards(
      [buildSummary({ practice_menu_id: null, menu_name: "素振り" })],
      [],
    );

    expect(card.isShadowSwing).toBe(true);
    expect(card.href).toBe(
      "/practice/summary/shadow_swing?source=shadow_swing",
    );
  });

  it("削除済みメニューの記録は推移を開けない", () => {
    const [card] = buildMenuSummaryCards(
      [buildSummary({ practice_menu_id: null, menu_name: "消したメニュー" })],
      [],
    );

    expect(card.isShadowSwing).toBe(false);
    expect(card.href).toBeNull();
    expect(card.summary.menu_name).toBe("消したメニュー");
  });
});
