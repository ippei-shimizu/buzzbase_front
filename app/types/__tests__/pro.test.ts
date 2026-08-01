import { FREE_FEATURES, PRO_FEATURES } from "@app/types/pro";

// back の ALL_FEATURES は FREE + PRO の単純連結で、FREE 側に混ざったキーは
// has_entitlement? が常に true を返すため Pro 限定機能が無料開放される。
// back は別リポジトリで front の CI からは参照できず、定義そのものの同期は
// ここでは担保できないため、front 単体で成立する不変条件のみを検証する。
// キーの過不足は Record<ProFeature, ...> 等の型で tsc が検出する。
describe("Entitlement 定義", () => {
  it("FREE と PRO で重複したキーを持たない", () => {
    const all: string[] = [...FREE_FEATURES, ...PRO_FEATURES];

    expect(new Set(all).size).toBe(all.length);
  });
});
