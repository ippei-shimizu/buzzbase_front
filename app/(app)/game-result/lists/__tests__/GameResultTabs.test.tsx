import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GameResultTabs } from "../_components/GameResultTabs";

jest.mock("@app/components/user/MatchResultList", () => {
  return function MatchResultList({ userId }: { userId: number }) {
    return (
      <div data-testid="match-list">一覧コンテンツ (userId: {userId})</div>
    );
  };
});

jest.mock("../_components/GameSummaryContainer", () => ({
  GameSummaryContainer: () => (
    <div data-testid="summary">サマリーコンテンツ</div>
  ),
}));

describe("GameResultTabs", () => {
  it("サマリー / 一覧 の2タブが表示される", () => {
    render(<GameResultTabs userId={1} adSlot="slot" adLayoutKey="key" />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(screen.getByText("サマリー")).toBeInTheDocument();
    expect(screen.getByText("一覧")).toBeInTheDocument();
  });

  it("初期表示はサマリータブ（先頭）", () => {
    render(<GameResultTabs userId={1} adSlot="slot" adLayoutKey="key" />);

    expect(screen.getByTestId("summary")).toBeInTheDocument();
    expect(screen.queryByTestId("match-list")).not.toBeInTheDocument();

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("一覧タブをクリックすると一覧が表示される", async () => {
    const user = userEvent.setup();
    render(<GameResultTabs userId={1} adSlot="slot" adLayoutKey="key" />);

    await user.click(screen.getByText("一覧"));

    await waitFor(() => {
      expect(screen.getByTestId("match-list")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("summary")).not.toBeInTheDocument();
  });
});
