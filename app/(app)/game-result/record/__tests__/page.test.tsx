import { render } from "@testing-library/react";
import GameRecord from "../page";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/game-result/record",
}));

jest.mock("@app/contexts/useAuthContext", () => ({
  useAuthContext: () => ({ isLoggedIn: true, loading: false }),
}));

jest.mock("@app/components/header/HeaderResult", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@app/services/gameResultsService", () => ({
  createGameResult: () => Promise.resolve({ id: 1 }),
  updateGameResult: () => Promise.resolve({}),
}));

jest.mock("@app/services/matchResultsService", () => ({
  checkExistingMatchResults: () => Promise.resolve(null),
  createMatchResults: () => Promise.resolve({ id: 1 }),
  getMatchResultFormDefaults: () => Promise.resolve(null),
  updateMatchResult: () => Promise.resolve({}),
}));

jest.mock("@app/services/positionService", () => ({
  getPositions: () => Promise.resolve([]),
}));

jest.mock("@app/services/seasonsService", () => ({
  createSeason: () => Promise.resolve({}),
  getSeasons: () => Promise.resolve([]),
}));

jest.mock("@app/services/teamsService", () => ({
  createOrUpdateTeam: () => Promise.resolve({}),
  getTeams: () => Promise.resolve([]),
}));

jest.mock("@app/services/tournamentsService", () => ({
  createTournament: () => Promise.resolve({}),
  getTournaments: () => Promise.resolve([]),
  updateTournament: () => Promise.resolve({}),
}));

jest.mock("@app/services/userService", () => ({
  getCurrentUserId: () => Promise.resolve(1),
  getUserData: () => Promise.resolve({ positions: [], team_id: null }),
}));

jest.mock("@app/services/v2/stadiumService", () => ({
  createStadium: () => Promise.resolve({}),
  searchStadiums: () => Promise.resolve({ stadiums: [] }),
}));

describe("試合結果入力ページの計測", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("試合情報ステップの表示を game record step viewed で送る", () => {
    render(<GameRecord />);

    expect(mockCapture).toHaveBeenCalledWith("game record step viewed", {
      step: 1,
    });
  });
});
