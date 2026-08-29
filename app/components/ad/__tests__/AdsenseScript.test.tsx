jest.mock("../adConfig", () => ({
  ADSENSE_CLIENT_ID: "ca-pub-test",
  isAdsenseEnabled: true,
  isAdsenseScriptEnabled: true,
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

// next/script は実際には document へ script を差し込むため、読み込み有無だけを観測できる形に置き換える
jest.mock("next/script", () => ({
  __esModule: true,
  default: ({ src }: { src: string }) => (
    <div data-testid="script" data-src={src} />
  ),
}));

import { render, screen } from "@testing-library/react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import AdsenseScript from "../AdsenseScript";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;

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

describe("AdsenseScript", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("無料ユーザーには AdSense スクリプトを読み込む", () => {
    mockEntitlement();

    render(<AdsenseScript />);

    expect(screen.getByTestId("script")).toHaveAttribute(
      "data-src",
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-test",
    );
  });

  it("no_ads を持つ Pro 加入者にはスクリプト自体を読み込まない", () => {
    mockEntitlement({ hasNoAds: true });

    render(<AdsenseScript />);

    expect(screen.queryByTestId("script")).not.toBeInTheDocument();
  });

  it("Pro 判定が確定するまでスクリプトを読み込まない", () => {
    mockEntitlement({ isLoading: true });

    render(<AdsenseScript />);

    expect(screen.queryByTestId("script")).not.toBeInTheDocument();
  });
});
