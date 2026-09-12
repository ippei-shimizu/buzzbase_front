jest.mock("../adConfig", () => ({
  ADSENSE_CLIENT_ID: "ca-pub-test",
  isAdsenseEnabled: true,
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

import { render } from "@testing-library/react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import AdBanner from "../AdBanner";

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

function renderBanner() {
  return render(<AdBanner slot="1234567890" />);
}

describe("AdBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mutableAdConfig.isAdsenseEnabled = true;
    (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
  });

  it("無料ユーザーには広告枠を描画し、広告をリクエストする", () => {
    mockEntitlement();

    const { container } = renderBanner();

    expect(container.querySelector("ins.adsbygoogle")).toHaveAttribute(
      "data-ad-slot",
      "1234567890",
    );
    expect(adRequestCount()).toBe(1);
  });

  it("no_ads を持つ Pro 加入者には広告枠を描画せず、リクエストもしない", () => {
    mockEntitlement({ hasNoAds: true });

    const { container } = renderBanner();

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    // 枠だけ残ると余白が空きセルとして残る
    expect(container.querySelector(".ad-container")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });

  it("Pro 判定が確定するまで広告枠を描画しない", () => {
    mockEntitlement({ isLoading: true });

    const { container } = renderBanner();

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });

  it("判定中に描画しないまま Pro が確定した場合、広告は一度も描画されない", () => {
    mockEntitlement({ isLoading: true });
    const { container, rerender } = renderBanner();
    expect(container.querySelector("ins.adsbygoogle")).toBeNull();

    mockEntitlement({ hasNoAds: true });
    rerender(<AdBanner slot="1234567890" />);

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });

  it("判定中に描画しないまま無料が確定した場合、確定後に広告を描画する", () => {
    mockEntitlement({ isLoading: true });
    const { container, rerender } = renderBanner();

    mockEntitlement();
    rerender(<AdBanner slot="1234567890" />);

    expect(container.querySelector("ins.adsbygoogle")).not.toBeNull();
    expect(adRequestCount()).toBe(1);
  });

  it("再レンダリングされても広告リクエストは重複しない", () => {
    mockEntitlement();
    const { rerender } = renderBanner();

    rerender(<AdBanner slot="1234567890" />);

    expect(adRequestCount()).toBe(1);
  });

  it("AdSense が無効なら無料ユーザーでも描画しない", () => {
    mutableAdConfig.isAdsenseEnabled = false;
    mockEntitlement();

    const { container } = renderBanner();

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });

  it("スロット未設定なら無料ユーザーでも描画しない", () => {
    mockEntitlement();

    const { container } = render(<AdBanner slot="" />);

    expect(container.querySelector("ins.adsbygoogle")).toBeNull();
    expect(adRequestCount()).toBe(0);
  });
});
