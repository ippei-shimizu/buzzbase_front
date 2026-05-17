import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import PaywallModal from "../PaywallModal";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("PaywallModal", () => {
  const mockPush = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    });
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

  it("「Pro プランを見る」ボタンで /pro へ遷移し onClose も呼ばれる", () => {
    render(<PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />);

    fireEvent.click(screen.getByText("Pro プランを見る"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/pro");
  });

  it("「閉じる」ボタンで onClose が呼ばれる", () => {
    render(<PaywallModal isOpen onClose={mockOnClose} feature="no_ads" />);

    fireEvent.click(screen.getByText("閉じる"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
