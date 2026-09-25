import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

const mockCreateMatchResults = jest.fn((..._args: unknown[]) =>
  Promise.resolve({ id: 1 }),
);
jest.mock("@app/services/matchResultsService", () => ({
  checkExistingMatchResults: () => Promise.resolve(null),
  createMatchResults: (...args: unknown[]) => mockCreateMatchResults(...args),
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

const mockTeams = [
  { id: "1", name: "テスト高校A" },
  { id: "2", name: "テスト高校B" },
];
const mockCreateOrUpdateTeam = jest.fn((..._args: unknown[]) =>
  Promise.resolve({ data: { id: 99 } }),
);
jest.mock("@app/services/teamsService", () => ({
  createOrUpdateTeam: (...args: unknown[]) => mockCreateOrUpdateTeam(...args),
  getTeams: () => Promise.resolve(mockTeams),
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
  searchStadiums: () => Promise.resolve({ data: [] }),
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

describe("相手チームの入力", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("gameResultId", JSON.stringify(1));
  });

  it("候補から選んだ後にチーム名を打ち替えると、打ち替えた名前で新規チームを作って保存する", async () => {
    const user = userEvent.setup();
    render(<GameRecord />);

    const myTeamInput = await screen.findByRole("combobox", {
      name: /自チーム/,
    });
    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });

    await user.type(myTeamInput, "テスト高校A");
    await user.click(opponentTeamInput);
    await user.click(
      await screen.findByRole("option", { name: "テスト高校B" }),
    );
    await user.tripleClick(opponentTeamInput);
    await user.paste("未登録チームZ");

    expect(opponentTeamInput).toHaveValue("未登録チームZ");

    // 候補リストが開いている間は React Aria が他の要素を aria-hidden にするため、
    // 保存操作の前にリストを閉じる。Escape は revert() を通るので、選択解除が
    // できていないと入力欄が選択済みチーム名に巻き戻る。
    await user.keyboard("{Escape}");
    expect(opponentTeamInput).toHaveValue("未登録チームZ");

    await user.click(screen.getByRole("radio", { name: "未出場" }));
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(mockCreateOrUpdateTeam).toHaveBeenCalledWith({
      team: {
        name: "未登録チームZ",
        category_id: undefined,
        prefecture_id: undefined,
      },
    });
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({
          my_team_id: 1,
          opponent_team_id: 99,
        }),
      }),
    );
  });

  it("候補から選んだままなら新規チームを作らず選んだチームの id で保存する", async () => {
    const user = userEvent.setup();
    render(<GameRecord />);

    const myTeamInput = await screen.findByRole("combobox", {
      name: /自チーム/,
    });
    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });

    await user.type(myTeamInput, "テスト高校A");
    await user.click(opponentTeamInput);
    await user.click(
      await screen.findByRole("option", { name: "テスト高校B" }),
    );

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("radio", { name: "未出場" }));
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(mockCreateOrUpdateTeam).not.toHaveBeenCalled();
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({
          my_team_id: 1,
          opponent_team_id: 2,
        }),
      }),
    );
  });
});
