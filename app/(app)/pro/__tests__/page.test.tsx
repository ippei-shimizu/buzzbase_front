const mockRedirect = jest.fn((path: string) => {
  // 本物の redirect() と同じく後続処理を止めるため throw する。
  throw new Error(`NEXT_REDIRECT:${path}`);
});
jest.mock("next/navigation", () => ({
  redirect: (path: string) => mockRedirect(path),
}));

const mockGetCachedFeatureFlagDecision = jest.fn();
jest.mock("@app/featureFlags/cachedFeatureFlags", () => ({
  getCachedFeatureFlagDecision: (key: string) =>
    mockGetCachedFeatureFlagDecision(key),
}));

const mockGetCachedProStatus = jest.fn();
jest.mock("../proStatus", () => ({
  getCachedProStatus: () => mockGetCachedProStatus(),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

import { render, screen } from "@testing-library/react";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";
import ProLandingPage from "../page";

const proActiveStatus: ProStatus = {
  subscription: {
    ...DEFAULT_PRO_STATUS.subscription,
    status: "active",
    pro_active: true,
  },
  entitlements: [...DEFAULT_PRO_STATUS.entitlements],
};

function expectLandingPageRendered() {
  expect(
    screen.getByRole("heading", { name: /記録を、成長へ。/ }),
  ).toBeInTheDocument();
  expect(mockRedirect).not.toHaveBeenCalled();
}

describe("ProLandingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCachedProStatus.mockResolvedValue(null);
  });

  it("pro_features が有効なら LP を表示する", async () => {
    mockGetCachedFeatureFlagDecision.mockResolvedValue("enabled");

    render(await ProLandingPage());

    expectLandingPageRendered();
    expect(mockGetCachedFeatureFlagDecision).toHaveBeenCalledWith(
      "pro_features",
    );
  });

  it("判定不能（未認証・cookie 未達）でも公開 LP は表示する", async () => {
    mockGetCachedFeatureFlagDecision.mockResolvedValue("indeterminate");

    render(await ProLandingPage());

    expectLandingPageRendered();
  });

  it("pro_features が無効と確定したときだけトップへリダイレクトする", async () => {
    mockGetCachedFeatureFlagDecision.mockResolvedValue("disabled");

    await expect(ProLandingPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
  });

  it("flag が無効なら Pro 加入済みでもトップへリダイレクトする", async () => {
    // kill switch を Pro 加入者向け分岐より先に効かせる。
    mockGetCachedFeatureFlagDecision.mockResolvedValue("disabled");
    mockGetCachedProStatus.mockResolvedValue(proActiveStatus);

    await expect(ProLandingPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/");
    expect(mockRedirect).not.toHaveBeenCalledWith("/account/subscription");
  });

  it("Pro 加入済みならサブスクリプション画面へリダイレクトする", async () => {
    mockGetCachedFeatureFlagDecision.mockResolvedValue("enabled");
    mockGetCachedProStatus.mockResolvedValue(proActiveStatus);

    await expect(ProLandingPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/account/subscription");
  });
});
