jest.mock("../adConfig", () => ({
  ADSENSE_CLIENT_ID: "ca-pub-test",
  isAdsenseEnabled: true,
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

import { render } from "@testing-library/react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import AdInFeed from "../AdInFeed";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;

// isAdsenseEnabled はビルド時の環境変数から決まる定数のため、モジュールごとモックして切り替える
const mutableAdConfig = jest.requireMock("../adConfig") as {
  isAdsenseEnabled: boolean;
};

function mockEntitlement({
  hasNoAds = false,
  isLoading = false,
}: { hasNoAds?: boolean; isLoading?: boolean } = {}) {
  mockUseEntitlement.mockReturnValue({
    isPro: hasNoAds,
    inTrial: false,
    inGracePeriod: false,
    isLoading,
    hasEntitlement: jest.fn((feature) => feature === "no_ads" && hasNoAds),
  });
}

function adRequestCount() {
  return (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.length;
}

function renderInFeed() {
  return render(<AdInFeed slot="9876543210" layoutKey="-fb+5w+4e-db+86" />);
}

describe("AdInFeed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutableAdConfig.isAdsenseEnabled = true;
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
  });

  it("無料ユーザーには広告枠を描画し、広告をリクエストする", () => {
    mockEntitlement();

    const { container } = renderInFeed();

    expect(container.querySelector("ins.adsbygoogle")).toHaveAttribute(
      "data-ad-slot",
      "9876543210",
    );
    expect(adRequestCount()).toBe(1);
  });

  it("no_ads を持つ Pro 加入者には広告枠を描画せず、リクエストもしない", () => {
    mockEntitlement({ hasNoAds: true });

    const { container } = renderInFeed();

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });

  it("Pro 判定が確定するまで広告枠を描画しない", () => {
    mockEntitlement({ isLoading: true });

    const { container } = renderInFeed();

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });

  it("AdSense が無効なら無料ユーザーでも描画しない", () => {
    mutableAdConfig.isAdsenseEnabled = false;
    mockEntitlement();

    const { container } = renderInFeed();

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });

  it("スロット未設定なら無料ユーザーでも描画しない", () => {
    mockEntitlement();

    const { container } = render(<AdInFeed slot="" />);

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });
});
