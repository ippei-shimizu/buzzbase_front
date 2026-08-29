const mockGetFeatureFlagDecisions = jest.fn();

jest.mock("../actions", () => ({
  getFeatureFlagDecisions: (keys: string[]) =>
    mockGetFeatureFlagDecisions(keys),
}));

import { getCachedFeatureFlagDecision } from "../cachedFeatureFlags";

describe("getCachedFeatureFlagDecision", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("有効な flag は enabled を返す", async () => {
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "enabled" });

    await expect(getCachedFeatureFlagDecision("pro_features")).resolves.toBe(
      "enabled",
    );
    expect(mockGetFeatureFlagDecisions).toHaveBeenCalledWith(["pro_features"]);
  });

  it("無効な flag は disabled を返す", async () => {
    mockGetFeatureFlagDecisions.mockResolvedValue({
      cancellation_survey: "disabled",
    });

    await expect(
      getCachedFeatureFlagDecision("cancellation_survey"),
    ).resolves.toBe("disabled");
  });

  it("判定不能は disabled に丸めずそのまま返す", async () => {
    mockGetFeatureFlagDecisions.mockResolvedValue({
      pro_features: "indeterminate",
    });

    await expect(getCachedFeatureFlagDecision("pro_features")).resolves.toBe(
      "indeterminate",
    );
  });
});
