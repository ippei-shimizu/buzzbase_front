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
const mockCheckExistingMatchResults = jest.fn(
  (..._args: unknown[]): Promise<Record<string, unknown> | null> =>
    Promise.resolve(null),
);
jest.mock("@app/services/matchResultsService", () => ({
  checkExistingMatchResults: (...args: unknown[]) =>
    mockCheckExistingMatchResults(...args),
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

type TeamRecord = {
  id: number;
  name: string;
  category_id: null;
  prefecture_id: null;
};
const buildTeam = (id: number, name: string): TeamRecord => ({
  id,
  name,
  category_id: null,
  prefecture_id: null,
});
const defaultTeams = [buildTeam(1, "テスト高校A"), buildTeam(2, "テスト高校B")];
let mockTeams: TeamRecord[] = defaultTeams;

type TeamsRequestConfig = { params?: { q?: string; limit?: number } };
const mockAxiosGet = jest.fn(
  (url: string, config?: TeamsRequestConfig): Promise<{ data: unknown }> => {
    if (url === "/api/v1/teams") {
      const query = config?.params?.q ?? "";
      return Promise.resolve({
        data: mockTeams.filter((team) => team.name.includes(query)),
      });
    }
    const teamNameMatch = url.match(/^\/api\/v1\/teams\/(\d+)\/team_name$/);
    const team = teamNameMatch
      ? mockTeams.find((candidate) => candidate.id === Number(teamNameMatch[1]))
      : undefined;
    if (team) return Promise.resolve({ data: { name: team.name } });
    return Promise.reject(new Error(`unexpected GET ${url}`));
  },
);
const mockAxiosPost = jest.fn((url: string, _body?: unknown) =>
  url === "/api/v1/teams"
    ? Promise.resolve({ data: { id: 99 } })
    : Promise.reject(new Error(`unexpected POST ${url}`)),
);
jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: {
    get: (url: string, config?: TeamsRequestConfig) =>
      mockAxiosGet(url, config),
    post: (url: string, body?: unknown) => mockAxiosPost(url, body),
  },
}));

// 候補はリストを開いた後に非同期で届くため、React Aria が開いた時点で aria-hidden を
// 付けたポップオーバー内に描画される。hidden 要素も含めて探す。
const findTeamOptions = (name: string) =>
  screen.findAllByRole("option", { name, hidden: true });

const teamCreateRequests = () =>
  mockAxiosPost.mock.calls.filter(([url]) => url === "/api/v1/teams");
const teamListRequests = () =>
  mockAxiosGet.mock.calls.filter(([url]) => url === "/api/v1/teams");

jest.mock("@app/services/tournamentsService", () => ({
  createTournament: () => Promise.resolve({}),
  getTournaments: () => Promise.resolve([]),
  updateTournament: () => Promise.resolve({}),
}));

