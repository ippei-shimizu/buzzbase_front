import { render, screen, fireEvent } from "@testing-library/react";
import PaywallModal from "../PaywallModal";

describe("PaywallModal", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Pro 機能を渡すと、その機能に対応したコピーが表示される", () => {
    render(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="season_transition_graph"
      />,
    );

    expect(
      screen.getByText("シーズンを跨いだ成長を可視化"),
    ).toBeInTheDocument();
  });

  it("別の Pro 機能では別のコピーが表示される", () => {
    render(
      <PaywallModal
        isOpen
        onClose={mockOnClose}
        feature="unlimited_practice_menus"
      />,
    );

    expect(screen.getByText("練習メニューを無制限に登録")).toBeInTheDocument();
  });

  it("isOpen が false のときは表示されない", () => {
    render(
      <PaywallModal
        isOpen={false}
        onClose={mockOnClose}
        feature="season_transition_graph"
      />,
    );

    expect(
      screen.queryByText("シーズンを跨いだ成長を可視化"),
    ).not.toBeInTheDocument();
  });

  it("「Pro プランを見る」ボタンが /pro への Link になっていて、押下で onClose が呼ばれる", () => {
    render(<PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />);

    // HeroUI の Button は as={Link} を渡しても role=button のままで、
    // 内部要素が <a href> を持つ。href の検証は closest("a") で行う。
    const upgradeButton = screen.getByText("Pro プランを見る");
    expect(upgradeButton.closest("a")).toHaveAttribute("href", "/pro");

    fireEvent.click(upgradeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("「閉じる」ボタンで onClose が呼ばれる", () => {
    render(<PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />);

    fireEvent.click(screen.getByText("閉じる"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
