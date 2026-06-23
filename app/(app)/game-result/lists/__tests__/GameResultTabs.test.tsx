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

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockCreateGameResult = jest.fn();
jest.mock("@app/services/gameResultsService", () => ({
  createGameResult: () => mockCreateGameResult(),
}));

describe("GameResultTabs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("サマリー / 一覧 のタブと記録ボタンが表示される", () => {
    render(<GameResultTabs userId={1} adSlot="slot" adLayoutKey="key" />);

    expect(screen.getByText("サマリー")).toBeInTheDocument();
    expect(screen.getByText("一覧")).toBeInTheDocument();
    expect(screen.getByText("試合結果を記録する")).toBeInTheDocument();
  });

  it("初期表示はサマリータブ", () => {
    render(<GameResultTabs userId={1} adSlot="slot" adLayoutKey="key" />);

    expect(screen.getByTestId("summary")).toBeInTheDocument();
    expect(screen.queryByTestId("match-list")).not.toBeInTheDocument();
  });

  it("一覧タブをクリックすると一覧が表示される", async () => {
    const user = userEvent.setup();
    render(<GameResultTabs userId={1} adSlot="slot" adLayoutKey="key" />);

    await user.click(screen.getByText("一覧"));

    expect(screen.getByTestId("match-list")).toBeInTheDocument();
    expect(screen.queryByTestId("summary")).not.toBeInTheDocument();
  });

  it("記録ボタンで試合結果を作成し記録画面へ遷移する", async () => {
    const user = userEvent.setup();
    mockCreateGameResult.mockResolvedValueOnce({ id: 42 });
    render(<GameResultTabs userId={1} adSlot="slot" adLayoutKey="key" />);

    await user.click(screen.getByText("試合結果を記録する"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/game-result/record");
    });
    expect(mockCreateGameResult).toHaveBeenCalled();
  });
});
