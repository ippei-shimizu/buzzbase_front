jest.mock("@app/(app)/pro/actions", () => ({
  startProCheckout: jest.fn(),
}));

jest.mock("@mantine/hooks", () => ({
  useMediaQuery: jest.fn(() => false),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), info: jest.fn(), success: jest.fn() },
}));

const mockUseProStatus = jest.fn();
jest.mock("@app/hooks/pro/useProStatus", () => ({
  useProStatus: () => mockUseProStatus(),
}));

import { fireEvent, render, screen } from "@testing-library/react";
import { APP_ONLY_LABEL } from "@app/components/pro/proFeatureCatalog";
import { DEFAULT_PRO_STATUS } from "@app/types/pro";
import ProUpgradeModal from "../ProUpgradeModal";

describe("ProUpgradeModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProStatus.mockReturnValue({
      proStatus: DEFAULT_PRO_STATUS,
      isPro: false,
      isLoading: false,
      isRefreshing: false,
      refresh: jest.fn(),
    });
  });

  it("トライアル未利用なら CTA ボタンに「7日間無料で試す」を表示する", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(screen.getByTestId("pro-upgrade-cta")).toHaveTextContent(
      "7日間無料で試す",
    );
  });

  it("トライアル利用済みなら CTA ボタンに「Proに加入する」を表示する", () => {
    mockUseProStatus.mockReturnValue({
      proStatus: {
        ...DEFAULT_PRO_STATUS,
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          has_used_trial: true,
        },
      },
      isPro: false,
      isLoading: false,
      isRefreshing: false,
      refresh: jest.fn(),
    });

    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(screen.getByTestId("pro-upgrade-cta")).toHaveTextContent(
      "Proに加入する",
    );
  });

  it("Pro状態の判定確定前は、実際はトライアル利用済みでもCTAボタンに中立文言を表示する", () => {
    mockUseProStatus.mockReturnValue({
      proStatus: {
        ...DEFAULT_PRO_STATUS,
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          has_used_trial: true,
        },
      },
      isPro: false,
      isLoading: true,
      isRefreshing: false,
      refresh: jest.fn(),
    });

    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(screen.getByTestId("pro-upgrade-cta")).toHaveTextContent(
      "PROを始める",
    );
  });

  it("Pro状態の判定確定前はトライアル案内文を表示しない", () => {
    mockUseProStatus.mockReturnValue({
      proStatus: DEFAULT_PRO_STATUS,
      isPro: false,
      isLoading: true,
      isRefreshing: false,
      refresh: jest.fn(),
    });

    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(
      screen.queryByText(
        "7 日間の無料トライアル期間中に解約すれば料金はかかりません",
      ),
    ).not.toBeInTheDocument();
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

  it("Free/Pro 比較表が全機能グループを表示する", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);

    expect(screen.getByText("方向別の打率")).toBeInTheDocument();
    expect(screen.getByText("練習と成績の関係を発見")).toBeInTheDocument();
    // アプリ版限定機能には案内バッジが付く。
    expect(screen.getAllByText(APP_ONLY_LABEL).length).toBeGreaterThan(0);
  });

  it("プラン Radio に年額・月額の両方が表示される", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(screen.getByText("年額プラン")).toBeInTheDocument();
    expect(screen.getByText("月額プラン")).toBeInTheDocument();
    expect(screen.getByText("¥4,800")).toBeInTheDocument();
    expect(screen.getByText("¥480")).toBeInTheDocument();
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
});