const mockGetUserData = jest.fn(() =>
  Promise.resolve<{ positions: never[]; team_id: number | null }>({
    positions: [],
    team_id: null,
  }),
);
jest.mock("@app/services/userService", () => ({
  getCurrentUserId: () => Promise.resolve(1),
  getUserData: () => mockGetUserData(),
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
    mockTeams = defaultTeams;
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
    await user.type(opponentTeamInput, "テスト高校");
    await user.click((await findTeamOptions("テスト高校B"))[0]);
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
    expect(teamCreateRequests()).toEqual([
      [
        "/api/v1/teams",
        {
          team: {
            name: "未登録チームZ",
            category_id: undefined,
            prefecture_id: undefined,
          },
        },
      ],
    ]);
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
    await user.type(opponentTeamInput, "テスト高校");
    await user.click((await findTeamOptions("テスト高校B"))[0]);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("radio", { name: "未出場" }));
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(teamCreateRequests()).toEqual([]);
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({
          my_team_id: 1,
          opponent_team_id: 2,
        }),
      }),
    );
  });

  it("候補から選んだ後に打ち替えて入力欄から離れても、打ち替えた名前が残る", async () => {
    const user = userEvent.setup();
    render(<GameRecord />);

    const myTeamInput = await screen.findByRole("combobox", {
      name: /自チーム/,
    });
    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });

    await user.type(myTeamInput, "テスト高校A");
    await user.type(opponentTeamInput, "テスト高校");
    await user.click((await findTeamOptions("テスト高校B"))[0]);
    await user.tripleClick(opponentTeamInput);
    await user.paste("未登録チームZ");

    // blur 時は commitCustomValue が onSelectionChange(null) を飛ばすため、
    // ここで名前まで消えると入力済みなのに未入力扱いになる。
    await user.tab();
    expect(opponentTeamInput).toHaveValue("未登録チームZ");

    await user.click(screen.getByRole("radio", { name: "未出場" }));
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({ opponent_team_id: 99 }),
      }),
    );
  });

  it("候補から選んだ後に入力を全消しすると、未入力として弾かれる", async () => {
    const user = userEvent.setup();
    render(<GameRecord />);

    const myTeamInput = await screen.findByRole("combobox", {
      name: /自チーム/,
    });
    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });

    await user.type(myTeamInput, "テスト高校A");
    await user.type(opponentTeamInput, "テスト高校");
    await user.click((await findTeamOptions("テスト高校B"))[0]);
    await user.clear(opponentTeamInput);

    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("radio", { name: "未出場" }));
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    expect(
      await screen.findByText("相手チーム名が未入力です。"),
    ).toBeInTheDocument();
    expect(mockCreateMatchResults).not.toHaveBeenCalled();
  });

  it("既存試合の編集で開くと opponent_team_id からチーム名が復元される", async () => {
    mockCheckExistingMatchResults.mockResolvedValueOnce({
      id: 10,
      date_and_time: "2026-09-01T00:00:00+09:00",
      match_type: "regular",
      tournament_id: null,
      my_team_id: 1,
      my_team_score: 3,
      opponent_team_score: 2,
      batting_order: "1",
      memo: null,
      opponent_team_id: 2,
      defensive_position: "1",
      inning_format: 9,
      appearance_type: "starter",
    });
    render(<GameRecord />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /相手チーム/ })).toHaveValue(
        "テスト高校B",
      );
    });
    expect(screen.getByRole("combobox", { name: /自チーム/ })).toHaveValue(
      "テスト高校A",
    );
  });

  it("自チームと相手チームが同じチームの試合を編集で開くと、両方にチーム名が復元される", async () => {
    mockGetUserData.mockResolvedValueOnce({ positions: [], team_id: 1 });
    // プロフィールの所属チーム名を解決し終えてから既存試合が届く順序を再現する。
    mockCheckExistingMatchResults.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: 10,
                date_and_time: "2026-09-01T00:00:00+09:00",
                match_type: "regular",
                tournament_id: null,
                my_team_id: 1,
                my_team_score: 3,
                opponent_team_score: 2,
                batting_order: "1",
                memo: null,
                opponent_team_id: 1,
                defensive_position: "1",
                inning_format: 9,
                appearance_type: "starter",
              }),
            50,
          ),
        ),
    );
    render(<GameRecord />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /相手チーム/ })).toHaveValue(
        "テスト高校A",
      );
    });
    expect(screen.getByRole("combobox", { name: /自チーム/ })).toHaveValue(
      "テスト高校A",
    );
  });

  it("プロフィールの所属チームが自チームの初期値として表示される", async () => {
    mockGetUserData.mockResolvedValueOnce({ positions: [], team_id: 2 });
    render(<GameRecord />);

    await waitFor(() => {
      expect(screen.getByRole("combobox", { name: /自チーム/ })).toHaveValue(
        "テスト高校B",
      );
    });
  });

  it("チーム一覧は必ず検索語付きで取得し、全件取得のリクエストを出さない", async () => {
    mockCheckExistingMatchResults.mockResolvedValueOnce({
      id: 10,
      date_and_time: "2026-09-01T00:00:00+09:00",
      match_type: "regular",
      tournament_id: null,
      my_team_id: 1,
      my_team_score: 3,
      opponent_team_score: 2,
      batting_order: "1",
      memo: null,
      opponent_team_id: 2,
      defensive_position: "1",
      inning_format: 9,
      appearance_type: "starter",
    });
    mockGetUserData.mockResolvedValueOnce({ positions: [], team_id: 1 });
    const user = userEvent.setup();
    render(<GameRecord />);

    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });
    await waitFor(() => expect(opponentTeamInput).toHaveValue("テスト高校B"));
    await user.tripleClick(opponentTeamInput);
    await user.paste("テスト");
    await findTeamOptions("テスト高校A");

    expect(teamListRequests().length).toBeGreaterThan(0);
    teamListRequests().forEach(([, config]) => {
      expect(config?.params?.q).toBeTruthy();
    });
  });

  it("候補から選ばずに既存チームと同じ名前を入力して保存すると、新規作成せず既存チームの id を使う", async () => {
    const user = userEvent.setup();
    render(<GameRecord />);

    const myTeamInput = await screen.findByRole("combobox", {
      name: /自チーム/,
    });
    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });

    await user.type(myTeamInput, "テスト高校A");
    await user.type(opponentTeamInput, "テスト高校B");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("radio", { name: "未出場" }));
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(teamCreateRequests()).toEqual([]);
    expect(mockAxiosGet).toHaveBeenCalledWith("/api/v1/teams", {
      params: { q: "テスト高校B", limit: 100 },
    });
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({
          my_team_id: 1,
          opponent_team_id: 2,
        }),
      }),
    );
  });

  it("同名チームが複数あるとき、選んだ方のチームの id で保存する", async () => {
    mockTeams = [...defaultTeams, buildTeam(3, "テスト高校B")];
    const user = userEvent.setup();
    render(<GameRecord />);

    const myTeamInput = await screen.findByRole("combobox", {
      name: /自チーム/,
    });
    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });

    await user.type(myTeamInput, "テスト高校A");
    await user.type(opponentTeamInput, "テスト高校");
    const sameNameOptions = await findTeamOptions("テスト高校B");
    await user.click(sameNameOptions[1]);
    // 選択後に同じ名前のまま入力が変わっても、先頭の同名チームにすり替わらないこと。
    await user.type(opponentTeamInput, " ");

    await user.tab();
    await user.click(screen.getByRole("radio", { name: "未出場" }));
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(teamCreateRequests()).toEqual([]);
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({ opponent_team_id: 3 }),
      }),
    );
  });

  it("編集で開いた自チームの名前を解決できなくても、既存試合の自チームの id で保存できる", async () => {
    mockCheckExistingMatchResults.mockResolvedValueOnce({
      id: 10,
      date_and_time: "2026-09-01T00:00:00+09:00",
      match_type: "regular",
      tournament_id: null,
      my_team_id: 7,
      my_team_score: 3,
      opponent_team_score: 2,
      batting_order: "1",
      memo: null,
      opponent_team_id: 2,
      defensive_position: "1",
      inning_format: 9,
      appearance_type: "no_play",
    });
    const user = userEvent.setup();
    render(<GameRecord />);

    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });
    await waitFor(() => expect(opponentTeamInput).toHaveValue("テスト高校B"));
    expect(screen.getByRole("combobox", { name: /自チーム/ })).toHaveValue("");

    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({
          my_team_id: 7,
          opponent_team_id: 2,
        }),
      }),
    );
  });

  it("編集で復元した同名チームは、候補に無いまま入力に触れても別の同名チームにすり替わらない", async () => {
    mockTeams = [...defaultTeams, buildTeam(3, "テスト高校B")];
    mockCheckExistingMatchResults.mockResolvedValueOnce({
      id: 10,
      date_and_time: "2026-09-01T00:00:00+09:00",
      match_type: "regular",
      tournament_id: null,
      my_team_id: 1,
      my_team_score: 3,
      opponent_team_score: 2,
      batting_order: "1",
      memo: null,
      opponent_team_id: 3,
      defensive_position: "1",
      inning_format: 9,
      appearance_type: "no_play",
    });
    const user = userEvent.setup();
    render(<GameRecord />);

    const opponentTeamInput = await screen.findByRole("combobox", {
      name: /相手チーム/,
    });
    await waitFor(() => expect(opponentTeamInput).toHaveValue("テスト高校B"));
    await user.type(opponentTeamInput, " ");

    await user.tab();
    await user.click(screen.getByRole("button", { name: /試合結果まとめ/ }));

    await waitFor(() => {
      expect(mockCreateMatchResults).toHaveBeenCalled();
    });
    expect(mockCreateMatchResults).toHaveBeenCalledWith(
      expect.objectContaining({
        match_result: expect.objectContaining({ opponent_team_id: 3 }),
      }),
    );
  });
});
