import {
  buildGameResultIdsPayload,
  buildGameResultIdsUpdate,
  buildImprovementThemeIdsPayload,
  buildImprovementThemeIdsUpdate,
  canLinkMore,
} from "../noteLinks";

describe("複数紐付けの可否（グランドファザリング）", () => {
  it("1件までは無料でも紐付けられる", () => {
    expect(
      canLinkMore({ nextCount: 1, initialCount: 0, hasMultiLink: false }),
    ).toBe(true);
  });

  it("無料は既存が無い状態から2件目を増やせない", () => {
    expect(
      canLinkMore({ nextCount: 2, initialCount: 0, hasMultiLink: false }),
    ).toBe(false);
  });

  it("Pro は既存が無くても複数紐付けできる", () => {
    expect(
      canLinkMore({ nextCount: 3, initialCount: 0, hasMultiLink: true }),
    ).toBe(true);
  });

  it("無料でも既存件数と同じ件数なら維持できる", () => {
    expect(
      canLinkMore({ nextCount: 3, initialCount: 3, hasMultiLink: false }),
    ).toBe(true);
  });

  it("無料でも既存件数より減らす分には通る", () => {
    expect(
      canLinkMore({ nextCount: 2, initialCount: 3, hasMultiLink: false }),
    ).toBe(true);
  });

  it("無料は既存件数を超えて増やそうとすると弾く", () => {
    expect(
      canLinkMore({ nextCount: 4, initialCount: 3, hasMultiLink: false }),
    ).toBe(false);
  });
});

describe("作成時の紐付けペイロード", () => {
  it("紐付けが無ければキーを生やさない", () => {
    expect(buildImprovementThemeIdsPayload([])).toEqual({});
    expect(buildGameResultIdsPayload([])).toEqual({});
  });

  it("重複を除いた ID を送る", () => {
    expect(buildImprovementThemeIdsPayload([3, 3, 5])).toEqual({
      improvement_theme_ids: [3, 5],
    });
    expect(buildGameResultIdsPayload([7, 7])).toEqual({
      game_result_ids: [7],
    });
  });
});

describe("更新時の紐付けペイロード", () => {
  it("変更が無ければ試合のキーを生やさない", () => {
    expect(
      buildGameResultIdsUpdate({ initialIds: [1, 2], ids: [2, 1] }),
    ).toEqual({});
  });

  it("変更があれば試合のキーを送る", () => {
    expect(buildGameResultIdsUpdate({ initialIds: [1], ids: [1, 2] })).toEqual({
      game_result_ids: [1, 2],
    });
  });

  it("全解除は空配列を明示して送る", () => {
    expect(buildGameResultIdsUpdate({ initialIds: [1], ids: [] })).toEqual({
      game_result_ids: [],
    });
  });

  it("元から紐付けが無ければ空配列でもキーを生やさない", () => {
    expect(buildGameResultIdsUpdate({ initialIds: [], ids: [] })).toEqual({});
  });

  it("変更が無ければ課題のキーを生やさない", () => {
    expect(
      buildImprovementThemeIdsUpdate({ initialIds: [7], ids: [7] }),
    ).toEqual({});
  });

  it("課題の全解除も空配列を明示して送る", () => {
    expect(
      buildImprovementThemeIdsUpdate({ initialIds: [7], ids: [] }),
    ).toEqual({ improvement_theme_ids: [] });
  });

  it("課題の差し替えはそのまま送る", () => {
    expect(
      buildImprovementThemeIdsUpdate({ initialIds: [7], ids: [8] }),
    ).toEqual({ improvement_theme_ids: [8] });
  });
});
