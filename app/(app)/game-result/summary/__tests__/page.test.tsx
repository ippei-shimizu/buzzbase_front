import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GAME_RESULT_ID_STORAGE_KEY } from "@app/constants/gameRecord";
import ResultsSummary from "../page";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/game-result/summary",
}));

jest.mock("@app/components/header/SummaryHeader", () => ({
  __esModule: true,
  default: ({
    onSummaryResult,
    text,
  }: {
    onSummaryResult: () => void;
    text: string;
  }) => (
    <button type="button" onClick={onSummaryResult}>
      {text}
    </button>
  ),
}));

jest.mock("@app/components/share/ResultShareComponent", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/components/ad/AdInFeed", () => ({
  __esModule: true,
  default: () => null,
}));

const mockGetCurrentPitchingResult = jest.fn();
jest.mock("@app/services/pitchingResultsService", () => ({
  getCurrentPitchingResult: () => mockGetCurrentPitchingResult(),
}));

jest.mock("@app/services/matchResultsService", () => ({
  getCurrentMatchResult: () =>
    Promise.resolve([
      {
        id: 1,
        game_result_id: 1,
        user_id: 1,
        match_type: "open",
        appearance_type: "pinch_hitter",
        date_and_time: "2026-04-01",
        batting_order: "1",
        defensive_position: "1",
        my_team_id: 1,
        opponent_team_id: 2,
        my_team_score: 3,
        opponent_team_score: 1,
        tournament_id: null,
        memo: "",
      },
    ]),
}));

jest.mock("@app/services/battingAveragesService", () => ({
  getCurrentBattingAverage: () => Promise.resolve([]),
}));

jest.mock("@app/services/plateAppearanceService", () => ({
  getCurrentPlateAppearance: () => Promise.resolve([]),
}));

jest.mock("@app/services/v2/plateAppearanceService", () => ({
  getPlateAppearancesByGame: () => Promise.resolve([]),
}));

jest.mock("@app/services/userService", () => ({
  getCurrentUserId: () => Promise.resolve(1),
  getCurrentUsersUserId: () => Promise.resolve("buzz-user"),
}));

jest.mock("@app/services/teamsService", () => ({
  getTeamName: () => Promise.resolve("チーム"),
}));

jest.mock("@app/services/tournamentsService", () => ({
  getTournamentName: () => Promise.resolve("大会"),
}));

jest.mock("@app/services/positionService", () => ({
  getPositionName: () => Promise.resolve("投手"),
}));

describe("試合結果まとめページの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "42");
    mockGetCurrentPitchingResult.mockResolvedValue([]);
  });

  it("まとめ画面の表示を game record step viewed で送る", () => {
    render(<ResultsSummary />);

    expect(mockCapture).toHaveBeenCalledWith("game record step viewed", {
      step: "summary",
    });
  });

  it("記録を完了すると game record completed を試合の内容付きで送る", async () => {
    const user = userEvent.setup();
    mockGetCurrentPitchingResult.mockResolvedValue([{ id: 3 }]);
    render(<ResultsSummary />);
    await screen.findAllByText("チーム");

    await user.click(screen.getByText("試合一覧へ"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("game record completed", {
        match_type: "open",
        appearance_type: "pinch_hitter",
        has_pitching: true,
      }),
    );
    expect(mockPush).toHaveBeenCalledWith("/game-result/lists");
  });

  it("投手成績が無ければ has_pitching は false で送る", async () => {
    const user = userEvent.setup();
    render(<ResultsSummary />);
    await screen.findAllByText("チーム");

    await user.click(screen.getByText("試合一覧へ"));

    await waitFor(() =>
      expect(mockCapture).toHaveBeenCalledWith("game record completed", {
        match_type: "open",
        appearance_type: "pinch_hitter",
        has_pitching: false,
      }),
    );
  });
});
