const mockGetFeatureFlags = jest.fn();

jest.mock("../actions", () => ({
  getFeatureFlags: (keys: string[]) => mockGetFeatureFlags(keys),
}));

import { getCachedFeatureFlag } from "../cachedFeatureFlags";

describe("getCachedFeatureFlag", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("有効な flag は true を返す", async () => {
    mockGetFeatureFlags.mockResolvedValue({ pro_features: true });

    await expect(getCachedFeatureFlag("pro_features")).resolves.toBe(true);
    expect(mockGetFeatureFlags).toHaveBeenCalledWith(["pro_features"]);
  });

  it("無効な flag は false を返す", async () => {
    mockGetFeatureFlags.mockResolvedValue({ cancellation_survey: false });

    await expect(getCachedFeatureFlag("cancellation_survey")).resolves.toBe(
      false,
    );
  });
});
