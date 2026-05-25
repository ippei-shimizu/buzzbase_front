jest.mock("@app/(app)/pro/actions", () => ({
  startProCheckout: jest.fn(),
}));

jest.mock("@mantine/hooks", () => ({
  useMediaQuery: jest.fn(() => false),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), info: jest.fn(), success: jest.fn() },
}));

import { fireEvent, render, screen } from "@testing-library/react";
import ProUpgradeModal from "../ProUpgradeModal";

describe("ProUpgradeModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("プラン Radio に年額・月額の両方が表示される", () => {
    render(<ProUpgradeModal isOpen onClose={jest.fn()} />);
    expect(screen.getByText("年額プラン")).toBeInTheDocument();
    expect(screen.getByText("月額プラン")).toBeInTheDocument();
    expect(screen.getByText("¥9,800")).toBeInTheDocument();
    expect(screen.getByText("¥980")).toBeInTheDocument();
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
