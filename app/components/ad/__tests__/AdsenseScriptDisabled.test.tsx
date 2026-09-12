// 環境フラグは import 時に束縛されるため、無効時の挙動は専用ファイルでモックを固定して検証する
jest.mock("../adConfig", () => ({
  ADSENSE_CLIENT_ID: "ca-pub-test",
  isAdsenseEnabled: false,
  isAdsenseScriptEnabled: false,
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

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

describe("AdsenseScript（AdSense 無効な環境）", () => {
  // 広告枠が 1 つも出ない環境でスクリプトだけ読み込まれると、無駄な通信が発生する
  it("無料ユーザーでもスクリプトを読み込まない", () => {
    mockUseEntitlement.mockReturnValue({
      isPro: false,
      inTrial: false,
      inGracePeriod: false,
      isLoading: false,
      hasEntitlement: jest.fn(() => false),
    });

    render(<AdsenseScript />);

    expect(screen.queryByTestId("script")).not.toBeInTheDocument();
  });
});
