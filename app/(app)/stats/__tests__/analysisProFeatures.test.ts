import {
  DEFAULT_PRO_STATUS,
  PRO_FEATURES,
  type Feature,
  type ProStatus,
} from "@app/types/pro";
import {
  SEASON_TREND_FEATURES,
  grantedProFeatures,
} from "../analysisProFeatures";

function makeProStatus(entitlements: Feature[]): ProStatus {
  return { ...DEFAULT_PRO_STATUS, entitlements };
}

describe("grantedProFeatures", () => {
  it("entitlement を持つ機能だけ返す", () => {
    const proStatus = makeProStatus([
      ...DEFAULT_PRO_STATUS.entitlements,
      "season_transition_graph",
    ]);

    expect(
      grantedProFeatures(proStatus, [
        "season_transition_graph",
        "hit_direction_average",
      ]),
    ).toEqual(["season_transition_graph"]);
  });

  it("無料ユーザーには Pro 機能を渡さない", () => {
    expect(
      grantedProFeatures(DEFAULT_PRO_STATUS, SEASON_TREND_FEATURES),
    ).toEqual([]);
  });

  it("未認証（Pro 状態が取れない）なら無料と同じ扱いにする", () => {
    expect(grantedProFeatures(null, SEASON_TREND_FEATURES)).toEqual([]);
  });

  it("シーズン推移は season_transition_graph を要求する", () => {
    expect(SEASON_TREND_FEATURES).toEqual(["season_transition_graph"]);
    // entitlement キーが back とずれていないことを型定義側の一覧で担保する。
    expect(PRO_FEATURES).toContain("season_transition_graph");
  });
});
