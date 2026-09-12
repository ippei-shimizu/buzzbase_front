import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GAME_RESULT_ID_STORAGE_KEY } from "@app/constants/gameRecord";
import ResultsSummary from "../page";

const mockPush = jest.fn();
const mockPathname = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname(),
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

const mockGetUserMatchResult = jest.fn();
jest.mock("@app/services/matchResultsService", () => ({
  getUserMatchResult: (id: number) => mockGetUserMatchResult(id),
}));

const mockGetUserBattingAverage = jest.fn();
jest.mock("@app/services/battingAveragesService", () => ({
  getUserBattingAverage: (id: number) => mockGetUserBattingAverage(id),
}));

const mockGetUserPitchingResult = jest.fn();
jest.mock("@app/services/pitchingResultsService", () => ({
  getUserPitchingResult: (id: number) => mockGetUserPitchingResult(id),
}));

const mockGetUserPlateAppearance = jest.fn();
jest.mock("@app/services/plateAppearanceService", () => ({
  getUserPlateAppearance: (id: number) => mockGetUserPlateAppearance(id),
}));

const mockGetPlateAppearancesByGame = jest.fn();
jest.mock("@app/services/v2/plateAppearanceService", () => ({
  getPlateAppearancesByGame: (id: number) => mockGetPlateAppearancesByGame(id),
}));

jest.mock("@app/services/userService", () => ({
  getCurrentUserId: () => Promise.resolve(7),
  getCurrentUsersUserId: () => Promise.resolve("buzz"),
}));

jest.mock("@app/services/tournamentsService", () => ({
  getTournamentName: () => Promise.resolve("春季大会"),
}));

jest.mock("@app/services/teamsService", () => ({
  getTeamName: () => Promise.resolve("バズベースA"),
}));

jest.mock("@app/services/positionService", () => ({
  getPositionName: () => Promise.resolve("投手"),
}));

jest.mock("@app/services/gameResultsService", () => ({
  deleteGameResult: jest.fn(),
}));

const buildMatchResult = () => [
  {
    id: 99,
    user_id: 7,
    match_type: "regular",
    date_and_time: "2026-05-04T10:00:00",
    batting_order: "3",
    defensive_position: "1",
    my_team_id: 1,
    opponent_team_id: 2,
    tournament_id: 3,
    my_team_score: 5,
    opponent_team_score: 2,
    appearance_type: "starter",
    memo: null,
    season_name: null,
  },
];

describe("試合詳細ページ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockPathname.mockReturnValue("/game-result/summary/99");
    mockGetUserMatchResult.mockResolvedValue(buildMatchResult());
    mockGetUserBattingAverage.mockResolvedValue([]);
    mockGetUserPitchingResult.mockResolvedValue([]);
    mockGetUserPlateAppearance.mockResolvedValue([]);
    mockGetPlateAppearancesByGame.mockResolvedValue([]);
  });

  it("localStorage が空でも URL の試合IDで試合内容を表示する", async () => {
    render(<ResultsSummary />);

    expect(await screen.findByText("5 - 2")).toBeInTheDocument();
    expect(mockGetUserMatchResult).toHaveBeenCalledWith(99);
    expect(mockGetUserBattingAverage).toHaveBeenCalledWith(99);
    expect(mockGetPlateAppearancesByGame).toHaveBeenCalledWith(99);
  });

  it("記録フローの残骸があっても URL の試合を表示する", async () => {
    localStorage.setItem(GAME_RESULT_ID_STORAGE_KEY, "1234");

    render(<ResultsSummary />);

    await screen.findByText("5 - 2");
    expect(mockGetUserMatchResult).toHaveBeenCalledWith(99);
    expect(mockGetUserMatchResult).not.toHaveBeenCalledWith(1234);
  });

  it("編集に進むときだけ記録フローへ試合IDを引き渡す", async () => {
    render(<ResultsSummary />);

    const editButton = await screen.findByRole("button", { name: "編集" });
    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBeNull();

    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/game-result/record");
    });
    expect(localStorage.getItem(GAME_RESULT_ID_STORAGE_KEY)).toBe("99");
  });
});
