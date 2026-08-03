jest.mock("@app/(app)/pro/actions", () => ({
  startProCheckout: jest.fn(),
}));

jest.mock("@mantine/hooks", () => ({
  useMediaQuery: jest.fn(() => false),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), info: jest.fn(), success: jest.fn() },
}));

// flag の解決そのものは useFeatureFlag のテストで担保する。ここでは判定ごとの描画だけを見る。
const mockUseFeatureFlag = jest.fn();
jest.mock("@app/hooks/featureFlags/useFeatureFlag", () => ({
  useFeatureFlag: (key: string, options?: { skip?: boolean }) =>
    mockUseFeatureFlag(key, options),
}));

import { fireEvent, render, screen } from "@testing-library/react";
import { APP_ONLY_LABEL } from "@app/components/pro/proFeatureCatalog";
import ProUpgradeModal from "../ProUpgradeModal";

const SUSPENDED_MESSAGE =
  "現在、新規のお申し込みを停止しています。再開までしばらくお待ちください。";

describe("ProUpgradeModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFeatureFlag.mockReturnValue("enabled");
  });

  it("isOpen が false のときは何も描画しない", () => {
    render(<ProUpgradeModal isOpen={false} onClose={jest.fn()} />);
    expect(screen.queryByText("BUZZ BASE Pro")).not.toBeInTheDocument();
  });

  it("trigger 無しのときは汎用文言を表示する", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(
      screen.getByText("BUZZ BASE Pro でもっと深く野球を"),
    ).toBeInTheDocument();
  });

  it("trigger が Pro 機能のときはその機能のコピーを表示する", () => {
    render(
      <ProUpgradeModal
        isOpen
        onClose={jest.fn()}
        trigger="season_transition_graph"
      />,
    );
    expect(
      screen.getByText("シーズンを跨いだ成長を可視化"),
    ).toBeInTheDocument();
  });

  it("trigger の機能は機能一覧で重複表示しない", () => {
    render(
      <ProUpgradeModal
        isOpen
        onClose={jest.fn()}
        trigger="season_transition_graph"
      />,
    );

    // 見出しの 1 箇所だけに出る。
    expect(screen.getAllByText("シーズンを跨いだ成長を可視化")).toHaveLength(1);
  });

  it("機能一覧の訴求が Pro 機能の代表キーから作られている", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);

    expect(screen.getByText("方向別の打率")).toBeInTheDocument();
    expect(screen.getByText("練習と成績の関係を発見")).toBeInTheDocument();
    // 代表機能はすべて Web 提供済みなので「アプリ版」は出ない。
    expect(screen.queryByText(APP_ONLY_LABEL)).not.toBeInTheDocument();
  });

  it("プラン Radio に年額・月額の両方が表示される", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(screen.getByText("年額プラン")).toBeInTheDocument();
    expect(screen.getByText("月額プラン")).toBeInTheDocument();
    expect(screen.getByText("¥2,980")).toBeInTheDocument();
    expect(screen.getByText("¥300")).toBeInTheDocument();
  });

  it("CTA ボタンが配置されている", () => {
    // CTA クリック → startProCheckout 呼び出しの実挙動は HeroUI の dynamic import との
    // 兼ね合いで Jest 環境では検証しづらい。actions.test.ts 側で startProCheckout を網羅。
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(screen.getByTestId("pro-upgrade-cta")).toBeInTheDocument();
  });

  it("「閉じる」を押すと onClose が呼ばれる", () => {
    const onClose = jest.fn();
    render(<ProUpgradeModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("pro_features が無効なら CTA を出さず販売停止を伝える", () => {
    mockUseFeatureFlag.mockReturnValue("disabled");

    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);

    expect(screen.queryByTestId("pro-upgrade-cta")).not.toBeInTheDocument();
    expect(screen.getByText(SUSPENDED_MESSAGE)).toBeInTheDocument();
  });

  it("判定不能のときは販売停止を告知せず CTA を残す", () => {
    mockUseFeatureFlag.mockReturnValue("indeterminate");

    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);

    expect(screen.getByTestId("pro-upgrade-cta")).toBeInTheDocument();
    expect(screen.queryByText(SUSPENDED_MESSAGE)).not.toBeInTheDocument();
  });

  it("閉じている間は flag を評価しない", () => {
    render(<ProUpgradeModal isOpen={false} onClose={jest.fn()} />);

    expect(mockUseFeatureFlag).toHaveBeenCalledWith("pro_features", {
      skip: true,
    });
  });

  it("開いている間は flag を評価する", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);

    expect(mockUseFeatureFlag).toHaveBeenCalledWith("pro_features", {
      skip: false,
    });
  });
});
