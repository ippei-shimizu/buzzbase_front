import type { MenuSet, MenuSetItem } from "@app/types/menuSet";
import { formatMenuSetItem, menuNamesText } from "../menuSetDisplay";

function buildItem(overrides: Partial<MenuSetItem> = {}): MenuSetItem {
  return {
    practice_menu_id: 1,
    name: "素振り",
    unit_label: "本",
    target_value: 200,
    ...overrides,
  };
}

function buildMenuSet(items: MenuSetItem[]): MenuSet {
  return { id: 1, name: "オフ日ルーティン", note: null, sort_order: 0, items };
}

describe("menuNamesText", () => {
  it("メニュー名を「/」で連ねる", () => {
    expect(
      menuNamesText(
        buildMenuSet([
          buildItem({ practice_menu_id: 1, name: "素振り" }),
          buildItem({ practice_menu_id: 2, name: "ティー" }),
        ]),
      ),
    ).toBe("素振り / ティー");
  });

  it("メニューが1件なら区切り文字を付けない", () => {
    expect(menuNamesText(buildMenuSet([buildItem()]))).toBe("素振り");
  });

  it("メニューが無ければ空文字を返す", () => {
    expect(menuNamesText(buildMenuSet([]))).toBe("");
  });

  it("削除済みメニューは代替表記で埋めて件数を落とさない", () => {
    expect(
      menuNamesText(
        buildMenuSet([
          buildItem({ practice_menu_id: 1, name: null }),
          buildItem({ practice_menu_id: 2, name: "ティー" }),
        ]),
      ),
    ).toBe("メニュー / ティー");
  });
});

describe("formatMenuSetItem", () => {
  it("「素振り 200本」形式で返す", () => {
    expect(formatMenuSetItem(buildItem())).toBe("素振り 200本");
  });

  it("decimal 文字列で届いた目標量も数値として整形する", () => {
    expect(
      formatMenuSetItem(
        buildItem({ target_value: "200.0" as unknown as number }),
      ),
    ).toBe("素振り 200本");
  });

  it("目標量が未設定ならメニュー名だけを返す", () => {
    expect(formatMenuSetItem(buildItem({ target_value: null }))).toBe("素振り");
  });

  it("単位ラベルが無ければ数値だけを添える", () => {
    expect(formatMenuSetItem(buildItem({ unit_label: null }))).toBe(
      "素振り 200",
    );
  });
});
