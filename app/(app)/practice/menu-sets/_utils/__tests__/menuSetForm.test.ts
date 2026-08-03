import type { PracticeMenu } from "@app/types/practice";
import {
  NAME_REQUIRED_ERROR,
  NAME_TOO_LONG_ERROR,
  buildMenuSetInput,
  validateMenuSetInput,
} from "../menuSetForm";

const menus: PracticeMenu[] = [
  {
    id: 5,
    name: "素振り",
    category: "batting",
    unit: "count",
    unit_label: "本",
    default_value: "200.0",
    is_favorite: false,
    sort_order: 1,
  },
  {
    id: 2,
    name: "ティー",
    category: "batting",
    unit: "count",
    unit_label: "本",
    default_value: null,
    is_favorite: false,
    sort_order: 2,
  },
];

describe("buildMenuSetInput", () => {
  it("選択したメニューだけを items に含める", () => {
    const input = buildMenuSetInput(
      { name: "朝練", note: "", menuAmounts: { 5: "200" } },
      menus,
    );

    expect(input.items).toEqual([{ practice_menu_id: 5, target_value: 200 }]);
  });

  it("items の並びはメニューの表示順に従う（ID 昇順ではない）", () => {
    const input = buildMenuSetInput(
      { name: "朝練", note: "", menuAmounts: { 2: "50", 5: "200" } },
      menus,
    );

    expect(input.items?.map((item) => item.practice_menu_id)).toEqual([5, 2]);
  });

  it("何も選ばなければ空配列を送る（省略はしない）", () => {
    const input = buildMenuSetInput(
      { name: "朝練", note: "", menuAmounts: {} },
      menus,
    );

    expect(input.items).toEqual([]);
  });

  it("目標量が空欄なら target_value は null にする", () => {
    const input = buildMenuSetInput(
      { name: "朝練", note: "", menuAmounts: { 5: "" } },
      menus,
    );

    expect(input.items).toEqual([{ practice_menu_id: 5, target_value: null }]);
  });

  it("目標量が数値にならない入力は null に倒す", () => {
    const input = buildMenuSetInput(
      { name: "朝練", note: "", menuAmounts: { 5: "たくさん" } },
      menus,
    );

    expect(input.items).toEqual([{ practice_menu_id: 5, target_value: null }]);
  });

  it("セット名とメモは前後の空白を落とす", () => {
    const input = buildMenuSetInput(
      { name: "  朝練  ", note: "  軽め  ", menuAmounts: {} },
      menus,
    );

    expect(input.name).toBe("朝練");
    expect(input.note).toBe("軽め");
  });

  it("メモが空白だけなら null にする", () => {
    const input = buildMenuSetInput(
      { name: "朝練", note: "   ", menuAmounts: {} },
      menus,
    );

    expect(input.note).toBeNull();
  });

  it("選択肢に無いメニュー ID は送らない", () => {
    const input = buildMenuSetInput(
      { name: "朝練", note: "", menuAmounts: { 999: "10" } },
      menus,
    );

    expect(input.items).toEqual([]);
  });
});

describe("validateMenuSetInput", () => {
  it("セット名が空ならエラーを返す", () => {
    expect(validateMenuSetInput({ name: "", note: null, items: [] })).toContain(
      NAME_REQUIRED_ERROR,
    );
  });

  it("セット名が 50 文字ちょうどなら通す", () => {
    expect(
      validateMenuSetInput({ name: "あ".repeat(50), note: null, items: [] }),
    ).toEqual([]);
  });

  it("セット名が 51 文字ならエラーを返す", () => {
    expect(
      validateMenuSetInput({ name: "あ".repeat(51), note: null, items: [] }),
    ).toContain(NAME_TOO_LONG_ERROR);
  });

  it("メニューが空でもエラーにしない（back が空セットを許容する）", () => {
    expect(
      validateMenuSetInput({ name: "朝練", note: null, items: [] }),
    ).toEqual([]);
  });
});
